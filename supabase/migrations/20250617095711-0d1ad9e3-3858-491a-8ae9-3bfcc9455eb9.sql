
-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('room-files', 'room-files', true);

-- Create policy to allow all operations on the bucket (no auth required)
CREATE POLICY "Allow all operations on room files" ON storage.objects
FOR ALL USING (bucket_id = 'room-files');

-- Create files table to track file metadata
CREATE TABLE public.room_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code VARCHAR(10) NOT NULL REFERENCES public.rooms(code) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on room_code for faster lookups
CREATE INDEX idx_room_files_room_code ON public.room_files(room_code);

-- Enable Row Level Security for files table
ALTER TABLE public.room_files ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations on room files (no authentication required)
CREATE POLICY "Allow all operations on room files" ON public.room_files
    FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for room_files table
ALTER TABLE public.room_files REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_files;
