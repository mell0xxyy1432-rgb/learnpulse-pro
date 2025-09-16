-- Create enum types
CREATE TYPE public.user_role AS ENUM ('student', 'teacher', 'admin', 'counselor');
CREATE TYPE public.attendance_method AS ENUM ('qr', 'face', 'bluetooth', 'manual');
CREATE TYPE public.activity_type AS ENUM ('study', 'practice', 'quiz', 'project', 'career', 'skill');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  roll_number TEXT UNIQUE,
  role user_role NOT NULL DEFAULT 'student',
  department TEXT,
  semester INTEGER,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create student interests table
CREATE TABLE public.student_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  interest TEXT NOT NULL,
  strength_level INTEGER DEFAULT 1 CHECK (strength_level >= 1 AND strength_level <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create student goals table  
CREATE TABLE public.student_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  goal TEXT NOT NULL,
  target_date DATE,
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  teacher_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  department TEXT,
  semester INTEGER,
  room_number TEXT,
  capacity INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create class enrollments table
CREATE TABLE public.class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(class_id, student_id)
);

-- Create sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  qr_code TEXT,
  qr_expires_at TIMESTAMP WITH TIME ZONE,
  location TEXT,
  is_active BOOLEAN DEFAULT false,
  total_students INTEGER DEFAULT 0,
  present_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  is_present BOOLEAN DEFAULT false,
  method attendance_method,
  marked_at TIMESTAMP WITH TIME ZONE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(session_id, student_id)
);

-- Create activities table
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  activity_type activity_type NOT NULL,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  estimated_minutes INTEGER DEFAULT 30,
  required_interests TEXT[],
  content_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create activity suggestions table
CREATE TABLE public.activity_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  suggested_for_date DATE NOT NULL,
  free_period_start TIME,
  free_period_end TIME,
  completed BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for student_interests
CREATE POLICY "Students can manage own interests" ON public.student_interests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Teachers can view student interests" ON public.student_interests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin', 'counselor'))
);

-- RLS Policies for student_goals
CREATE POLICY "Students can manage own goals" ON public.student_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Teachers can view student goals" ON public.student_goals FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin', 'counselor'))
);

-- RLS Policies for classes
CREATE POLICY "Everyone can view classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Teachers can manage own classes" ON public.classes FOR ALL USING (auth.uid() = teacher_id);
CREATE POLICY "Admins can manage all classes" ON public.classes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for class_enrollments
CREATE POLICY "Students can view own enrollments" ON public.class_enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Teachers can view their class enrollments" ON public.class_enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.classes WHERE id = class_id AND teacher_id = auth.uid())
);
CREATE POLICY "Teachers can manage enrollments for their classes" ON public.class_enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.classes WHERE id = class_id AND teacher_id = auth.uid())
);

-- RLS Policies for sessions
CREATE POLICY "Students can view sessions for enrolled classes" ON public.sessions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.class_enrollments WHERE class_id = sessions.class_id AND student_id = auth.uid())
);
CREATE POLICY "Teachers can manage own sessions" ON public.sessions FOR ALL USING (auth.uid() = teacher_id);

-- RLS Policies for attendance
CREATE POLICY "Students can view own attendance" ON public.attendance FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can mark own attendance" ON public.attendance FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update own attendance" ON public.attendance FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Teachers can view attendance for their sessions" ON public.attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sessions WHERE id = session_id AND teacher_id = auth.uid())
);
CREATE POLICY "Teachers can manage attendance for their sessions" ON public.attendance FOR ALL USING (
  EXISTS (SELECT 1 FROM public.sessions WHERE id = session_id AND teacher_id = auth.uid())
);

-- RLS Policies for activities
CREATE POLICY "Everyone can view active activities" ON public.activities FOR SELECT USING (is_active = true);
CREATE POLICY "Teachers can manage activities" ON public.activities FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin', 'counselor'))
);

-- RLS Policies for activity_suggestions
CREATE POLICY "Students can manage own suggestions" ON public.activity_suggestions FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Teachers can view student suggestions" ON public.activity_suggestions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin', 'counselor'))
);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_goals_updated_at BEFORE UPDATE ON public.student_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();