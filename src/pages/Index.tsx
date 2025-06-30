
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, BookOpen, Users, Award, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <GraduationCap className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Campus Virtual
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Plataforma de aprendizaje virtual completa con gestión de cursos, 
            seguimiento de progreso y evaluaciones interactivas.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link to="/auth">
                Comenzar Ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Gestión de Cursos</CardTitle>
              <CardDescription>
                Crea y organiza cursos con módulos estructurados, 
                lecciones interactivas y contenido multimedia.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Roles de Usuario</CardTitle>
              <CardDescription>
                Sistema completo con roles de administrador, 
                profesor y estudiante con permisos específicos.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Award className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Seguimiento de Progreso</CardTitle>
              <CardDescription>
                Monitorea el avance de los estudiantes con 
                métricas detalladas y reportes de rendimiento.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            Características Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Para Profesores
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Crear y gestionar cursos completos</li>
                <li>• Organizar contenido en módulos y lecciones</li>
                <li>• Crear exámenes con preguntas personalizadas</li>
                <li>• Monitorear progreso de estudiantes</li>
                <li>• Asignar cursos a estudiantes específicos</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Para Estudiantes
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Acceder a cursos asignados</li>
                <li>• Seguir progreso personalizado</li>
                <li>• Realizar exámenes y obtener calificaciones</li>
                <li>• Ver historial de aprendizaje</li>
                <li>• Dashboard intuitivo y fácil de usar</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Únete a Campus Virtual y transforma tu experiencia de aprendizaje
          </p>
          <Button asChild size="lg">
            <Link to="/auth">
              Acceder a la Plataforma
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
