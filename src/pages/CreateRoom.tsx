
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Share2, Copy, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";

const CreateRoom = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createRoom = async () => {
    setIsCreating(true);
    try {
      const code = generateRoomCode();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { error } = await supabase
        .from('rooms')
        .insert([
          {
            code,
            expires_at: expiresAt.toISOString(),
            content: ''
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          // Duplicate key error, try again
          await createRoom();
          return;
        }
        throw error;
      }

      setRoomCode(code);
      toast({
        title: "Room created successfully!",
        description: `Room code: ${code}`,
      });
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Error creating room",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      toast({
        title: "Copied to clipboard!",
        description: "Room code has been copied",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the room code manually",
        variant: "destructive",
      });
    }
  };

  const joinRoom = () => {
    navigate(`/room/${roomCode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
      
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Share2 className="w-12 h-12 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Create Room</h1>
          <p className="text-gray-600 dark:text-gray-400">Generate a new room to share content</p>
        </div>

        <Card className="border-2 border-purple-100 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="text-xl text-center">
              {roomCode ? "Room Created!" : "Ready to Create"}
            </CardTitle>
            <CardDescription className="text-center">
              {roomCode 
                ? "Your room is ready. Share the code with others."
                : "Click the button below to generate a new room code"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {roomCode ? (
              <>
                <div className="text-center">
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
                    <p className="text-2xl font-mono font-bold text-purple-600 dark:text-purple-400">
                      {roomCode}
                    </p>
                  </div>
                  <Button onClick={copyRoomCode} variant="outline" className="mr-2">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </Button>
                  <Button onClick={joinRoom} className="ml-2">
                    Join Room
                  </Button>
                </div>
              </>
            ) : (
              <Button 
                onClick={createRoom} 
                disabled={isCreating}
                className="w-full"
                size="lg"
              >
                {isCreating ? "Creating..." : "Create Room"}
              </Button>
            )}
          </CardContent>
        </Card>

        {roomCode && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Room expires in 24 hours</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRoom;
