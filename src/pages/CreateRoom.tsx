
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Clock, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRoom } from "@/hooks/useRoom";

const CreateRoom = () => {
  const [expirationType, setExpirationType] = useState("");
  const [customHours, setCustomHours] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [roomCreated, setRoomCreated] = useState(false);
  const navigate = useNavigate();
  const { createRoom } = useRoom();

  const getExpirationHours = () => {
    switch (expirationType) {
      case "1h": return 1;
      case "24h": return 24;
      case "1w": return 168; // 7 days * 24 hours
      case "custom": return parseInt(customHours) || 1;
      default: return 1;
    }
  };

  const handleCreateRoom = async () => {
    if (!expirationType || (expirationType === "custom" && !customHours)) {
      toast({
        title: "Please select expiration time",
        description: "You need to choose when the room should expire.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    const expirationHours = getExpirationHours();
    const newRoomCode = await createRoom(expirationHours);
    
    if (newRoomCode) {
      setRoomCode(newRoomCode);
      setRoomCreated(true);
      
      toast({
        title: "Room created successfully!",
        description: `Your room expires in ${expirationHours} ${expirationHours === 1 ? 'hour' : 'hours'}.`,
      });
    }
    
    setIsCreating(false);
  };

  const copyRoomLink = () => {
    const roomUrl = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(roomUrl);
    toast({
      title: "Link copied!",
      description: "Room link has been copied to your clipboard.",
    });
  };

  const goToRoom = () => {
    navigate(`/room/${roomCode}`);
  };

  if (roomCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
        <div className="container mx-auto max-w-2xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-green-600">Room Created!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Your room code is:</p>
                <div className="bg-gray-100 rounded-xl p-4 font-mono text-2xl font-bold text-center">
                  {roomCode}
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={copyRoomLink}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Room Link
                </Button>
                
                <Button
                  onClick={goToRoom}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Enter Room
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500">
                Share this link with others to collaborate in real-time
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl">Create New Room</CardTitle>
            <p className="text-gray-600">Choose how long your text should be available</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-3 block">Expiration Time</Label>
              <Select value={expirationType} onValueChange={setExpirationType}>
                <SelectTrigger className="w-full h-12 rounded-xl border-gray-200 focus:border-purple-500">
                  <SelectValue placeholder="Select expiration time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="1w">1 Week</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {expirationType === "custom" && (
              <div>
                <Label htmlFor="customHours" className="text-base font-medium mb-2 block">
                  Custom Hours
                </Label>
                <Input
                  id="customHours"
                  type="number"
                  placeholder="Enter hours (e.g., 12)"
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  min="1"
                  max="8760"
                  className="h-12 rounded-xl border-gray-200 focus:border-purple-500"
                />
                <p className="text-sm text-gray-500 mt-2">Maximum: 8760 hours (1 year)</p>
              </div>
            )}

            <Button
              onClick={handleCreateRoom}
              disabled={isCreating || !expirationType || (expirationType === "custom" && !customHours)}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl"
            >
              {isCreating ? "Creating Room..." : "Create Room"}
            </Button>

            <div className="text-center text-sm text-gray-500">
              Room will be automatically deleted when the expiration time is reached
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateRoom;
