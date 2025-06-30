
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import UsersTable from './tables/UsersTable';

const UserManagement = () => {
  const { users, loading, updateUserRole } = useUserManagement();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestión de Usuarios
            </CardTitle>
            <CardDescription>
              Administra usuarios y sus roles en el sistema
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <UsersTable users={users} onUpdateRole={updateUserRole} />
      </CardContent>
    </Card>
  );
};

export default UserManagement;
