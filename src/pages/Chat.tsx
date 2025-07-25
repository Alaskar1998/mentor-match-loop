import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, ArrowLeft, Play, Square } from 'lucide-react';
import { ExchangeModal } from '@/components/chat/ExchangeModal';
import { FinishExchangeModal } from '@/components/chat/FinishExchangeModal';

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

const Chat = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [exchange, setExchange] = useState<Exchange | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock other user data - in real app, this would come from API
  const otherUser = {
    id: 'other-user-1',
    name: 'Sarah Johnson',
    profilePicture: '👩‍🏫',
    skillsToTeach: [
      { name: 'Spanish', level: 'Expert', description: 'Native speaker, conversation focus' },
      { name: 'Guitar', level: 'Intermediate', description: 'Acoustic and basic electric' }
    ]
  };

  // Mock original invite skill
  const originalSkill = 'JavaScript';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock initial messages
  useEffect(() => {
    setMessages([
      {
        id: '1',
        senderId: 'system',
        message: `${otherUser.name} accepted your invitation!`,
        timestamp: new Date(Date.now() - 60000),
        type: 'system'
      },
      {
        id: '2',
        senderId: otherUser.id,
        message: "Hi! I'm excited to help you learn JavaScript. When would be a good time to start?",
        timestamp: new Date(Date.now() - 30000),
        type: 'text'
      }
    ]);
  }, []);

  const handleSendMessage = () => {
    if (!message.trim() || !user) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      message: message.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
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

  const handleExchangeAgreed = (exchangeData: any) => {
    const newExchange: Exchange = {
      id: Date.now().toString(),
      status: 'pending',
      initiatorSkill: originalSkill,
      recipientSkill: exchangeData.recipientSkill,
      isMentorship: exchangeData.isMentorship,
      initiatorAgreed: user?.id === 'user-1', // Mock logic
      recipientAgreed: false,
      initiatorFinished: false,
      recipientFinished: false
    };

    setExchange(newExchange);
    setShowExchangeModal(false);

    // Add system message
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'system',
      message: `Exchange started! ${user?.name} will teach ${originalSkill}${exchangeData.isMentorship ? ' (Mentorship)' : ` in exchange for ${exchangeData.recipientSkill}`}`,
      timestamp: new Date(),
      type: 'system'
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const handleExchangeFinished = () => {
    if (!exchange || !user) return;

    const updatedExchange = {
      ...exchange,
      initiatorFinished: user.id === 'user-1' ? true : exchange.initiatorFinished,
      recipientFinished: user.id === otherUser.id ? true : exchange.recipientFinished,
    };

    if (updatedExchange.initiatorFinished && updatedExchange.recipientFinished) {
      updatedExchange.status = 'completed';
    }

    setExchange(updatedExchange);
    setShowFinishModal(false);

    // Add system message
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'system',
      message: updatedExchange.status === 'completed' 
        ? 'Exchange completed! Both users can now leave reviews.'
        : `${user.name} marked the exchange as finished.`,
      timestamp: new Date(),
      type: 'system'
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const renderMessage = (msg: ChatMessage) => {
    if (msg.type === 'system') {
      return (
        <div key={msg.id} className="flex justify-center my-4">
          <Badge variant="secondary" className="px-3 py-1">
            {msg.message}
          </Badge>
        </div>
      );
    }

    const isOwn = msg.senderId === user?.id;
    const sender = isOwn ? user : otherUser;

    return (
      <div key={msg.id} className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
        <Avatar className="w-8 h-8">
          <AvatarImage src={sender?.profilePicture} />
          <AvatarFallback>{sender?.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className={`max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
          <div 
            className={`rounded-lg px-4 py-2 ${
              isOwn 
                ? 'bg-primary text-primary-foreground ml-auto' 
                : 'bg-muted'
            }`}
          >
            <div 
              className="whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{
                __html: msg.message.replace(
                  /(https?:\/\/[^\s]+)/g,
                  '<a href="$1" target="_blank" rel="noopener noreferrer" class="underline hover:text-accent">$1</a>'
                )
              }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  };

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
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={otherUser.profilePicture} />
            <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{otherUser.name}</h2>
            <p className="text-sm text-muted-foreground">Online</p>
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
        initiatorName={user?.name || ''}
        recipientName={otherUser.name}
        initiatorSkill={originalSkill}
        recipientSkills={otherUser.skillsToTeach}
      />

      {/* Finish Exchange Modal */}
      <FinishExchangeModal
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        onConfirm={handleExchangeFinished}
        exchange={exchange}
        currentUserId={user?.id || ''}
      />
    </div>
  );
};

export default Chat;