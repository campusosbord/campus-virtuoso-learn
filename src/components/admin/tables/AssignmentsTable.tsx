
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X } from 'lucide-react';
import { Assignment } from '@/types/admin';

interface AssignmentsTableProps {
  assignments: Assignment[];
  onRemoveAssignment: (assignmentId: string) => Promise<void>;
}

const AssignmentsTable = ({ assignments, onRemoveAssignment }: AssignmentsTableProps) => {
  if (assignments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay asignaciones de cursos</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Curso</TableHead>
          <TableHead>Estudiante</TableHead>
          <TableHead>Fecha de Asignación</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {assignments.map((assignment) => (
          <TableRow key={assignment.id}>
            <TableCell>
              <div className="font-medium">
                {assignment.courses.title}
              </div>
            </TableCell>
            <TableCell>
              {assignment.profiles.full_name || assignment.profiles.email}
            </TableCell>
            <TableCell>
              {new Date(assignment.assigned_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Badge variant={assignment.courses.status === 'active' ? 'default' : 'secondary'}>
                {assignment.courses.status === 'active' ? 'Activo' : 'Inactivo'}
              </Badge>
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemoveAssignment(assignment.id)}
              >
                <X className="h-4 w-4 mr-1" />
                Remover
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AssignmentsTable;
