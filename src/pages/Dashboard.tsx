
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Award,
  Plus,
  Eye,
  Calendar,
  Clock
} from 'lucide-react';
import Layout from '@/components/Layout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import TeacherDashboard from '@/components/teacher/TeacherDashboard';

interface Course {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  start_date: string;
  end_date: string;
}

interface CourseWithProgress extends Course {
  progress?: {
    percentage_complete: number;
    completed: boolean;
  };
}

const Dashboard = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    activeCourses: 0,
    totalStudents: 0
  });
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    if (user && userRole) {
      fetchDashboardData();
    }
  }, [user, userRole]);

  const fetchDashboardData = async () => {
    try {
      if (userRole === 'student') {
        await fetchStudentData();
      } else if (userRole === 'teacher') {
        await fetchTeacherData();
      } else if (userRole === 'admin') {
        // Admin dashboard is handled by AdminDashboard component
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchStudentData = async () => {
    // Fetch assigned courses with progress
    const { data: assignments } = await supabase
      .from('course_assignments')
      .select(`
        course_id,
        courses (
          id,
          title,
          description,
          status,
          created_at,
          start_date,
          end_date
        )
      `)
      .eq('user_id', user?.id);

    if (assignments) {
      const coursesWithProgress = await Promise.all(
        assignments.map(async (assignment: any) => {
          const course = assignment.courses;
          
          // Fetch progress for this course
          const { data: progress } = await supabase
            .from('course_progress')
            .select('percentage_complete, completed')
            .eq('user_id', user?.id)
            .eq('course_id', course.id)
            .single();

          return {
            ...course,
            progress: progress || { percentage_complete: 0, completed: false }
          };
        })
      );

      setCourses(coursesWithProgress);
      
      setStats({
        totalCourses: coursesWithProgress.length,
        completedCourses: coursesWithProgress.filter(c => c.progress?.completed).length,
        activeCourses: coursesWithProgress.filter(c => c.status === 'active').length,
        totalStudents: 0
      });
    }
  };

  const fetchTeacherData = async () => {
    // Fetch courses created by the teacher
    const { data: teacherCourses } = await supabase
      .from('courses')
      .select('*')
      .eq('created_by', user?.id);

    if (teacherCourses) {
      setCourses(teacherCourses);
      
      // Get student count for teacher's courses
      const { data: assignments } = await supabase
        .from('course_assignments')
        .select('user_id', { count: 'exact' })
        .in('course_id', teacherCourses.map(c => c.id));

      setStats({
        totalCourses: teacherCourses.length,
        completedCourses: 0,
        activeCourses: teacherCourses.filter(c => c.status === 'active').length,
        totalStudents: assignments?.length || 0
      });
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

  if (authLoading || dashboardLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // Route to appropriate dashboard based on user role
  if (userRole === 'admin') {
    return <AdminDashboard />;
  }

  if (userRole === 'teacher') {
    return <TeacherDashboard />;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Bienvenido, {user?.email}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cursos Asignados
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cursos Completados
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCourses}</div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Mis Cursos
          </h2>
          
          {courses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay cursos disponibles
                </h3>
                <p className="text-gray-600 text-center">
                  No tienes cursos asignados aún.
                </p>
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
                    {course.progress && userRole === 'student' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progreso</span>
                          <span>{course.progress.percentage_complete}%</span>
                        </div>
                        <Progress value={course.progress.percentage_complete} />
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(course.start_date || course.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {course.end_date && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(course.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <Button className="w-full" variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Curso
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
