
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, BookOpen, Users, Award, ArrowRight, Home, User, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, userRole, loading } = useAuth();

  console.log('🏠 Index page render - User:', user?.id, 'Role:', userRole, 'Loading:', loading);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Campus Virtual</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">
                    Bienvenido, {user.email}
                  </span>
                  <Button asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                </>
              ) : (
                <Button asChild>
                  <Link to="/auth">Iniciar Sesión</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <GraduationCap className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Campus Virtual
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Plataforma de aprendizaje virtual completa con gestión de cursos, 
            seguimiento de progreso y evaluaciones interactivas.
          </p>
          
          {/* Action Buttons */}
          <div className="space-x-4 mb-8">
            {user ? (
              <Button asChild size="lg">
                <Link to="/dashboard">
                  Ir al Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link to="/auth">
                  Comenzar Ahora
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          {/* Navigation Links */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Rutas de Navegación Disponibles:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <Home className="h-8 w-8 text-blue-600 mx-auto" />
                  <CardTitle className="text-center">Página Principal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-sm text-gray-600 mb-4">
                    Ruta: <code>/</code>
                  </p>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/">Ir a Inicio</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <User className="h-8 w-8 text-green-600 mx-auto" />
                  <CardTitle className="text-center">Autenticación</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-sm text-gray-600 mb-4">
                    Ruta: <code>/auth</code>
                  </p>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/auth">Ir a Login</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Settings className="h-8 w-8 text-purple-600 mx-auto" />
                  <CardTitle className="text-center">Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-sm text-gray-600 mb-4">
                    Ruta: <code>/dashboard</code> (requiere login)
                  </p>
                  <Button 
                    asChild 
                    className="w-full" 
                    variant="outline"
                    disabled={!user}
                  >
                    <Link to="/dashboard">
                      {user ? 'Ir a Dashboard' : 'Requiere Login'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Debug info for development */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <h3 className="font-medium text-yellow-800 mb-2">🔧 Estado de la Aplicación:</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>• Estado de autenticación: {loading ? 'Cargando...' : user ? `Logueado como ${user.email}` : 'No logueado'}</p>
            <p>• Rol de usuario: {userRole || 'Sin rol asignado'}</p>
            <p>• Página actual: /</p>
            <p>• Navegación disponible: Todas las rutas están funcionando</p>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Gestión de Cursos</CardTitle>
              <CardDescription>
                Crea y organiza cursos con módulos estructurados, 
                lecciones interactivas y contenido multimedia.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Roles de Usuario</CardTitle>
              <CardDescription>
                Sistema completo con roles de administrador, 
                profesor y estudiante con permisos específicos.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Seguimiento de Progreso</CardTitle>
              <CardDescription>
                Monitorea el avance de los estudiantes con 
                métricas detalladas y reportes de rendimiento.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
