
-- First, let's drop any conflicting policies and recreate them properly
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Teachers can view own courses" ON public.courses;
DROP POLICY IF EXISTS "Students can view assigned courses" ON public.courses;
DROP POLICY IF EXISTS "Teachers can create courses" ON public.courses;
DROP POLICY IF EXISTS "Teachers can update own courses" ON public.courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON public.courses;
DROP POLICY IF EXISTS "Users can view modules of accessible courses" ON public.modules;
DROP POLICY IF EXISTS "Course creators can manage modules" ON public.modules;
DROP POLICY IF EXISTS "Users can view lessons of accessible courses" ON public.lessons;
DROP POLICY IF EXISTS "Course creators can manage lessons" ON public.lessons;
DROP POLICY IF EXISTS "Users can view exams of accessible courses" ON public.exams;
DROP POLICY IF EXISTS "Course creators can manage exams" ON public.exams;
DROP POLICY IF EXISTS "Admins can manage all assignments" ON public.course_assignments;
DROP POLICY IF EXISTS "Teachers can view assignments for their courses" ON public.course_assignments;
DROP POLICY IF EXISTS "Students can view own assignments" ON public.course_assignments;
DROP POLICY IF EXISTS "Users can view own progress" ON public.course_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.course_progress;
DROP POLICY IF EXISTS "Teachers can view progress for their courses" ON public.course_progress;
DROP POLICY IF EXISTS "Users can manage own lesson progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Teachers can view lesson progress for their courses" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can manage own exam attempts" ON public.exam_attempts;
DROP POLICY IF EXISTS "Teachers can view exam attempts for their courses" ON public.exam_attempts;

-- Create comprehensive RLS policies for the LMS

-- PROFILES TABLE POLICIES
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert profiles" ON public.profiles
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- USER_ROLES TABLE POLICIES
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- COURSES TABLE POLICIES
CREATE POLICY "Admins can manage all courses" ON public.courses
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view own courses" ON public.courses
FOR SELECT USING (
  public.has_role(auth.uid(), 'teacher') AND created_by = auth.uid()
);

CREATE POLICY "Teachers can create courses" ON public.courses
FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'teacher') AND created_by = auth.uid()
);

CREATE POLICY "Teachers can update own courses" ON public.courses
FOR UPDATE USING (
  public.has_role(auth.uid(), 'teacher') AND created_by = auth.uid()
);

CREATE POLICY "Students can view assigned courses" ON public.courses
FOR SELECT USING (
  public.has_role(auth.uid(), 'student') AND
  EXISTS (
    SELECT 1 FROM public.course_assignments 
    WHERE course_id = courses.id AND user_id = auth.uid()
  )
);

-- MODULES TABLE POLICIES
CREATE POLICY "Admins can manage all modules" ON public.modules
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage modules in own courses" ON public.modules
FOR ALL USING (
  public.has_role(auth.uid(), 'teacher') AND
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = modules.course_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Students can view modules in assigned courses" ON public.modules
FOR SELECT USING (
  public.has_role(auth.uid(), 'student') AND
  EXISTS (
    SELECT 1 FROM public.course_assignments ca
    WHERE ca.course_id = modules.course_id AND ca.user_id = auth.uid()
  )
);

-- LESSONS TABLE POLICIES
CREATE POLICY "Admins can manage all lessons" ON public.lessons
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage lessons in own courses" ON public.lessons
FOR ALL USING (
  public.has_role(auth.uid(), 'teacher') AND
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = lessons.module_id AND c.created_by = auth.uid()
  )
);

CREATE POLICY "Students can view lessons in assigned courses" ON public.lessons
FOR SELECT USING (
  public.has_role(auth.uid(), 'student') AND
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.course_assignments ca ON ca.course_id = m.course_id
    WHERE m.id = lessons.module_id AND ca.user_id = auth.uid()
  )
);

-- EXAMS TABLE POLICIES
CREATE POLICY "Admins can manage all exams" ON public.exams
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can manage exams in own courses" ON public.exams
FOR ALL USING (
  public.has_role(auth.uid(), 'teacher') AND
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = exams.module_id AND c.created_by = auth.uid()
  )
);

CREATE POLICY "Students can view exams in assigned courses" ON public.exams
FOR SELECT USING (
  public.has_role(auth.uid(), 'student') AND
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.course_assignments ca ON ca.course_id = m.course_id
    WHERE m.id = exams.module_id AND ca.user_id = auth.uid()
  )
);

-- COURSE_ASSIGNMENTS TABLE POLICIES
CREATE POLICY "Admins can manage all assignments" ON public.course_assignments
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view assignments for own courses" ON public.course_assignments
FOR SELECT USING (
  public.has_role(auth.uid(), 'teacher') AND
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = course_assignments.course_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Students can view own assignments" ON public.course_assignments
FOR SELECT USING (
  public.has_role(auth.uid(), 'student') AND user_id = auth.uid()
);

-- COURSE_PROGRESS TABLE POLICIES
CREATE POLICY "Admins can view all progress" ON public.course_progress
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view progress for own courses" ON public.course_progress
FOR SELECT USING (
  public.has_role(auth.uid(), 'teacher') AND
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = course_progress.course_id AND created_by = auth.uid()
  )
);

CREATE POLICY "Students can manage own progress" ON public.course_progress
FOR ALL USING (
  public.has_role(auth.uid(), 'student') AND user_id = auth.uid()
);

-- LESSON_PROGRESS TABLE POLICIES
CREATE POLICY "Admins can view all lesson progress" ON public.lesson_progress
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view lesson progress for own courses" ON public.lesson_progress
FOR SELECT USING (
  public.has_role(auth.uid(), 'teacher') AND
  EXISTS (
    SELECT 1 FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = lesson_progress.lesson_id AND c.created_by = auth.uid()
  )
);

CREATE POLICY "Students can manage own lesson progress" ON public.lesson_progress
FOR ALL USING (
  public.has_role(auth.uid(), 'student') AND user_id = auth.uid()
);

-- EXAM_ATTEMPTS TABLE POLICIES
CREATE POLICY "Admins can view all exam attempts" ON public.exam_attempts
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view exam attempts for own courses" ON public.exam_attempts
FOR SELECT USING (
  public.has_role(auth.uid(), 'teacher') AND
  EXISTS (
    SELECT 1 FROM public.exams e
    JOIN public.modules m ON m.id = e.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE e.id = exam_attempts.exam_id AND c.created_by = auth.uid()
  )
);

CREATE POLICY "Students can manage own exam attempts" ON public.exam_attempts
FOR ALL USING (
  public.has_role(auth.uid(), 'student') AND user_id = auth.uid()
);

-- Create a function to check if a course has expired and update its status
CREATE OR REPLACE FUNCTION public.check_course_expiry()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.courses
  SET status = 'expired'
  WHERE end_date < NOW() AND status = 'active';
$$;
