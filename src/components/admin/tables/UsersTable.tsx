
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserWithRole } from '@/types/admin';
import { getRoleBadgeVariant, getRoleDisplayName } from '@/utils/roleUtils';
import UserRoleEditDialog from '../dialogs/UserRoleEditDialog';

interface UsersTableProps {
  users: UserWithRole[];
  onUpdateRole: (userId: string, role: 'admin' | 'teacher' | 'student') => Promise<void>;
}

const UsersTable = ({ users, onUpdateRole }: UsersTableProps) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No se encontraron usuarios</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usuario</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Fecha de Registro</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="font-medium">
                {user.full_name || 'Sin nombre'}
              </div>
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant={getRoleBadgeVariant(user.user_roles[0]?.role || 'student')}>
                {getRoleDisplayName(user.user_roles[0]?.role || 'student')}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(user.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <UserRoleEditDialog user={user} onUpdateRole={onUpdateRole} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UsersTable;
