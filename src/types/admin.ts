
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'teacher' | 'student';
  assigned_at: string;
}

export interface UserWithRole extends Profile {
  user_roles: UserRole[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'expired' | 'draft';
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  created_by: string;
  profiles: {
    full_name: string | null;
    email: string;
  };
}

export interface Assignment {
  id: string;
  course_id: string;
  user_id: string;
  assigned_at: string;
  courses: Course;
  profiles: Profile;
}

export interface CourseForm {
  title: string;
  description: string;
  status: 'active' | 'expired' | 'draft';
  start_date: string;
  end_date: string;
}
