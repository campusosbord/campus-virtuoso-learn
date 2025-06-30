
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCourseAssignments } from '@/hooks/useCourseAssignments';
import AssignCourseDialog from './dialogs/AssignCourseDialog';
import AssignmentsTable from './tables/AssignmentsTable';

const CourseAssignments = () => {
  const { 
    assignments, 
    courses, 
    students, 
    isLoading, 
    assignCourse, 
    removeAssignment 
  } = useCourseAssignments();

  if (isLoading) {
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
            <CardTitle>Asignaciones de Cursos</CardTitle>
            <CardDescription>
              Gestiona las asignaciones de cursos a estudiantes
            </CardDescription>
          </div>
          <AssignCourseDialog 
            courses={courses} 
            students={students} 
            onAssignCourse={assignCourse} 
          />
        </div>
      </CardHeader>
      <CardContent>
        <AssignmentsTable 
          assignments={assignments} 
          onRemoveAssignment={removeAssignment} 
        />
      </CardContent>
    </Card>
  );
};

export default CourseAssignments;
