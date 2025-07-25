import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Mic, 
  Video, 
  Paperclip, 
  FileText,
  Image,
  Download,
  Play,
  Pause
} from 'lucide-react';

interface EnhancedChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const EnhancedChatInput = ({ onSendMessage, disabled }: EnhancedChatInputProps) => {
  const [isRecording, setIsRecording] = React.useState(false);
  
  // Placeholder for voice recording
  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Future: Implement ElevenLabs voice recording
    console.log('Voice recording placeholder - Future: ElevenLabs integration');
  };
  
  // Placeholder for video call initiation
  const handleVideoCall = () => {
    console.log('Video call placeholder - Future: WebRTC integration');
  };
  
  // Placeholder for file attachment
  const handleFileAttach = () => {
    console.log('File attachment placeholder - Future: File upload system');
  };

  return (
    <div className="border-t p-4 bg-background">
      {/* Enhanced Input Bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-lg"
          disabled={disabled}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onSendMessage(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
        />
        
        {/* Voice Message Button */}
        <Button
          variant={isRecording ? "destructive" : "outline"}
          size="icon"
          onClick={handleVoiceRecord}
          disabled={disabled}
        >
          <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
        </Button>
        
        {/* Video Call Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleVideoCall}
          disabled={disabled}
        >
          <Video className="w-4 h-4" />
        </Button>
        
        {/* File Attachment Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleFileAttach}
          disabled={disabled}
        >
          <Paperclip className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Future Features Preview */}
      {isRecording && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm">Recording voice message...</span>
            <Badge variant="outline" className="text-xs">Future Feature</Badge>
          </div>
        </div>
      )}
    </div>
  );
};

// Placeholder: Voice Message Component
export const VoiceMessage = ({ message }: { message: any }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  
  return (
    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsPlaying(!isPlaying)}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Voice Message</span>
          <Badge variant="outline" className="text-xs">Future Feature</Badge>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-1 mt-1">
          <div className="bg-blue-600 h-1 rounded-full w-1/3" />
        </div>
        <span className="text-xs text-muted-foreground">0:30</span>
      </div>
    </div>
  );
};

// Placeholder: Attachment Component
export const AttachmentMessage = ({ attachment }: { attachment: any }) => {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
      <div className="p-2 bg-gray-200 rounded">
        {getFileIcon(attachment.type)}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{attachment.name}</span>
          <Badge variant="outline" className="text-xs">Future Feature</Badge>
        </div>
        <span className="text-xs text-muted-foreground">{attachment.size}</span>
      </div>
      
      <Button variant="ghost" size="icon">
        <Download className="w-4 h-4" />
      </Button>
    </div>
  );
};