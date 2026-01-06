-- Update the documents table to support the new life_vision type
-- Replace the CHECK constraint to allow life_vision instead of north_star and vivid_vision

-- First, drop the old constraint
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_type_check;

-- Add the new constraint with updated valid types
ALTER TABLE public.documents ADD CONSTRAINT documents_type_check 
  CHECK (type IN ('life_vision', 'principles', 'memory', 'north_star', 'vivid_vision'));

-- Note: We keep 'north_star' and 'vivid_vision' for backwards compatibility with existing data
-- New documents should use 'life_vision' which combines both concepts

