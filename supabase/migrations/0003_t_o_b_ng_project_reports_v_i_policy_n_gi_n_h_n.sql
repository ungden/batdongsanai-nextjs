-- Create project_reports table
CREATE TABLE IF NOT EXISTS public.project_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('financial', 'legal', 'market', 'technical')),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  is_vip_only BOOLEAN DEFAULT false,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.project_reports ENABLE ROW LEVEL SECURITY;

-- Simple policy: anyone can view public reports, authenticated users can view all
CREATE POLICY "view_public_reports" ON public.project_reports
FOR SELECT USING (
  is_vip_only = false 
  OR auth.uid() IS NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_project_reports_project_id ON public.project_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_project_reports_type ON public.project_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_project_reports_vip ON public.project_reports(is_vip_only);