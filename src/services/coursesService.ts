
import { supabase } from '@/integrations/supabase/client';

export const fetchActiveCourses = async () => {
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

  return coursesData;
};
