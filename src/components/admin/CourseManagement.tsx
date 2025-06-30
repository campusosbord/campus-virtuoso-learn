
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCourseManagement } from '@/hooks/useCourseManagement';
import { Course } from '@/types/admin';
import CourseFormDialog from './dialogs/CourseFormDialog';
import CoursesTable from './tables/CoursesTable';

const CourseManagement = () => {
  const { courses, loading, saveCourse, deleteCourse } = useCourseManagement();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const openCreateDialog = () => {
    setEditingCourse(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gestión de Cursos</CardTitle>
            <CardDescription>
              Crea, edita y administra todos los cursos del sistema
            </CardDescription>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Curso
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <CoursesTable 
          courses={courses} 
          onEditCourse={openEditDialog} 
          onDeleteCourse={deleteCourse} 
        />
        
        <CourseFormDialog 
          isOpen={isDialogOpen} 
          onOpenChange={setIsDialogOpen}
          editingCourse={editingCourse}
          onSave={saveCourse}
        />
      </CardContent>
    </Card>
  );
};

export default CourseManagement;
