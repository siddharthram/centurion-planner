-- Add template tracking columns to documents table
-- These columns track which template version was used to create/edit the document

ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS template_id TEXT,
ADD COLUMN IF NOT EXISTS template_version TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Update any existing rows to have default values
UPDATE public.documents 
SET 
  template_id = type,
  template_version = '1.0.0'
WHERE template_id IS NULL;

