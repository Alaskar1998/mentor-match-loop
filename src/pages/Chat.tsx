import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, ArrowLeft, Play, Square, Loader2 } from 'lucide-react';
import { ExchangeModal } from '@/components/chat/ExchangeModal';
import { FinishExchangeModal } from '@/components/chat/FinishExchangeModal';
import { ReviewModal } from '@/components/review/ReviewModal';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/services/notificationService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system';
}

interface Exchange {
  id: string;
  status: 'pending' | 'active' | 'completed';
  initiatorSkill: string;
  recipientSkill?: string;
  isMentorship: boolean;
  initiatorAgreed: boolean;
  recipientAgreed: boolean;
  initiatorFinished: boolean;
  recipientFinished: boolean;
}

interface OtherUser {
  id: string;
  display_name: string;
  avatar_url?: string;
  skills_to_teach?: any[];
}

interface ChatData {
  id: string;
  user1_id: string;
  user2_id: string;
  skill: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Chat = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast: toastHook } = useToast();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId && user) {
      fetchChatData();
    }
  }, [chatId, user]);

  const fetchChatData = async () => {
    try {
      setLoading(true);

      // Fetch chat information
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();

      if (chatError) {
        console.error('Error fetching chat:', chatError);
        toast.error("Chat not found");
        navigate('/messages');
        return;
      }

      setChatData(chat);

      // Determine the other user ID
      const otherUserId = chat.user1_id === user?.id ? chat.user2_id : chat.user1_id;

      // Fetch other user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single();

      if (profileError) {
        console.error('Error fetching other user profile:', profileError);
        setOtherUser({
          id: otherUserId,
          display_name: 'Unknown User'
        });
      } else {
        setOtherUser({
          id: profile.id,
          display_name: profile.display_name || 'User',
          avatar_url: profile.avatar_url,
          skills_to_teach: Array.isArray(profile.skills_to_teach) ? profile.skills_to_teach : []
        });
      }

      // Fetch chat messages
      const { data: chatMessages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
      } else {
        const formattedMessages: ChatMessage[] = chatMessages.map(msg => ({
          id: msg.id,
          senderId: msg.sender_id,
          message: msg.message,
          timestamp: new Date(msg.created_at),
          type: 'text'
        }));
        setMessages(formattedMessages);
      }

    } catch (error) {
      console.error('Error in fetchChatData:', error);
      toast.error("Failed to load chat");
      navigate('/messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !otherUser || !chatId) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      message: message.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    try {
      // Save message to database
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          message: message.trim()
        });

      if (error) {
        console.error('Error saving message:', error);
        toast.error("Failed to send message");
        return;
      }

      setMessages(prev => [...prev, newMessage]);
      setMessage('');

      // Create notification for the other user about new message
      try {
        await notificationService.createNotification({
          userId: otherUser.id,
          title: 'New Message',
          message: `${user.email || 'Someone'}: ${message.trim().substring(0, 50)}${message.trim().length > 50 ? '...' : ''}`,
          isRead: false,
          type: 'new_message',
          actionUrl: `/chat/${chatId}`,
          metadata: { 
            senderId: user.id,
            senderName: user.email || 'Someone',
            chatId: chatId
          }
        });
      } catch (notificationError) {
        console.error('Failed to create message notification:', notificationError);
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      toast.error("Failed to send message");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartExchange = () => {
    setShowExchangeModal(true);
  };

  const handleFinishExchange = () => {
    setShowFinishModal(true);
  };

  const handleExchangeAgreed = async (exchangeData: any) => {
    if (!user || !otherUser || !chatData) return;

    try {
      const newExchange: Exchange = {
        id: Date.now().toString(),
        status: 'pending',
        initiatorSkill: chatData.skill,
        recipientSkill: exchangeData.recipientSkill,
        isMentorship: exchangeData.isMentorship,
        initiatorAgreed: true,
        recipientAgreed: false,
        initiatorFinished: false,
        recipientFinished: false
      };

      setExchange(newExchange);
      setShowExchangeModal(false);

      // Create notification for the other user about exchange start
      try {
        await notificationService.createNotification({
          userId: otherUser.id,
          title: 'Exchange Started!',
          message: `${user?.email || 'Someone'} started a skill exchange with you`,
          isRead: false,
          type: 'learning_match',
          actionUrl: `/chat/${chatId}`,
          metadata: { 
            initiatorId: user?.id,
            initiatorName: user?.email || 'Someone',
            skill: chatData.skill,
            recipientSkill: exchangeData.recipientSkill,
            isMentorship: exchangeData.isMentorship
          }
        });
      } catch (notificationError) {
        console.error('Failed to create exchange start notification:', notificationError);
      }

      // Add system message
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: 'system',
        message: `Exchange started! ${user?.email} will teach ${chatData.skill}${exchangeData.isMentorship ? ' (Mentorship)' : ` in exchange for ${exchangeData.recipientSkill}`}`,
        timestamp: new Date(),
        type: 'system'
      };
      setMessages(prev => [...prev, systemMessage]);
    } catch (error) {
      console.error('Error starting exchange:', error);
      toast.error("Failed to start exchange. Please try again.");
    }
  };

  const handleExchangeFinished = () => {
    if (!exchange || !user || !otherUser) return;

    const updatedExchange = {
      ...exchange,
      initiatorFinished: true,
      recipientFinished: exchange.recipientFinished,
    };

    if (updatedExchange.initiatorFinished && updatedExchange.recipientFinished) {
      updatedExchange.status = 'completed';
    }

    setExchange(updatedExchange);
    setShowFinishModal(false);

    // Create notification for the other user if exchange is completed
    if (updatedExchange.status === 'completed') {
      (async () => {
        try {
          await notificationService.createNotification({
            userId: otherUser.id,
            title: 'Exchange Completed!',
            message: `Your skill exchange with ${user?.email || 'Someone'} has been completed`,
            isRead: false,
            type: 'exchange_completed',
            actionUrl: `/chat/${chatId}`,
            metadata: { 
              partnerId: user?.id,
              partnerName: user?.email || 'Someone',
              skill: exchange.initiatorSkill
            }
          });
        } catch (notificationError) {
          console.error('Failed to create exchange completion notification:', notificationError);
        }
      })();
    }

    // Add system message
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'system',
      message: updatedExchange.status === 'completed' 
        ? 'Exchange completed! Please leave a review for your learning partner.'
        : `${user?.email} marked the exchange as finished.`,
      timestamp: new Date(),
      type: 'system'
    };
    setMessages(prev => [...prev, systemMessage]);

    if (updatedExchange.status === 'completed') {
      setTimeout(() => {
        setShowReviewModal(true);
      }, 1000);
    }
  };

  const handleReviewSubmitted = () => {
    toastHook({
      title: "Thank you!",
      description: "Your review helps improve our community. Keep learning and teaching!",
    });
  };

  const renderMessage = (msg: ChatMessage) => {
    const isCurrentUser = msg.senderId === user?.id;
    const isSystemMessage = msg.type === 'system';

    if (isSystemMessage) {
      return (
        <div key={msg.id} className="flex justify-center my-4">
          <div className="bg-muted px-4 py-2 rounded-lg text-sm text-muted-foreground">
            {msg.message}
          </div>
        </div>
      );
    }

    return (
      <div key={msg.id} className={`flex gap-2 mb-4 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={isCurrentUser ? undefined : otherUser?.avatar_url} />
          <AvatarFallback>
            {isCurrentUser 
              ? (user?.email?.charAt(0).toUpperCase() || 'Y')
              : (otherUser?.display_name?.charAt(0).toUpperCase() || 'U')
            }
          </AvatarFallback>
        </Avatar>
        <div className={`max-w-[70%] ${isCurrentUser ? 'text-right' : ''}`}>
          <div className={`inline-block p-3 rounded-lg ${
            isCurrentUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted'
          }`}>
            {msg.message}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading chat...</span>
        </div>
      </div>
    );
  }

  if (!otherUser || !chatData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Chat not found</h2>
          <p className="text-muted-foreground mb-4">The conversation you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/messages')}>Back to Messages</Button>
        </div>
      </div>
    );
  }

  const canStartExchange = !exchange || exchange.status === 'completed';
  const canFinishExchange = exchange && exchange.status === 'active';
  const exchangeActive = exchange && (exchange.initiatorAgreed && exchange.recipientAgreed);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/messages')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={otherUser.avatar_url} />
            <AvatarFallback>{otherUser.display_name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{otherUser.display_name}</h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{chatData.skill}</Badge>
              <Badge variant={chatData.status === 'active' ? 'default' : 'secondary'}>
                {chatData.status}
              </Badge>
            </div>
          </div>
          {exchange && (
            <Badge 
              variant={exchange.status === 'active' ? 'default' : 'secondary'}
              className="ml-auto"
            >
              Exchange {exchange.status}
            </Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="container mx-auto max-w-4xl p-4 pb-24">
        <Card>
          <CardContent className="p-6">
            <div className="h-96 overflow-y-auto mb-4">
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>

            {/* Exchange Action Buttons */}
            <div className="flex gap-2 mb-4">
              {canStartExchange && (
                <Button
                  onClick={handleStartExchange}
                  className="gap-2"
                  variant="default"
                >
                  <Play className="h-4 w-4" />
                  Start Exchange
                </Button>
              )}
              {canFinishExchange && exchangeActive && (
                <Button
                  onClick={handleFinishExchange}
                  className="gap-2"
                  variant="outline"
                >
                  <Square className="h-4 w-4" />
                  Finish Exchange
                </Button>
              )}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (You can share Zoom links, WhatsApp contacts, etc.)"
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exchange Modal */}
      <ExchangeModal
        isOpen={showExchangeModal}
        onClose={() => setShowExchangeModal(false)}
        onAgree={handleExchangeAgreed}
        initiatorName={user?.email || ''}
        recipientName={otherUser.display_name}
        initiatorSkill={chatData.skill}
        recipientSkills={otherUser.skills_to_teach || []}
        initiatorId={user?.id || ''}
        recipientId={otherUser.id}
      />

      {/* Finish Exchange Modal */}
      <FinishExchangeModal
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        onConfirm={handleExchangeFinished}
        exchange={exchange}
        currentUserId={user?.id || ''}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        exchange={exchange}
        otherUser={otherUser as any}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default Chat;