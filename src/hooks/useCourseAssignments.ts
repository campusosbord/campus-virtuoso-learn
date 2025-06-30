
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Assignment, Course, Profile } from '@/types/admin';
import { 
  fetchCourseAssignments, 
  assignCourseToStudent, 
  removeCourseAssignment 
} from '@/services/courseAssignmentsService';
import { fetchActiveCourses } from '@/services/coursesService';
import { fetchStudents } from '@/services/studentsService';
import { 
  transformAssignmentsData, 
  transformCoursesData 
} from '@/utils/courseAssignmentsTransformers';

export const useCourseAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch all data in parallel
      const [assignmentsData, coursesData, studentsData] = await Promise.all([
        fetchCourseAssignments(),
        fetchActiveCourses(),
        fetchStudents()
      ]);

      // Transform and set data
      setAssignments(transformAssignmentsData(assignmentsData || []));
      setCourses(transformCoursesData(coursesData || []));
      setStudents(studentsData);
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
      await assignCourseToStudent(courseId, studentId);
      
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
      await removeCourseAssignment(assignmentId);
      
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
