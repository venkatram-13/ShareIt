
-- Create rooms table to store room information
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  content TEXT DEFAULT '',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index on code for faster lookups
CREATE INDEX idx_rooms_code ON public.rooms(code);

-- Create index on expires_at for cleanup operations
CREATE INDEX idx_rooms_expires_at ON public.rooms(expires_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_rooms_updated_at 
    BEFORE UPDATE ON public.rooms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired rooms
CREATE OR REPLACE FUNCTION cleanup_expired_rooms()
RETURNS void AS $$
BEGIN
    DELETE FROM public.rooms WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (make rooms publicly accessible since no auth)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations on rooms (no authentication required)
CREATE POLICY "Allow all operations on rooms" ON public.rooms
    FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for rooms table
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
