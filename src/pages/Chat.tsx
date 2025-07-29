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
  const [exchangeState, setExchangeState] = useState('pending_start');
  const [contractData, setContractData] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId && user) {
      fetchChatData();
    }
  }, [chatId, user]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!chatId || !user) return;

    const pollMessages = async () => {
      try {
        const { data: messagesData, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });

        if (!messagesError && messagesData) {
          const formattedMessages: ChatMessage[] = messagesData.map(msg => ({
            id: msg.id,
            senderId: msg.sender_id,
            message: msg.message,
            timestamp: new Date(msg.created_at),
            type: msg.sender_id === 'system' ? 'system' : 'text'
          }));

          // Only update if messages have changed
          if (JSON.stringify(formattedMessages) !== JSON.stringify(messages)) {
            setMessages(formattedMessages);
            console.log('🔄 Messages updated via polling:', formattedMessages);
          }
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    };

    const interval = setInterval(pollMessages, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [chatId, user, messages]);

  // Poll for exchange state changes every 5 seconds
  useEffect(() => {
    if (!chatId || !user) return;

    const pollExchangeState = async () => {
      try {
        // Check for exchange state changes
        const { data: chat } = await supabase
          .from('chats')
          .select('*, exchange_state')
          .eq('id', chatId)
          .single();

        if (chat && chat.exchange_state !== exchangeState) {
          setExchangeState(chat.exchange_state || 'pending_start');
          console.log('🔄 Exchange state updated:', chat.exchange_state);
        }

        // Check for contract changes
        const { data: contract } = await supabase
          .from('exchange_contracts')
          .select('*')
          .eq('chat_id', chatId)
          .single();

        if (contract) {
          const isUser1 = contract.user1_id === user.id;
          const newContractData = {
            currentUserSkill: isUser1 ? contract.user1_skill : contract.user2_skill,
            otherUserSkill: isUser1 ? contract.user2_skill : contract.user1_skill,
            currentUserIsMentorship: isUser1 ? contract.user1_is_mentorship : contract.user2_is_mentorship,
            otherUserIsMentorship: isUser1 ? contract.user2_is_mentorship : contract.user1_is_mentorship,
            currentUserAgreed: isUser1 ? contract.user1_agreed : contract.user2_agreed,
            otherUserAgreed: isUser1 ? contract.user2_agreed : contract.user1_agreed,
          };

          // Only update if contract data has changed
          if (JSON.stringify(newContractData) !== JSON.stringify(contractData)) {
            setContractData(newContractData);
            console.log('🔄 Contract data updated:', newContractData);
          }
        }
      } catch (error) {
        console.error('Error polling exchange state:', error);
      }
    };

    const interval = setInterval(pollExchangeState, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [chatId, user, exchangeState, contractData]);

  const fetchChatData = async () => {
    console.log('🔄 fetchChatData called with:', { chatId, userId: user?.id });
    
    if (!chatId || !user) {
      console.log('❌ Missing chatId or user, setting loading to false');
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 Starting fetchChatData...');
      setLoading(true);
      
      // Fetch chat data - try with exchange_state first, fallback to basic query
      console.log('📨 Fetching chat data...');
      let { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();

      // Try to get exchange_state if basic query works
      if (!chatError && chat) {
        try {
          const { data: chatWithState } = await supabase
            .from('chats')
            .select('*, exchange_state')
            .eq('id', chatId)
            .single();
          
          if (chatWithState) {
            chat = chatWithState;
          }
        } catch (stateError) {
          console.log('⚠️ exchange_state column not found, using basic chat data');
        }
      }

      console.log('📨 Chat query result:', { chat, chatError });

      if (chatError) {
        console.error('Error fetching chat:', chatError);
        toast.error("Chat not found");
        navigate('/messages');
        return;
      }

      setChatData(chat);
      setExchangeState(chat.exchange_state || 'pending_start');
      console.log('✅ Chat data set:', { chat, exchangeState: chat.exchange_state || 'pending_start' });

      // Try to fetch contract data (may not exist yet)
      console.log('📋 Fetching contract data...');
      try {
        const { data: contract } = await supabase
          .from('exchange_contracts')
          .select('*')
          .eq('chat_id', chatId)
          .single();

        console.log('📋 Contract query result:', { contract });

        if (contract) {
          const isUser1 = contract.user1_id === user.id;
          const contractData = {
            currentUserSkill: isUser1 ? contract.user1_skill : contract.user2_skill,
            otherUserSkill: isUser1 ? contract.user2_skill : contract.user1_skill,
            currentUserIsMentorship: isUser1 ? contract.user1_is_mentorship : contract.user2_is_mentorship,
            otherUserIsMentorship: isUser1 ? contract.user2_is_mentorship : contract.user1_is_mentorship,
            currentUserAgreed: isUser1 ? contract.user1_agreed : contract.user2_agreed,
            otherUserAgreed: isUser1 ? contract.user2_agreed : contract.user1_agreed,
          };
          setContractData(contractData);
          console.log('✅ Contract data set:', contractData);
        }
      } catch (contractError) {
        console.log('⚠️ Contract table not found or no contract exists yet');
        setContractData(null);
      }

      // Fetch other user data
      const otherUserId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id;
      console.log('👤 Fetching other user data for:', otherUserId);
      
      const { data: otherUserData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single();

      console.log('👤 Other user query result:', { otherUserData, userError });

      if (userError) {
        console.error('Error fetching other user:', userError);
        toast.error("Failed to load user data");
        navigate('/messages');
        return;
      }

      setOtherUser(otherUserData);
      console.log('✅ Other user data set:', otherUserData);

      // Fetch messages
      console.log('💬 Fetching messages...');
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      console.log('💬 Messages query result:', { messagesData, messagesError });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        toast.error("Failed to load messages");
        return;
      }

      // Transform messages to match the expected format
      const formattedMessages: ChatMessage[] = (messagesData || []).map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        message: msg.message,
        timestamp: new Date(msg.created_at),
        type: msg.sender_id === 'system' ? 'system' : 'text'
      }));

      setMessages(formattedMessages);
      console.log('✅ Messages set:', formattedMessages);
      console.log('🎉 fetchChatData completed successfully!');
      
    } catch (error) {
      console.error('❌ Error in fetchChatData:', error);
      toast.error("Failed to load chat");
      navigate('/messages');
    } finally {
      console.log('🏁 Setting loading to false');
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

      // Get sender's display name for notification
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();

      const senderName = senderProfile?.display_name || 'Someone';

      // Create notification for the other user about new message
      try {
        await notificationService.createNotification({
          userId: otherUser.id,
          title: 'New Message',
          message: `${senderName}: ${message.trim().substring(0, 50)}${message.trim().length > 50 ? '...' : ''}`,
          isRead: false,
          type: 'new_message',
          actionUrl: `/chat/${chatId}`,
          metadata: { 
            senderId: user.id,
            senderName: senderName,
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

  const handleExchangeAgreed = async (data: { userSkill: string; isMentorship: boolean }) => {
    if (!user || !chatData || !otherUser) return;

    try {
      console.log('🤝 Processing exchange agreement:', data);

      // Determine user positions in the contract
      const isUser1 = chatData.user1_id === user.id;
      
      // Check if contract exists
      let { data: existingContract } = await supabase
        .from('exchange_contracts')
        .select('*')
        .eq('chat_id', chatId)
        .single();

      if (!existingContract) {
        // Create new contract
        const { data: newContract, error: createError } = await supabase
          .from('exchange_contracts')
          .insert({
            chat_id: chatId,
            user1_id: chatData.user1_id,
            user2_id: chatData.user2_id,
            ...(isUser1 ? {
              user1_skill: data.userSkill,
              user1_is_mentorship: data.isMentorship
            } : {
              user2_skill: data.userSkill,
              user2_is_mentorship: data.isMentorship
            })
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating contract:', createError);
          toast.error("Failed to create exchange contract");
          return;
        }

        existingContract = newContract;
        
        // Update chat state to draft_contract
        await supabase
          .from('chats')
          .update({ exchange_state: 'draft_contract' })
          .eq('id', chatId);

        setExchangeState('draft_contract');

        // Update contract data locally
        const contractData = {
          currentUserSkill: isUser1 ? data.userSkill : undefined,
          otherUserSkill: isUser1 ? undefined : data.userSkill,
          currentUserIsMentorship: isUser1 ? data.isMentorship : false,
          otherUserIsMentorship: isUser1 ? false : data.isMentorship,
          currentUserAgreed: false,
          otherUserAgreed: false,
        };
        setContractData(contractData);

        // Send notification to other user
        try {
          const senderName = user.name || user.email || 'Someone';
          await notificationService.createNotification({
            userId: otherUser.id,
            title: 'Exchange Request',
            message: `${senderName} wants to start the exchange. Choose what you will teach.`,
            isRead: false,
            type: 'learning_match',
            actionUrl: `/chat/${chatId}`,
            metadata: { 
              senderId: user.id,
              senderName: senderName,
              chatId: chatId,
              skill: data.userSkill
            }
          });

          // Add system message to chat
          const systemMessage = {
            id: Date.now().toString(),
            sender_id: 'system',
            message: `${senderName} wants to start an exchange and will teach: ${data.isMentorship ? 'Mentorship Session' : data.userSkill}. Click "Start Exchange" to choose what you'll teach.`,
            created_at: new Date().toISOString(),
            chat_id: chatId
          };

          // Save system message to database
          await supabase
            .from('chat_messages')
            .insert(systemMessage);

          // Add to local messages
          setMessages(prev => [...prev, {
            id: systemMessage.id,
            senderId: 'system',
            message: systemMessage.message,
            timestamp: new Date(),
            type: 'system'
          }]);

        } catch (notificationError) {
          console.error('Failed to create exchange notification:', notificationError);
        }

        toast.success("Exchange started! Waiting for the other user to choose their skill.");
      } else {
        // Update existing contract with current user's selection
        const updateData = isUser1 ? {
          user1_skill: data.userSkill,
          user1_is_mentorship: data.isMentorship
        } : {
          user2_skill: data.userSkill,
          user2_is_mentorship: data.isMentorship
        };

        const { error: updateError } = await supabase
          .from('exchange_contracts')
          .update(updateData)
          .eq('id', existingContract.id);

        if (updateError) {
          console.error('Error updating contract:', updateError);
          toast.error("Failed to update exchange contract");
          return;
        }

        // Update local contract data
        const updatedContract = { ...existingContract, ...updateData };
        const contractData = {
          currentUserSkill: isUser1 ? updatedContract.user1_skill : updatedContract.user2_skill,
          otherUserSkill: isUser1 ? updatedContract.user2_skill : updatedContract.user1_skill,
          currentUserIsMentorship: isUser1 ? updatedContract.user1_is_mentorship : updatedContract.user2_is_mentorship,
          otherUserIsMentorship: isUser1 ? updatedContract.user2_is_mentorship : updatedContract.user1_is_mentorship,
          currentUserAgreed: isUser1 ? updatedContract.user1_agreed : updatedContract.user2_agreed,
          otherUserAgreed: isUser1 ? updatedContract.user2_agreed : updatedContract.user1_agreed,
        };
        setContractData(contractData);

        // Check if both users have selected their skills
        const bothSelected = (updatedContract.user1_skill || updatedContract.user1_is_mentorship) && 
                           (updatedContract.user2_skill || updatedContract.user2_is_mentorship);

        if (bothSelected) {
          // Move to contract_proposed state
          await supabase
            .from('chats')
            .update({ exchange_state: 'contract_proposed' })
            .eq('id', chatId);

          setExchangeState('contract_proposed');
          toast.success("Contract ready! Both users need to agree to start the exchange.");
        } else {
          toast.success("Your skill selection updated!");
        }
      }

      // Handle contract_proposed state - when user agrees to final contract
      if (exchangeState === 'contract_proposed' && contractData && !contractData.currentUserAgreed) {
        // Mark current user as agreed
        const isUser1 = chatData.user1_id === user.id;
        const agreeData = isUser1 ? { user1_agreed: true } : { user2_agreed: true };

        const { error: agreeError } = await supabase
          .from('exchange_contracts')
          .update(agreeData)
          .eq('chat_id', chatId);

        if (agreeError) {
          console.error('Error updating agreement:', agreeError);
          toast.error("Failed to agree to contract");
          return;
        }

        // Update local state
        const updatedContractData = { ...contractData, currentUserAgreed: true };
        setContractData(updatedContractData);

        // Check if both users have agreed
        const bothAgreed = isUser1 
          ? (true && contractData.otherUserAgreed)
          : (contractData.otherUserAgreed && true);

        if (bothAgreed) {
          // Move to active_exchange state
          await supabase
            .from('chats')
            .update({ 
              exchange_state: 'active_exchange',
              updated_at: new Date().toISOString()
            })
            .eq('id', chatId);

          setExchangeState('active_exchange');
          
          // Send notification to other user
          try {
            const senderName = user.name || user.email || 'Someone';
            await notificationService.createNotification({
              userId: otherUser.id,
              title: 'Exchange Active!',
              message: `Your exchange with ${senderName} is now active. Start learning!`,
              isRead: false,
              type: 'learning_match',
              actionUrl: `/chat/${chatId}`,
              metadata: { 
                senderId: user.id,
                senderName: senderName,
                chatId: chatId
              }
            });
          } catch (notificationError) {
            console.error('Failed to create activation notification:', notificationError);
          }

          toast.success("Exchange is now active! Start your learning session.");
        } else {
          toast.success("You agreed to the exchange. Waiting for the other person to agree.");
        }
      }

      // Close the modal
      setShowExchangeModal(false);

    } catch (error) {
      console.error('Error in handleExchangeAgreed:', error);
      toast.error("Failed to process exchange agreement");
    }
  };

  const handleExchangeFinished = () => {
    if (!contractData || !user || !otherUser) return;

    const updatedContract = {
      ...contractData,
      initiatorFinished: true,
      recipientFinished: contractData.otherUserAgreed, // Assuming recipientFinished is based on otherUserAgreed
    };

    if (updatedContract.initiatorFinished && updatedContract.otherUserAgreed) {
      updatedContract.status = 'completed';
    }

    setExchangeState(updatedContract.status); // Update state based on completion
    setShowFinishModal(false);

    // Create notification for the other user if exchange is completed
    if (updatedContract.status === 'completed') {
      (async () => {
        try {
          // Get partner's display name for notification
          const { data: partnerProfile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', user?.id)
            .single();

          const partnerName = partnerProfile?.display_name || 'Someone';

          await notificationService.createNotification({
            userId: otherUser.id,
            title: 'Exchange Completed!',
            message: `Your skill exchange with ${partnerName} has been completed`,
            isRead: false,
            type: 'exchange_completed',
            actionUrl: `/chat/${chatId}`,
            metadata: { 
              partnerId: user?.id,
              partnerName: partnerName,
              skill: contractData.currentUserSkill
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
      message: updatedContract.status === 'completed' 
        ? 'Exchange completed! Please leave a review for your learning partner.'
        : `Someone marked the exchange as finished.`,
      timestamp: new Date(),
      type: 'system'
    };
    setMessages(prev => [...prev, systemMessage]);

    if (updatedContract.status === 'completed') {
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
    console.log('⏳ Showing loading state');
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
    console.log('❌ Missing data, showing not found:', { otherUser: !!otherUser, chatData: !!chatData });
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

  if (!user) {
    console.log('❌ No user found, redirecting to login');
    navigate('/');
    return null;
  }

  const canStartExchange = exchangeState === 'pending_start' || 
    (exchangeState === 'draft_contract' && 
     (!contractData?.currentUserSkill && !contractData?.currentUserIsMentorship));
  const canFinishExchange = exchangeState === 'active_exchange' && (() => {
    // Check if 30 minutes have passed since exchange became active
    if (!chatData?.updated_at) return false;
    const exchangeStartTime = new Date(chatData.updated_at).getTime();
    const currentTime = new Date().getTime();
    const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds
    return (currentTime - exchangeStartTime) >= thirtyMinutes;
  })();
  const exchangeActive = exchangeState === 'active_exchange';

  console.log('🔍 Chat component render state:', {
    loading,
    user: user?.id,
    otherUser: otherUser?.id,
    chatData: chatData?.id,
    exchangeState,
    contractData,
    canStartExchange,
    canFinishExchange
  });

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
          {exchangeState !== 'pending_start' && (
            <Badge 
              variant={exchangeState === 'active' ? 'default' : 'secondary'}
              className="ml-auto"
            >
              Exchange {exchangeState}
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
        onClose={() => {
          console.log('🚪 ExchangeModal onClose called');
          setShowExchangeModal(false);
        }}
        onAgree={handleExchangeAgreed}
        chatId={chatId || ''}
        otherUserName={otherUser?.display_name || 'User'}
        currentUserSkills={(() => {
          const skills = user?.skillsToTeach || [];
          console.log('🎓 Current user skills being passed to modal:', skills);
          return skills;
        })()}
        exchangeState={exchangeState}
        contractData={contractData}
      />

      {/* Finish Exchange Modal */}
      <FinishExchangeModal
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        onConfirm={handleExchangeFinished}
        exchange={contractData as Exchange} // Pass contractData as exchange
        currentUserId={user?.id || ''}
      />

      {/* Review Modal */}
      {showReviewModal && otherUser && contractData && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          exchange={{
            id: chatId || '',
            status: 'completed',
            initiatorSkill: contractData.currentUserSkill || '',
            recipientSkill: contractData.otherUserSkill || '',
            isMentorship: contractData.currentUserIsMentorship || contractData.otherUserIsMentorship || false,
            initiatorAgreed: true,
            recipientAgreed: true,
            initiatorFinished: true,
            recipientFinished: true
          }}
          otherUser={{
            id: otherUser.id,
            name: otherUser.display_name,
            display_name: otherUser.display_name,
            profilePicture: otherUser.avatar_url,
            avatar_url: otherUser.avatar_url
          }}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
};

export default Chat;