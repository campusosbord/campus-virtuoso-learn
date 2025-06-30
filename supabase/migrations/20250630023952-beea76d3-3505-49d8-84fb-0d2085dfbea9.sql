
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');

-- Create enum for course status
CREATE TYPE public.course_status AS ENUM ('active', 'expired', 'draft');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'student',
  assigned_by UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status public.course_status DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_assignments table (many-to-many between users and courses)
CREATE TABLE public.course_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES public.profiles(id) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

-- Create modules table
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, order_index)
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_id, order_index)
);

-- Create exams table
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  order_index INTEGER NOT NULL,
  passing_score INTEGER DEFAULT 70,
  time_limit INTEGER, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_id, order_index)
);

-- Create course_progress table
CREATE TABLE public.course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  current_module_id UUID REFERENCES public.modules(id),
  percentage_complete INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in minutes
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Create lesson_progress table
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER DEFAULT 0, -- in minutes
  UNIQUE(user_id, lesson_id)
);

-- Create exam_attempts table
CREATE TABLE public.exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  score INTEGER,
  answers JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  passed BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  
  -- Assign default student role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for courses
CREATE POLICY "Admins can manage all courses" ON public.courses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage their own courses" ON public.courses
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'teacher') AND created_by = auth.uid()
  );

CREATE POLICY "Students can view assigned courses" ON public.courses
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'student') AND
    EXISTS (
      SELECT 1 FROM public.course_assignments
      WHERE course_id = courses.id AND user_id = auth.uid()
    )
  );

-- RLS Policies for course_assignments
CREATE POLICY "Admins can manage all assignments" ON public.course_assignments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view assignments for their courses" ON public.course_assignments
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'teacher') AND
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = course_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view their own assignments" ON public.course_assignments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for modules
CREATE POLICY "Admins can manage all modules" ON public.modules
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage modules in their courses" ON public.modules
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'teacher') AND
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = course_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Students can view modules in assigned courses" ON public.modules
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.course_assignments ca
      JOIN public.courses c ON c.id = ca.course_id
      WHERE ca.user_id = auth.uid() AND c.id = course_id
    )
  );

-- RLS Policies for lessons
CREATE POLICY "Admins can manage all lessons" ON public.lessons
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage lessons in their courses" ON public.lessons
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'teacher') AND
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = module_id AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Students can view lessons in assigned courses" ON public.lessons
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.course_assignments ca ON ca.course_id = m.course_id
      WHERE m.id = module_id AND ca.user_id = auth.uid()
    )
  );

-- RLS Policies for exams
CREATE POLICY "Admins can manage all exams" ON public.exams
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage exams in their courses" ON public.exams
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'teacher') AND
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = module_id AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Students can view exams in assigned courses" ON public.exams
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.modules m
      JOIN public.course_assignments ca ON ca.course_id = m.course_id
      WHERE m.id = module_id AND ca.user_id = auth.uid()
    )
  );

-- RLS Policies for progress tracking
CREATE POLICY "Users can manage their own course progress" ON public.course_progress
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Teachers can view progress in their courses" ON public.course_progress
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'teacher') AND
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE id = course_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can view all progress" ON public.course_progress
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage their own lesson progress" ON public.lesson_progress
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own exam attempts" ON public.exam_attempts
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Teachers can view exam attempts in their courses" ON public.exam_attempts
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'teacher') AND
    EXISTS (
      SELECT 1 FROM public.exams e
      JOIN public.modules m ON m.id = e.module_id
      JOIN public.courses c ON c.id = m.course_id
      WHERE e.id = exam_id AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can view all exam attempts" ON public.exam_attempts
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update course expiry status
CREATE OR REPLACE FUNCTION public.update_expired_courses()
RETURNS void
LANGUAGE SQL
SECURITY DEFINER
AS $$
  UPDATE public.courses
  SET status = 'expired'
  WHERE end_date < NOW() AND status = 'active';
$$;

-- Create indexes for better performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_courses_created_by ON public.courses(created_by);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_course_assignments_course_id ON public.course_assignments(course_id);
CREATE INDEX idx_course_assignments_user_id ON public.course_assignments(user_id);
CREATE INDEX idx_modules_course_id ON public.modules(course_id);
CREATE INDEX idx_lessons_module_id ON public.lessons(module_id);
CREATE INDEX idx_exams_module_id ON public.exams(module_id);
CREATE INDEX idx_course_progress_user_id ON public.course_progress(user_id);
CREATE INDEX idx_course_progress_course_id ON public.course_progress(course_id);
CREATE INDEX idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX idx_exam_attempts_user_id ON public.exam_attempts(user_id);
