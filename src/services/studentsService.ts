
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/admin';

export const fetchStudents = async (): Promise<Profile[]> => {
  // Fetch all profiles first
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      created_at
    `);

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    throw profilesError;
  }

  // Filter students by role
  const studentsWithRole: Profile[] = [];
  if (profilesData) {
    for (const profile of profilesData) {
      try {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profile.id)
          .eq('role', 'student')
          .maybeSingle();

        if (roleData) {
          studentsWithRole.push({
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            created_at: profile.created_at
          });
        }
      } catch (error) {
        console.error('Error checking role for user:', profile.id, error);
      }
    }
  }

  return studentsWithRole;
};
