
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, X } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
}

interface Assignment {
  id: string;
  course_id: string;
  user_id: string;
  assigned_at: string;
  courses: Course;
  profiles: Profile;
}

const CourseAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching assignments data...');

      // Fetch assignments with related data
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('course_assignments')
        .select(`
          id,
          course_id,
          user_id,
          assigned_at,
          courses (
            id,
            title,
            description,
            status
          ),
          profiles (
            id,
            email,
            full_name
          )
        `);

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
        throw assignmentsError;
      }

      // Fetch active courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'active');

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        throw coursesError;
      }

      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name
        `);

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        throw studentsError;
      }

      // Filter students with student role
      const studentsWithRole: Profile[] = [];
      if (studentsData) {
        for (const student of studentsData) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', student.id)
            .eq('role', 'student')
            .single();

          if (roleData) {
            studentsWithRole.push(student);
          }
        }
      }

      // Process assignments data
      const validAssignments: Assignment[] = [];
      if (assignmentsData) {
        assignmentsData.forEach((item: any) => {
          if (
            item.courses && 
            typeof item.courses === 'object' && 
            item.profiles && 
            typeof item.profiles === 'object' && 
            item.profiles.email
          ) {
            validAssignments.push({
              id: item.id,
              course_id: item.course_id,
              user_id: item.user_id,
              assigned_at: item.assigned_at,
              courses: item.courses as Course,
              profiles: item.profiles as Profile
            });
          }
        });
      }

      console.log('Assignments:', validAssignments.length);
      console.log('Courses:', coursesData?.length);
      console.log('Students:', studentsWithRole.length);

      setAssignments(validAssignments);
      setCourses(coursesData || []);
      setStudents(studentsWithRole);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos. Verifica que tengas permisos de administrador.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const assignCourse = async () => {
    if (!selectedCourse || !selectedStudent) {
      toast({
        title: "Error",
        description: "Selecciona un curso y un estudiante",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Assigning course:', selectedCourse, 'to student:', selectedStudent);
      
      const { data: currentUser } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('course_assignments')
        .insert({
          course_id: selectedCourse,
          user_id: selectedStudent,
          assigned_by: currentUser.user?.id
        });

      if (error) {
        console.error('Error assigning course:', error);
        throw error;
      }

      toast({
        title: "Éxito",
        description: "Curso asignado correctamente",
      });

      fetchData();
      setIsDialogOpen(false);
      setSelectedCourse('');
      setSelectedStudent('');
    } catch (error) {
      console.error('Error assigning course:', error);
      toast({
        title: "Error",
        description: "No se pudo asignar el curso",
        variant: "destructive",
      });
    }
  };

  const removeAssignment = async (assignmentId: string) => {
    try {
      console.log('Removing assignment:', assignmentId);
      
      const { error } = await supabase
        .from('course_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) {
        console.error('Error removing assignment:', error);
        throw error;
      }

      toast({
        title: "Éxito",
        description: "Asignación eliminada correctamente",
      });

      fetchData();
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la asignación",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
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
            <CardTitle>Asignaciones de Cursos</CardTitle>
            <CardDescription>
              Gestiona las asignaciones de cursos a estudiantes
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Asignar Curso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Asignar Curso a Estudiante</DialogTitle>
                <DialogDescription>
                  Selecciona un curso y un estudiante para crear la asignación
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Curso</label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Estudiante</label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estudiante" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name || student.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={assignCourse}>
                    Asignar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hay asignaciones de cursos</p>
          </div>
        ) : (
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
                      onClick={() => removeAssignment(assignment.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remover
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseAssignments;
