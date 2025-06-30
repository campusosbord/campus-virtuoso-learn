
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit } from 'lucide-react';
import { UserWithRole } from '@/types/admin';

interface UserRoleEditDialogProps {
  user: UserWithRole;
  onUpdateRole: (userId: string, role: 'admin' | 'teacher' | 'student') => Promise<void>;
}

const UserRoleEditDialog = ({ user, onUpdateRole }: UserRoleEditDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newRole, setNewRole] = useState<'admin' | 'teacher' | 'student'>(
    user.user_roles[0]?.role || 'student'
  );

  const handleSubmit = async () => {
    await onUpdateRole(user.id, newRole);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setNewRole(user.user_roles[0]?.role || 'student');
          }}
        >
          <Edit className="h-4 w-4 mr-1" />
          Editar Rol
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Rol de Usuario</DialogTitle>
          <DialogDescription>
            Cambiar el rol de {user.full_name || user.email}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="role">Nuevo Rol</Label>
            <Select value={newRole} onValueChange={(value: 'admin' | 'teacher' | 'student') => setNewRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Estudiante</SelectItem>
                <SelectItem value="teacher">Profesor</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              Actualizar Rol
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserRoleEditDialog;
