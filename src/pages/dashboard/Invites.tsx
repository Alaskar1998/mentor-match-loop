import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Clock, CheckCircle2, X, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { notificationService } from '@/services/notificationService';

interface Invitation {
  id: string;
  senderName?: string;
  recipientName?: string;
  skill: string;
  message: string;
  timestamp: string;
  status: string;
}

export default function Invites() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [receivedInvites, setReceivedInvites] = useState<Invitation[]>([]);
  const [sentInvites, setSentInvites] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInvitations();
    }
  }, [user]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      
      // Fetch received invitations
      const { data: receivedData, error: receivedError } = await supabase
        .from('invitations')
        .select(`
          id,
          skill,
          message,
          status,
          created_at,
          profiles!sender_id (
            display_name
          )
        `)
        .eq('recipient_id', user?.id)
        .order('created_at', { ascending: false });

      // Fetch sent invitations
      const { data: sentData, error: sentError } = await supabase
        .from('invitations')
        .select(`
          id,
          skill,
          message,
          status,
          created_at,
          profiles!recipient_id (
            display_name
          )
        `)
        .eq('sender_id', user?.id)
        .order('created_at', { ascending: false });

      if (receivedError || sentError) {
        console.error('Error fetching invitations:', receivedError || sentError);
        toast.error("Failed to load invitations");
        return;
      }

      const formatInvitations = (data: any[], type: 'received' | 'sent'): Invitation[] => {
        return data?.map(invite => ({
          id: invite.id,
          [type === 'received' ? 'senderName' : 'recipientName']: 
            invite.profiles?.display_name || 'Unknown User',
          skill: invite.skill,
          message: invite.message,
          status: invite.status,
          timestamp: formatTimeAgo(new Date(invite.created_at))
        })) || [];
      };

      setReceivedInvites(formatInvitations(receivedData, 'received'));
      setSentInvites(formatInvitations(sentData, 'sent'));
    } catch (error) {
      console.error('Error:', error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      // First, get the invitation details to find the sender
      const { data: inviteData, error: inviteError } = await supabase
        .from('invitations')
        .select('sender_id, recipient_id, skill')
        .eq('id', inviteId)
        .single();

      if (inviteError || !inviteData) {
        console.error('Error fetching invite details:', inviteError);
        toast.error("Failed to get invitation details");
        return;
      }

      // Check if a chat already exists between these users
      const { data: existingChat, error: chatCheckError } = await supabase
        .from('chats')
        .select('id')
        .or(`and(user1_id.eq.${inviteData.sender_id},user2_id.eq.${inviteData.recipient_id}),and(user1_id.eq.${inviteData.recipient_id},user2_id.eq.${inviteData.sender_id})`)
        .single();

      let chatId;
      
      if (chatCheckError && chatCheckError.code !== 'PGRST116') {
        console.error('Error checking existing chat:', chatCheckError);
        toast.error("Failed to check existing conversations");
        return;
      }

      if (existingChat) {
        // Chat already exists
        chatId = existingChat.id;
      } else {
        // Create a new chat
        const { data: newChat, error: chatError } = await supabase
          .from('chats')
          .insert({
            user1_id: inviteData.sender_id,
            user2_id: inviteData.recipient_id,
            skill: inviteData.skill,
            status: 'active'
          })
          .select('id')
          .single();

        if (chatError) {
          console.error('Error creating chat:', chatError);
          toast.error("Failed to create conversation");
          return;
        }

        chatId = newChat.id;
      }

      // Update the invitation status
      const { error: updateError } = await supabase
        .from('invitations')
        .update({ status: 'accepted' })
        .eq('id', inviteId);

      if (updateError) {
        console.error('Error accepting invite:', updateError);
        toast.error("Failed to accept invitation");
        return;
      }

      // Create notification for the sender that their invitation was accepted
      try {
        const { data: recipientProfile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', inviteData.recipient_id)
          .single();

        const recipientName = recipientProfile?.display_name || 'Someone';

        await notificationService.createNotification({
          userId: inviteData.sender_id,
          title: 'Invitation Accepted!',
          message: `${recipientName} accepted your invitation to learn ${inviteData.skill}`,
          isRead: false,
          type: 'invitation_accepted',
          actionUrl: `/chat/${chatId}`,
          metadata: { 
            recipientId: inviteData.recipient_id,
            recipientName: recipientName,
            skill: inviteData.skill,
            chatId: chatId
          }
        });
      } catch (notificationError) {
        console.error('Failed to create acceptance notification:', notificationError);
      }

      toast.success("Invitation accepted! Opening chat...");
      
      // Navigate to the chat
      setTimeout(() => {
        navigate(`/chat/${chatId}`);
      }, 1000);
      
      fetchInvitations(); // Refresh the list
    } catch (error) {
      console.error('Error:', error);
      toast.error("Something went wrong");
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'declined' })
        .eq('id', inviteId);

      if (error) {
        console.error('Error declining invite:', error);
        toast.error("Failed to decline invitation");
        return;
      }

      toast.success("Invitation declined");
      fetchInvitations(); // Refresh the list
    } catch (error) {
      console.error('Error:', error);
      toast.error("Something went wrong");
    }
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
            Received ({receivedInvites.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent ({sentInvites.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">Loading invitations...</div>
              </CardContent>
            </Card>
          ) : receivedInvites.map((invite) => (
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
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">Loading invitations...</div>
              </CardContent>
            </Card>
          ) : sentInvites.map((invite) => (
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
                      onClick={() => {
                        // Navigate to chat or show message that chat will be created
                        toast.info("Opening conversation...");
                        navigate(`/messages`);
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      View Chat
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {!loading && receivedInvites.length === 0 && sentInvites.length === 0 && (
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