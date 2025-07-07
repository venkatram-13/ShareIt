
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Share2, Plus, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const Index = () => {
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      navigate(`/room/${roomCode.trim().toUpperCase()}`);
    }
  };

  const handleCreateRoom = () => {
    navigate("/create");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Share2 className="w-12 h-12 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">ShareIt</h1>
          <p className="text-gray-600 dark:text-gray-400">Share text and files instantly across devices</p>
        </div>

        <div className="space-y-4">
          <Card className="border-2 border-purple-100 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="text-xl text-center">Join a Room</CardTitle>
              <CardDescription className="text-center">
                Enter a room code to join an existing room
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Enter room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono"
                  maxLength={10}
                />
                <Button type="submit" className="w-full" size="lg">
                  Join Room
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">or</p>
            <Button
              onClick={handleCreateRoom}
              variant="outline"
              size="lg"
              className="w-full border-2 hover:bg-purple-50 dark:hover:bg-purple-900"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Room
            </Button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Rooms expire after 24 hours</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
