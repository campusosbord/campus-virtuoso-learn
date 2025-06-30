
import { Assignment, Course } from '@/types/admin';

export const transformAssignmentsData = (assignmentsData: any[]): Assignment[] => {
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

  return validAssignments;
};

export const transformCoursesData = (coursesData: any[]): Course[] => {
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

  return transformedCourses;
};
