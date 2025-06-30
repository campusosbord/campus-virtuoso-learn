
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen } from 'lucide-react';

interface Course {
  id: string;
  title: string;
}

interface StudentProgress {
  user_id: string;
  course_id: string;
  percentage_complete: number;
  completed: boolean;
  last_accessed: string;
  profiles: {
    full_name: string | null;
    email: string;
  };
  courses: {
    title: string;
  };
}

const StudentProgress = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTeacherCourses();
    }
  }, [user]);

  useEffect(() => {
    if (courses.length > 0) {
      fetchStudentProgress();
    }
  }, [courses, selectedCourse]);

  const fetchTeacherCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .eq('created_by', user?.id);

      if (error) throw error;

      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching teacher courses:', error);
    }
  };

  const fetchStudentProgress = async () => {
    try {
      let query = supabase
        .from('course_progress')
        .select(`
          *,
          profiles (full_name, email),
          courses (title)
        `);

      // Filter by course if specific course is selected
      if (selectedCourse !== 'all') {
        query = query.eq('course_id', selectedCourse);
      } else {
        // Only show progress for teacher's courses
        const courseIds = courses.map(c => c.id);
        if (courseIds.length > 0) {
          query = query.in('course_id', courseIds);
        }
      }

      const { data, error } = await query.order('last_accessed', { ascending: false });

      if (error) throw error;

      setStudentProgress(data || []);
    } catch (error) {
      console.error('Error fetching student progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Progreso de Estudiantes
          </CardTitle>
          <CardDescription>
            Supervisa el progreso de tus estudiantes en los cursos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Filtrar por curso:</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los cursos</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle del Progreso</CardTitle>
        </CardHeader>
        <CardContent>
          {studentProgress.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay datos de progreso
              </h3>
              <p className="text-gray-600">
                Los estudiantes aún no han comenzado los cursos o no hay estudiantes asignados.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último Acceso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentProgress.map((progress) => (
                  <TableRow key={`${progress.user_id}-${progress.course_id}`}>
                    <TableCell>
                      <div className="font-medium">
                        {progress.profiles.full_name || progress.profiles.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {progress.profiles.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {progress.courses.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Progress value={progress.percentage_complete} className="w-20" />
                        <span className="text-sm text-gray-600">
                          {progress.percentage_complete}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={progress.completed ? 'default' : 'secondary'}>
                        {progress.completed ? 'Completado' : 'En Progreso'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {progress.last_accessed 
                        ? new Date(progress.last_accessed).toLocaleDateString()
                        : 'Nunca'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProgress;
