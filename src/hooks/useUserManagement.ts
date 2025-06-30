
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserWithRole } from '@/types/admin';

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles fetched:', profiles?.length);

      const usersWithRoles: UserWithRole[] = [];
      
      if (profiles) {
        for (const profile of profiles) {
          const { data: roles, error: rolesError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', profile.id);

          if (rolesError) {
            console.error(`Error fetching roles for user ${profile.id}:`, rolesError);
            continue;
          }

          usersWithRoles.push({
            ...profile,
            user_roles: roles || []
          });
        }
      }

      console.log('Users with roles:', usersWithRoles.length);
      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios. Verifica que tengas permisos de administrador.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'teacher' | 'student') => {
    try {
      console.log('Updating user role:', userId, role);
      
      const { data: currentUser } = await supabase.auth.getUser();
      
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error deleting existing role:', deleteError);
        throw deleteError;
      }

      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role,
          assigned_by: currentUser.user?.id
        });

      if (insertError) {
        console.error('Error inserting new role:', insertError);
        throw insertError;
      }

      toast({
        title: "Éxito",
        description: "Rol actualizado correctamente",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol del usuario",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    updateUserRole,
    refetchUsers: fetchUsers
  };
};
