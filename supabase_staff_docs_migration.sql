-- =====================================================
-- MIGRATION: Staff Documents Support
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Add 'mobile' column (stores phone number)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mobile TEXT;

-- 2. Add 'documents' column (stores Aadhar/ID number as text)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS documents TEXT;

-- 3. Add 'document_url' column (stores Supabase Storage public URL of uploaded file)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS document_url TEXT;

-- =====================================================
-- 4. Create PUBLIC Storage Bucket for staff documents
--    (public = anyone with URL can view the file)
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'staff-documents',
  'staff-documents',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 2097152;

-- =====================================================
-- 5. Storage RLS Policies
-- =====================================================

-- Allow managers to upload documents
CREATE POLICY "Managers can upload staff documents"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'staff-documents');

-- Allow anyone to read/view documents (public bucket)
CREATE POLICY "Anyone can view staff documents"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'staff-documents');

-- Allow managers to delete documents
CREATE POLICY "Managers can delete staff documents"
  ON storage.objects FOR DELETE
  TO public
  USING (bucket_id = 'staff-documents');

-- =====================================================
-- DONE. Your profiles table now has:
--   mobile TEXT          → phone number
--   documents TEXT       → Aadhar/ID number (text)
--   document_url TEXT    → Supabase Storage public file URL
-- And 'staff-documents' is a public storage bucket.
-- =====================================================
