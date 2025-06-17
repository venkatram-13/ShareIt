
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Room {
  id: string;
  code: string;
  content: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface RoomFile {
  id: string;
  room_code: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
}

export const useRoom = (roomCode?: string) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [files, setFiles] = useState<RoomFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode) {
      setLoading(false);
      return;
    }

    const fetchRoom = async () => {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('code', roomCode)
          .maybeSingle();

        if (error) {
          console.error('Error fetching room:', error);
          setError('Failed to fetch room');
          return;
        }

        if (!data) {
          setError('Room not found');
          return;
        }

        // Check if room has expired
        const now = new Date();
        const expiresAt = new Date(data.expires_at);
        
        if (now >= expiresAt) {
          // Delete expired room
          await supabase.from('rooms').delete().eq('code', roomCode);
          setError('Room has expired');
          return;
        }

        setRoom(data);
        setError(null);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load room');
      } finally {
        setLoading(false);
      }
    };

    const fetchFiles = async () => {
      try {
        const { data, error } = await supabase
          .from('room_files')
          .select('*')
          .eq('room_code', roomCode)
          .order('uploaded_at', { ascending: false });

        if (error) {
          console.error('Error fetching files:', error);
          return;
        }

        setFiles(data || []);
      } catch (err) {
        console.error('Error fetching files:', err);
      }
    };

    fetchRoom();
    fetchFiles();

    // Subscribe to real-time changes for room content
    const roomChannel = supabase
      .channel('room-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `code=eq.${roomCode}`
        },
        (payload) => {
          console.log('Room updated:', payload);
          setRoom(payload.new as Room);
        }
      )
      .subscribe();

    // Subscribe to real-time changes for files
    const filesChannel = supabase
      .channel('files-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_files',
          filter: `room_code=eq.${roomCode}`
        },
        (payload) => {
          console.log('Files updated:', payload);
          fetchFiles(); // Refetch files when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(filesChannel);
    };
  }, [roomCode]);

  const updateContent = async (newContent: string) => {
    if (!room) return;

    try {
      const { error } = await supabase
        .from('rooms')
        .update({ content: newContent })
        .eq('code', room.code);

      if (error) {
        console.error('Error updating content:', error);
        toast({
          title: "Error",
          description: "Failed to save changes",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  };

  const uploadFile = async (file: File): Promise<boolean> => {
    if (!roomCode) return false;

    try {
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${roomCode}/${Date.now()}-${file.name}`;
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('room-files')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        toast({
          title: "Error",
          description: "Failed to upload file",
          variant: "destructive",
        });
        return false;
      }

      // Save file metadata to database
      const { error: dbError } = await supabase
        .from('room_files')
        .insert({
          room_code: roomCode,
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          file_type: file.type
        });

      if (dbError) {
        console.error('Error saving file metadata:', dbError);
        // Try to delete the uploaded file
        await supabase.storage.from('room-files').remove([fileName]);
        toast({
          title: "Error",
          description: "Failed to save file information",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      return true;
    } catch (err) {
      console.error('Error uploading file:', err);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      return false;
    }
  };

  const downloadFile = async (fileData: RoomFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('room-files')
        .download(fileData.file_path);

      if (error) {
        console.error('Error downloading file:', error);
        toast({
          title: "Error",
          description: "Failed to download file",
          variant: "destructive",
        });
        return;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileData.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const deleteFile = async (fileData: RoomFile) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('room-files')
        .remove([fileData.file_path]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('room_files')
        .delete()
        .eq('id', fileData.id);

      if (dbError) {
        console.error('Error deleting file from database:', dbError);
        toast({
          title: "Error",
          description: "Failed to delete file",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting file:', err);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const createRoom = async (expirationHours: number): Promise<string | null> => {
    try {
      // Generate unique room code
      const roomCode = Math.random().toString(36).substring(2, 8).toLowerCase();
      const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('rooms')
        .insert({
          code: roomCode,
          content: '',
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating room:', error);
        toast({
          title: "Error",
          description: "Failed to create room",
          variant: "destructive",
        });
        return null;
      }

      return data.code;
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    room,
    files,
    loading,
    error,
    updateContent,
    uploadFile,
    downloadFile,
    deleteFile,
    createRoom
  };
};
