
import { supabase } from '@/integrations/supabase/client';

export const fetchCourseAssignments = async () => {
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

  return assignmentsData;
};

export const assignCourseToStudent = async (courseId: string, studentId: string) => {
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
};

export const removeCourseAssignment = async (assignmentId: string) => {
  console.log('Removing assignment:', assignmentId);
  
  const { error } = await supabase
    .from('course_assignments')
    .delete()
    .eq('id', assignmentId);

  if (error) {
    console.error('Error removing assignment:', error);
    throw error;
  }
};
