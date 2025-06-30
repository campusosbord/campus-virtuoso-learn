
-- Drop and recreate policies to ensure they're properly set up
-- First, drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all courses" ON public.courses;
DROP POLICY IF EXISTS "Teachers can manage their own courses" ON public.courses;
DROP POLICY IF EXISTS "Students can view assigned courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can manage all assignments" ON public.course_assignments;
DROP POLICY IF EXISTS "Teachers can view assignments for their courses" ON public.course_assignments;
DROP POLICY IF EXISTS "Users can view their own assignments" ON public.course_assignments;
DROP POLICY IF EXISTS "Admins can manage all modules" ON public.modules;
DROP POLICY IF EXISTS "Teachers can manage modules in their courses" ON public.modules;
DROP POLICY IF EXISTS "Students can view modules in assigned courses" ON public.modules;
DROP POLICY IF EXISTS "Admins can manage all lessons" ON public.lessons;
DROP POLICY IF EXISTS "Teachers can manage lessons in their courses" ON public.lessons;
DROP POLICY IF EXISTS "Students can view lessons in assigned courses" ON public.lessons;
DROP POLICY IF EXISTS "Admins can manage all exams" ON public.exams;
DROP POLICY IF EXISTS "Teachers can manage exams in their courses" ON public.exams;
DROP POLICY IF EXISTS "Students can view exams in assigned courses" ON public.exams;
DROP POLICY IF EXISTS "Users can manage their own course progress" ON public.course_progress;
DROP POLICY IF EXISTS "Teachers can view progress in their courses" ON public.course_progress;
DROP POLICY IF EXISTS "Admins can view all progress" ON public.course_progress;
DROP POLICY IF EXISTS "Users can manage their own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can manage their own exam attempts" ON public.exam_attempts;
DROP POLICY IF EXISTS "Teachers can view exam attempts in their courses" ON public.exam_attempts;
DROP POLICY IF EXISTS "Admins can view all exam attempts" ON public.exam_attempts;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for courses
CREATE POLICY "Teachers can view own courses" ON public.courses
FOR SELECT USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can view assigned courses" ON public.courses
FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM public.course_assignments 
    WHERE course_id = courses.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can create courses" ON public.courses
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can update own courses" ON public.courses
FOR UPDATE USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete courses" ON public.courses
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for modules
CREATE POLICY "Users can view modules of accessible courses" ON public.modules
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = modules.course_id 
    AND (
      public.has_role(auth.uid(), 'admin') OR
      created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.course_assignments 
        WHERE course_id = courses.id AND user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Course creators can manage modules" ON public.modules
FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = modules.course_id AND created_by = auth.uid()
  )
);

-- RLS Policies for lessons
CREATE POLICY "Users can view lessons of accessible courses" ON public.lessons
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = lessons.module_id 
    AND (
      public.has_role(auth.uid(), 'admin') OR
      c.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.course_assignments 
        WHERE course_id = c.id AND user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Course creators can manage lessons" ON public.lessons
FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = lessons.module_id AND c.created_by = auth.uid()
  )
);

-- RLS Policies for exams
CREATE POLICY "Users can view exams of accessible courses" ON public.exams
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = exams.module_id 
    AND (
      public.has_role(auth.uid(), 'admin') OR
      c.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.course_assignments 
        WHERE course_id = c.id AND user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Course creators can manage exams" ON public.exams
FOR ALL USING (
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = exams.module_id AND c.created_by = auth.uid()
  )
);

-- RLS Policies for course_assignments
CREATE POLICY "Admins can manage all assignments" ON public.course_assignments
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view assignments for their courses" ON public.course_assignments
FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = course_assignments.course_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Students can view own assignments" ON public.course_assignments
FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for course_progress
CREATE POLICY "Users can view own progress" ON public.course_progress
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.course_progress
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view progress for their courses" ON public.course_progress
FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = course_progress.course_id AND created_by = auth.uid()
  )
);

-- RLS Policies for lesson_progress
CREATE POLICY "Users can manage own lesson progress" ON public.lesson_progress
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view lesson progress for their courses" ON public.lesson_progress
FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (
    SELECT 1 FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = lesson_progress.lesson_id AND c.created_by = auth.uid()
  )
);

-- RLS Policies for exam_attempts
CREATE POLICY "Users can manage own exam attempts" ON public.exam_attempts
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view exam attempts for their courses" ON public.exam_attempts
FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (
    SELECT 1 FROM public.exams e
    JOIN public.modules m ON m.id = e.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE e.id = exam_attempts.exam_id AND c.created_by = auth.uid()
  )
);

-- Function to automatically expire courses
CREATE OR REPLACE FUNCTION public.expire_old_courses()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.courses
  SET status = 'expired'
  WHERE end_date < NOW() AND status = 'active';
$$;

-- Function to get course completion percentage
CREATE OR REPLACE FUNCTION public.get_course_completion_percentage(course_id_param UUID, user_id_param UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH course_content AS (
    SELECT 
      COUNT(l.id) as total_lessons,
      COUNT(e.id) as total_exams
    FROM modules m
    LEFT JOIN lessons l ON l.module_id = m.id
    LEFT JOIN exams e ON e.module_id = m.id
    WHERE m.course_id = course_id_param
  ),
  user_progress AS (
    SELECT 
      COUNT(CASE WHEN lp.completed = true THEN 1 END) as completed_lessons,
      COUNT(CASE WHEN ea.passed = true THEN 1 END) as passed_exams
    FROM modules m
    LEFT JOIN lessons l ON l.module_id = m.id
    LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.user_id = user_id_param
    LEFT JOIN exams e ON e.module_id = m.id
    LEFT JOIN exam_attempts ea ON ea.exam_id = e.id AND ea.user_id = user_id_param
    WHERE m.course_id = course_id_param
  )
  SELECT 
    CASE 
      WHEN (cc.total_lessons + cc.total_exams) = 0 THEN 0
      ELSE ROUND((up.completed_lessons + up.passed_exams) * 100.0 / (cc.total_lessons + cc.total_exams))::INTEGER
    END
  FROM course_content cc, user_progress up;
$$;
