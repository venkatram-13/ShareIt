
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

export const useRoom = (roomCode?: string) => {
  const [room, setRoom] = useState<Room | null>(null);
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

    fetchRoom();

    // Subscribe to real-time changes
    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel);
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
    loading,
    error,
    updateContent,
    createRoom
  };
};
