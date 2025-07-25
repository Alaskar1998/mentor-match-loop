import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockChats = [
  {
    id: 'chat-1',
    recipientName: 'John Doe',
    skill: 'React Development',
    status: 'active',
    lastMessage: 'Thanks for helping me with React hooks!',
    timestamp: '2 hours ago',
    unreadCount: 2
  },
  {
    id: 'chat-2', 
    recipientName: 'Sarah Wilson',
    skill: 'Python',
    status: 'completed',
    lastMessage: 'Great session! Thanks for the help.',
    timestamp: '1 day ago',
    unreadCount: 0
  },
  {
    id: 'chat-3',
    recipientName: 'Mike Johnson',
    skill: 'UI/UX Design',
    status: 'pending',
    lastMessage: 'Looking forward to our session!',
    timestamp: '3 days ago',
    unreadCount: 1
  }
];

export default function Chats() {
  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <MessageCircle className="w-4 h-4 text-primary" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-primary/10 text-primary';
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Chats</h1>
          <p className="text-muted-foreground">Manage your skill exchange conversations</p>
        </div>
        <Button onClick={() => navigate('/search')}>
          Find New Partners
        </Button>
      </div>

      <div className="space-y-4">
        {mockChats.map((chat) => (
          <Card key={chat.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-lg">
                    {chat.recipientName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{chat.recipientName}</h3>
                      <Badge variant="outline" className="text-xs">
                        {chat.skill}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {chat.lastMessage}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {getStatusIcon(chat.status)}
                      <span className="capitalize">{chat.status}</span>
                      <span>•</span>
                      <span>{chat.timestamp}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {chat.unreadCount > 0 && (
                    <Badge variant="destructive" className="rounded-full w-6 h-6 flex items-center justify-center p-0">
                      {chat.unreadCount}
                    </Badge>
                  )}
                  <Badge className={getStatusColor(chat.status)}>
                    {chat.status}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/chat/${chat.id}`)}
                  >
                    Open Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mockChats.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No chats yet</h3>
            <p className="text-muted-foreground mb-4">
              Start connecting with other users to begin skill exchanges!
            </p>
            <Button onClick={() => navigate('/search')}>
              Find Learning Partners
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}