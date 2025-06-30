
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Users, 
  Award,
  Plus,
  Eye,
  Edit
} from 'lucide-react';
import Layout from '@/components/Layout';
import CourseCreation from './CourseCreation';
import StudentProgress from './StudentProgress';

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  start_date: string;
  end_date: string;
  student_count?: number;
}

interface TeacherStats {
  myCourses: number;
  totalStudents: number;
  activeCourses: number;
}

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<TeacherStats>({
    myCourses: 0,
    totalStudents: 0,
    activeCourses: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTeacherData();
    }
  }, [user]);

  const fetchTeacherData = async () => {
    try {
      // Fetch courses created by teacher
      const { data: teacherCourses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('created_by', user?.id);

      if (coursesError) throw coursesError;

      // Fetch student counts for each course
      const coursesWithStudentCount = await Promise.all(
        (teacherCourses || []).map(async (course) => {
          const { count } = await supabase
            .from('course_assignments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id);

          return {
            ...course,
            student_count: count || 0
          };
        })
      );

      setCourses(coursesWithStudentCount);
      
      // Calculate stats
      const totalStudents = coursesWithStudentCount.reduce((sum, course) => sum + (course.student_count || 0), 0);
      const activeCourses = coursesWithStudentCount.filter(c => c.status === 'active').length;

      setStats({
        myCourses: coursesWithStudentCount.length,
        totalStudents,
        activeCourses
      });
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'expired': return 'destructive';
      case 'draft': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'expired': return 'Expirado';
      case 'draft': return 'Borrador';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel del Profesor</h1>
            <p className="text-gray-600">
              Gestiona tus cursos y supervisa el progreso de tus estudiantes
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Curso
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mis Cursos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.myCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCourses}</div>
            </CardContent>
          </Card>
        </div>

        {/* Course Management Tabs */}
        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="courses">Mis Cursos</TabsTrigger>
            <TabsTrigger value="students">Progreso de Estudiantes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses" className="space-y-4">
            {courses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tienes cursos creados
                  </h3>
                  <p className="text-gray-600 text-center mb-4">
                    Comienza creando tu primer curso para tus estudiantes.
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primer Curso
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg line-clamp-2">
                          {course.title}
                        </CardTitle>
                        <Badge variant={getStatusBadgeVariant(course.status)}>
                          {getStatusText(course.status)}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-3">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Estudiantes: {course.student_count}</span>
                        <span>
                          Creado: {new Date(course.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <Button className="flex-1" variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Curso
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="students" className="space-y-4">
            <StudentProgress />
          </TabsContent>
        </Tabs>
      </div>

      {/* Course Creation Dialog */}
      {showCreateForm && (
        <CourseCreation 
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onCourseCreated={fetchTeacherData}
        />
      )}
    </Layout>
  );
};

export default TeacherDashboard;
