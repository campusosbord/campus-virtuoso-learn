import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Assignment, Course, Profile } from '@/types/admin';

export const useCourseAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      console.log('Fetching assignments data...');

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

      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .eq('status', 'active');

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        throw coursesError;
      }

      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at
        `);

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        throw studentsError;
      }

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
            studentsWithRole.push({
              id: student.id,
              email: student.email,
              full_name: student.full_name,
              created_at: student.created_at
            });
          }
        }
      }

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

      // Transform courses data to match Course type
      const transformedCourses: Course[] = [];
      if (coursesData) {
        coursesData.forEach((course: any) => {
          transformedCourses.push({
            id: course.id,
            title: course.title,
            description: course.description,
            status: course.status,
            start_date: course.start_date,
            end_date: course.end_date,
            created_at: course.created_at,
            created_by: course.created_by,
            profiles: course.profiles
          });
        });
      }

      setAssignments(validAssignments);
      setCourses(transformedCourses);
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

  const assignCourse = async (courseId: string, studentId: string) => {
    try {
      console.log('Assigning course:', courseId, 'to student:', studentId);
      
      const { data: currentUser } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('course_assignments')
        .insert({
          course_id: courseId,
          user_id: studentId,
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

  useEffect(() => {
    fetchData();
  }, []);

  return {
    assignments,
    courses,
    students,
    isLoading,
    assignCourse,
    removeAssignment,
    refetchData: fetchData
  };
};
