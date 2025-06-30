
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
      setIsLoading(true);

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
            status,
            start_date,
            end_date,
            created_at,
            created_by
          ),
          profiles (
            id,
            email,
            full_name,
            created_at
          )
        `);

      if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError);
        throw assignmentsError;
      }

      // Fetch active courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          status,
          start_date,
          end_date,
          created_at,
          created_by
        `)
        .eq('status', 'active');

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        throw coursesError;
      }

      // Fetch all profiles first
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          created_at
        `);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Filter students by role
      const studentsWithRole: Profile[] = [];
      if (profilesData) {
        for (const profile of profilesData) {
          try {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', profile.id)
              .eq('role', 'student')
              .maybeSingle();

            if (roleData) {
              studentsWithRole.push({
                id: profile.id,
                email: profile.email,
                full_name: profile.full_name,
                created_at: profile.created_at
              });
            }
          } catch (error) {
            console.error('Error checking role for user:', profile.id, error);
          }
        }
      }

      // Process assignments
      const validAssignments: Assignment[] = [];
      if (assignmentsData) {
        assignmentsData.forEach((item: any) => {
          if (
            item.courses && 
            typeof item.courses === 'object' && 
            item.profiles && 
            typeof item.profiles === 'object'
          ) {
            validAssignments.push({
              id: item.id,
              course_id: item.course_id,
              user_id: item.user_id,
              assigned_at: item.assigned_at,
              courses: {
                id: item.courses.id,
                title: item.courses.title,
                description: item.courses.description,
                status: item.courses.status,
                start_date: item.courses.start_date,
                end_date: item.courses.end_date,
                created_at: item.courses.created_at,
                created_by: item.courses.created_by,
                profiles: {
                  full_name: null,
                  email: ''
                }
              },
              profiles: {
                id: item.profiles.id,
                email: item.profiles.email,
                full_name: item.profiles.full_name,
                created_at: item.profiles.created_at
              }
            });
          }
        });
      }

      // Process courses
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
            profiles: {
              full_name: null,
              email: ''
            }
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
        description: "No se pudieron cargar los datos. Intenta recargar la página.",
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
      
      if (!currentUser.user) {
        throw new Error('Usuario no autenticado');
      }

      const { error } = await supabase
        .from('course_assignments')
        .insert({
          course_id: courseId,
          user_id: studentId,
          assigned_by: currentUser.user.id
        });

      if (error) {
        console.error('Error assigning course:', error);
        throw error;
      }

      toast({
        title: "Éxito",
        description: "Curso asignado correctamente",
      });

      await fetchData();
    } catch (error) {
      console.error('Error assigning course:', error);
      toast({
        title: "Error",
        description: "No se pudo asignar el curso. Verifica tu conexión.",
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

      await fetchData();
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la asignación. Verifica tu conexión.",
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
