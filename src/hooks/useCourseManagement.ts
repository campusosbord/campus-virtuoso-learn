
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Course, CourseForm } from '@/types/admin';

export const useCourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCourses = async () => {
    try {
      console.log('Fetching courses...');
      
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching courses:', error);
        throw error;
      }

      console.log('Courses fetched:', data?.length);
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los cursos. Verifica que tengas permisos de administrador.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCourse = async (formData: CourseForm, editingCourse?: Course) => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "El título es requerido",
        variant: "destructive",
      });
      return false;
    }

    try {
      console.log('Saving course...');
      
      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };

      if (editingCourse) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id);

        if (error) {
          console.error('Error updating course:', error);
          throw error;
        }

        toast({
          title: "Éxito",
          description: "Curso actualizado correctamente",
        });
      } else {
        const { data: currentUser } = await supabase.auth.getUser();
        
        const { error } = await supabase
          .from('courses')
          .insert({
            ...courseData,
            created_by: currentUser.user?.id
          });

        if (error) {
          console.error('Error creating course:', error);
          throw error;
        }

        toast({
          title: "Éxito",
          description: "Curso creado correctamente",
        });
      }

      fetchCourses();
      return true;
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el curso",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este curso?')) {
      return;
    }

    try {
      console.log('Deleting course:', courseId);
      
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) {
        console.error('Error deleting course:', error);
        throw error;
      }

      toast({
        title: "Éxito",
        description: "Curso eliminado correctamente",
      });

      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el curso",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    courses,
    loading,
    saveCourse,
    deleteCourse,
    refetchCourses: fetchCourses
  };
};
