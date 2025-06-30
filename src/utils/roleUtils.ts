
export const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin': return 'destructive' as const;
    case 'teacher': return 'default' as const;
    case 'student': return 'secondary' as const;
    default: return 'outline' as const;
  }
};

export const getRoleDisplayName = (role: string) => {
  switch (role) {
    case 'admin': return 'Administrador';
    case 'teacher': return 'Profesor';
    case 'student': return 'Estudiante';
    default: return role;
  }
};

export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active': return 'default' as const;
    case 'expired': return 'destructive' as const;
    case 'draft': return 'secondary' as const;
    default: return 'outline' as const;
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Activo';
    case 'expired': return 'Expirado';
    case 'draft': return 'Borrador';
    default: return status;
  }
};
