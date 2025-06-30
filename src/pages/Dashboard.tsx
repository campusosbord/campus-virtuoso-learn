
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from '@/components/admin/AdminDashboard';
import TeacherDashboard from '@/components/teacher/TeacherDashboard';
import Layout from '@/components/Layout';

const Dashboard = () => {
  const { user, userRole, loading } = useAuth();

  console.log('📊 Dashboard render - User:', user?.id, 'Role:', userRole, 'Loading:', loading);

  if (loading) {
    console.log('⏳ Dashboard is loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ No user found in Dashboard');
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error de autenticación
          </h2>
          <p className="text-gray-600 mb-4">
            No se pudo cargar la información del usuario.
          </p>
          <button 
            onClick={() => window.location.href = '/auth'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Ir a Login
          </button>
        </div>
      </Layout>
    );
  }

  console.log('🎯 Rendering dashboard for role:', userRole);

  // Render based on user role
  if (userRole === 'admin') {
    console.log('👑 Rendering Admin Dashboard');
    return <AdminDashboard />;
  }

  if (userRole === 'teacher') {
    console.log('👨‍🏫 Rendering Teacher Dashboard');
    return <TeacherDashboard />;
  }

  // Default student dashboard
  console.log('👨‍🎓 Rendering Student Dashboard (default)');
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel del Estudiante</h1>
          <p className="text-gray-600">
            Bienvenido a tu dashboard de estudiante, {user.email}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Mis Cursos</h2>
          <p className="text-gray-600">
            Aquí aparecerán los cursos que tienes asignados.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Progreso</h2>
          <p className="text-gray-600">
            Aquí podrás ver tu progreso en los cursos.
          </p>
        </div>

        {/* Debug info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">🔧 Info de Debug:</h3>
          <p className="text-sm text-yellow-700">
            Usuario: {user.email} | Rol: {userRole || 'Sin rol'} | ID: {user.id}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
