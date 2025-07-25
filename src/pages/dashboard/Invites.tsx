import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Clock, CheckCircle2, X, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockInvites = {
  received: [
    {
      id: 'inv-1',
      senderName: 'Alice Chen',
      skill: 'JavaScript',
      message: 'Hi! I saw your profile and would love to learn React from you. I can teach you Python in return!',
      timestamp: '2 hours ago',
      status: 'pending'
    },
    {
      id: 'inv-2',
      senderName: 'David Miller',
      skill: 'UI/UX Design',
      message: 'Would you be interested in a design-for-code skill exchange?',
      timestamp: '1 day ago',
      status: 'pending'
    }
  ],
  sent: [
    {
      id: 'inv-3',
      recipientName: 'Emma Thompson',
      skill: 'Machine Learning',
      message: 'Hello! I\'d love to learn ML from you. I can help with web development!',
      timestamp: '3 days ago',
      status: 'pending'
    },
    {
      id: 'inv-4',
      recipientName: 'John Smith',
      skill: 'Photography',
      message: 'Interested in photography lessons in exchange for coding help!',
      timestamp: '5 days ago',
      status: 'accepted'
    }
  ]
};

export default function Invites() {
  const navigate = useNavigate();

  const handleAcceptInvite = (inviteId: string) => {
    console.log('Accepting invite:', inviteId);
    // Here you would accept the invitation and create a chat
    const chatId = `chat-${Date.now()}`;
    navigate(`/chat/${chatId}`);
  };

  const handleDeclineInvite = (inviteId: string) => {
    console.log('Declining invite:', inviteId);
    // Here you would decline the invitation
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'declined':
        return <X className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/10 text-green-500';
      case 'declined':
        return 'bg-red-500/10 text-red-500';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invitations</h1>
        <p className="text-muted-foreground">Manage your skill exchange invitations</p>
      </div>

      <Tabs defaultValue="received" className="space-y-6">
        <TabsList>
          <TabsTrigger value="received">
            Received ({mockInvites.received.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent ({mockInvites.sent.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {mockInvites.received.map((invite) => (
            <Card key={invite.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-lg">
                      {invite.senderName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{invite.senderName}</h3>
                        <Badge variant="outline">{invite.skill}</Badge>
                        <Badge className={getStatusColor(invite.status)}>
                          {getStatusIcon(invite.status)}
                          <span className="ml-1 capitalize">{invite.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {invite.message}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {invite.timestamp}
                      </span>
                    </div>
                  </div>
                  {invite.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeclineInvite(invite.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleAcceptInvite(invite.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {mockInvites.sent.map((invite) => (
            <Card key={invite.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-lg">
                      {invite.recipientName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{invite.recipientName}</h3>
                        <Badge variant="outline">{invite.skill}</Badge>
                        <Badge className={getStatusColor(invite.status)}>
                          {getStatusIcon(invite.status)}
                          <span className="ml-1 capitalize">{invite.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {invite.message}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {invite.timestamp}
                      </span>
                    </div>
                  </div>
                  {invite.status === 'accepted' && (
                    <Button 
                      size="sm"
                      onClick={() => navigate(`/chat/chat-${invite.id}`)}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Open Chat
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {mockInvites.received.length === 0 && mockInvites.sent.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No invitations yet</h3>
            <p className="text-muted-foreground mb-4">
              Start connecting with other users to exchange skills!
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