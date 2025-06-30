
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { Course } from '@/types/admin';
import { getStatusBadgeVariant, getStatusText } from '@/utils/roleUtils';

interface CoursesTableProps {
  courses: Course[];
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
}

const CoursesTable = ({ courses, onEditCourse, onDeleteCourse }: CoursesTableProps) => {
  if (courses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay cursos disponibles</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Creador</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fecha de Inicio</TableHead>
          <TableHead>Fecha de Fin</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={course.id}>
            <TableCell>
              <div className="font-medium">{course.title}</div>
              {course.description && (
                <div className="text-sm text-gray-500 truncate max-w-xs">
                  {course.description}
                </div>
              )}
            </TableCell>
            <TableCell>
              {course.profiles.full_name || course.profiles.email}
            </TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(course.status)}>
                {getStatusText(course.status)}
              </Badge>
            </TableCell>
            <TableCell>
              {course.start_date 
                ? new Date(course.start_date).toLocaleDateString()
                : '-'
              }
            </TableCell>
            <TableCell>
              {course.end_date 
                ? new Date(course.end_date).toLocaleDateString()
                : '-'
              }
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditCourse(course)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteCourse(course.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CoursesTable;
