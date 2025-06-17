
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Copy, Clock, Users, FileText, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRoom } from "@/hooks/useRoom";
import FileUpload from "@/components/FileUpload";
import FileList from "@/components/FileList";

const Room = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { room, files, loading, error, updateContent, uploadFile, downloadFile, deleteFile } = useRoom(roomCode);

  useEffect(() => {
    if (!roomCode) {
      navigate("/");
      return;
    }
  }, [roomCode, navigate]);

  useEffect(() => {
    if (room) {
      setContent(room.content);
      
      // Update countdown timer every second
      const timer = setInterval(() => {
        const expiresAt = new Date(room.expires_at);
        const now = new Date();
        const timeRemaining = expiresAt.getTime() - now.getTime();

        if (timeRemaining <= 0) {
          navigate("/");
          toast({
            title: "Room Expired",
            description: "This room has expired and been deleted.",
            variant: "destructive",
          });
          return;
        }

        // Format time remaining
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [room, navigate]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    updateContent(newContent);
  };

  const copyRoomLink = () => {
    const roomUrl = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(roomUrl);
    toast({
      title: "Link copied!",
      description: "Room link has been copied to your clipboard.",
    });
  };

  const copyContent = () => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Content copied!",
      description: "Text content has been copied to your clipboard.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-3xl font-bold mb-4">Loading Room...</h2>
              <p className="text-gray-600">Please wait while we load your room.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="text-6xl mb-4">
                {error === "Room not found" ? "🔍" : "⏰"}
              </div>
              <h2 className="text-3xl font-bold mb-4">
                {error === "Room not found" ? "Room Not Found" : "Room Expired"}
              </h2>
              <p className="text-gray-600 mb-6">
                {error === "Room not found" 
                  ? `The room code "${roomCode}" doesn't exist or may have expired.`
                  : "This room has expired and all content has been automatically deleted."
                }
              </p>
              <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-purple-600 to-blue-600">
                {error === "Room not found" ? "Go Home" : "Create New Room"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="font-mono text-sm font-medium">{timeLeft}</span>
            </div>
            
            <Button
              onClick={copyRoomLink}
              variant="outline"
              className="bg-white/80 backdrop-blur-sm"
            >
              <Copy className="w-4 h-4 mr-2" />
              Share Link
            </Button>
          </div>
        </div>

        {/* Room Info */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Room: {roomCode}</CardTitle>
                <p className="text-gray-600">Share this code with others to collaborate</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>Anonymous Room</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Shared Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Text ({content.length} chars)
                </TabsTrigger>
                <TabsTrigger value="files" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Files ({files.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Real-time text collaboration</p>
                  <Button
                    onClick={copyContent}
                    variant="outline"
                    size="sm"
                    disabled={!content.trim()}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Text
                  </Button>
                </div>
                
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Start typing your text here... Changes are saved automatically and will be visible to anyone with the room link."
                  className="min-h-[400px] resize-none border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                />
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{content.length} characters</span>
                  <span>Changes saved automatically</span>
                </div>
              </TabsContent>
              
              <TabsContent value="files" className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 mb-4">Upload and share files with room participants</p>
                  <FileUpload onFileUpload={uploadFile} />
                </div>
                
                <FileList 
                  files={files}
                  onDownload={downloadFile}
                  onDelete={deleteFile}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Warning */}
        <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
          <div className="flex items-center space-x-2 text-orange-700">
            <Clock className="w-5 h-5" />
            <span className="font-medium">This room will expire in {timeLeft}</span>
          </div>
          <p className="text-orange-600 text-sm mt-2">
            All content and files will be permanently deleted when the timer reaches zero.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Room;
