-- Create projects table for content management
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  developer TEXT NOT NULL,
  image TEXT,
  legal_score INTEGER DEFAULT 8 CHECK (legal_score >= 1 AND legal_score <= 10),
  status TEXT DEFAULT 'good' CHECK (status IN ('good', 'warning', 'danger')),
  price_range TEXT,
  price_per_sqm BIGINT DEFAULT 0,
  completion_date TEXT,
  description TEXT,
  amenities TEXT[], -- Array of amenities
  total_units INTEGER DEFAULT 0,
  sold_units INTEGER DEFAULT 0,
  floors INTEGER DEFAULT 0,
  apartment_types TEXT[], -- Array of apartment types
  launch_price BIGINT,
  launch_date DATE,
  current_price BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects table
CREATE POLICY "Anyone can view projects" 
ON public.projects 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update projects" 
ON public.projects 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete projects" 
ON public.projects 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample projects data
INSERT INTO public.projects (
  name, location, city, district, developer, image, legal_score, status, 
  price_range, price_per_sqm, completion_date, description,
  amenities, total_units, sold_units, floors, apartment_types,
  launch_price, launch_date, current_price
) VALUES 
(
  'Vinhomes Grand Park',
  'Quận 9, TP. Hồ Chí Minh',
  'TP. Hồ Chí Minh',
  'Quận 9',
  'Vingroup',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
  9,
  'good',
  '2.5 - 4.2 tỷ',
  45000000,
  'Q4/2025',
  'Vinhomes Grand Park là siêu đô thị hiện đại bậc nhất Việt Nam',
  ARRAY['Hồ bơi', 'Gym', 'Sân tennis', 'Công viên', 'Siêu thị'],
  1250,
  890,
  35,
  ARRAY['1PN', '2PN', '3PN', 'Penthouse'],
  38000000,
  '2023-06-15',
  45000000
),
(
  'Masterise Homes',
  'Quận 2, TP. Hồ Chí Minh',
  'TP. Hồ Chí Minh',
  'Quận 2',
  'Masterise Group',
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
  7,
  'warning',
  '3.8 - 6.5 tỷ',
  65000000,
  'Q2/2026',
  'Dự án cao cấp với nhiều tiện ích hiện đại',
  ARRAY['Hồ bơi vô cực', 'Spa', 'Golf', 'Marina'],
  800,
  420,
  50,
  ARRAY['2PN', '3PN', '4PN', 'Penthouse'],
  58000000,
  '2023-03-10',
  65000000
);