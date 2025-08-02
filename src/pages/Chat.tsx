import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useOptimizedPolling } from '@/hooks/useOptimizedPolling';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ExchangeModal } from '@/components/chat/ExchangeModal';
import { FinishExchangeModal } from '@/components/chat/FinishExchangeModal';
import { ExchangeReviewModal } from '@/components/review/ExchangeReviewModal';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import { transliterateName } from '@/utils/translationUtils';
import { 
  Send, 
  ArrowLeft, 
  Play, 
  Square, 
  Loader2,
  ChevronDown
} from 'lucide-react';

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

// Memoized ChatMessage component moved outside to prevent recreation
const ChatMessageComponent = React.memo(({ 
  msg, 
  currentUserId, 
  otherUser,
  currentUserAvatar,
  currentUserName
}: { 
  msg: ChatMessage; 
  currentUserId?: string; 
  otherUser?: any;
  currentUserAvatar?: string;
  currentUserName?: string;
}) => {
  const isCurrentUser = msg.senderId === currentUserId;
  const isSystemMessage = msg.type === 'system' || msg.message.startsWith('[SYSTEM]');

  if (isSystemMessage) {
    return (
      <div key={msg.id} className="flex justify-center my-4">
        <div className="bg-muted px-4 py-2 rounded-lg text-sm text-muted-foreground">
          {msg.message.replace('[SYSTEM] ', '')}
        </div>
      </div>
    );
  }

  return (
    <div key={msg.id} className={`flex gap-2 mb-4 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={isCurrentUser ? currentUserAvatar : otherUser?.avatar_url} />
        <AvatarFallback>
          {isCurrentUser 
            ? (currentUserName?.charAt(0).toUpperCase() || currentUserId?.charAt(0).toUpperCase() || 'Y')
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
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.msg.id === nextProps.msg.id &&
    prevProps.msg.message === nextProps.msg.message &&
    prevProps.msg.timestamp.getTime() === nextProps.msg.timestamp.getTime() &&
    prevProps.currentUserId === nextProps.currentUserId &&
    prevProps.currentUserAvatar === nextProps.currentUserAvatar &&
    prevProps.currentUserName === nextProps.currentUserName &&
    prevProps.otherUser?.id === nextProps.otherUser?.id &&
    prevProps.otherUser?.avatar_url === nextProps.otherUser?.avatar_url &&
    prevProps.otherUser?.display_name === nextProps.otherUser?.display_name
  );
});

const Chat = React.memo(() => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [exchangeState, setExchangeState] = useState<string>('pending_start');
  const [contractData, setContractData] = useState<{
    currentUserSkill?: string;
    otherUserSkill?: string;
    currentUserAgreed?: boolean;
    otherUserAgreed?: boolean;
    currentUserFinished?: boolean;
    otherUserFinished?: boolean;
  } | null>(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isUpdatingState, setIsUpdatingState] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Performance monitoring
  usePerformanceMonitor('Chat');

  // Memoize user data to prevent unnecessary re-renders
  const memoizedUserData = useMemo(() => ({
    id: user?.id,
    name: user?.name,
    profilePicture: user?.profilePicture
  }), [user?.id, user?.name, user?.profilePicture]);

  // Memoize other user data
  const memoizedOtherUser = useMemo(() => otherUser, [otherUser?.id, otherUser?.display_name, otherUser?.avatar_url]);

  // Memoize expensive calculations
  const canStartExchange = useMemo(() => {
    return exchangeState === 'pending_start' || 
      (exchangeState === 'draft_contract' && 
       !contractData?.currentUserSkill);
  }, [exchangeState, contractData?.currentUserSkill]);

  const canFinishExchange = useMemo(() => {
    if (exchangeState !== 'active_exchange') return false;
    // Show finish button if exchange is active and user hasn't finished yet
    return !contractData?.currentUserFinished;
  }, [exchangeState, contractData?.currentUserFinished]);

  const exchangeActive = useMemo(() => {
    return exchangeState === 'active_exchange';
  }, [exchangeState]);

  // Check if user arrived via exchange notification
  useEffect(() => {
    const checkExchangeNotification = async () => {
      if (!user?.id || !chatId) return;
      
      try {
        // Check for recent exchange notifications for this chat
        const { data: notifications } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('chat_id', chatId)
          .eq('type', 'learning_match')
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(1);

        if (notifications && notifications.length > 0) {
          const notification = notifications[0];
          const metadata = notification.metadata || {};
          
          // Check if this is an exchange request notification
          const isExchangeRequest = notification.title === 'Exchange Request' && 
            (notification.message.includes('wants to start the exchange') || 
             metadata.shouldOpenModal === true);
          
          // Check if this is an exchange activation notification
          const isExchangeActivation = notification.title === 'Exchange Active!' &&
            notification.message.includes('is now active');
          
          if (isExchangeRequest) {
            console.log('🎯 Auto-opening exchange modal from notification');
            setShowExchangeModal(true);
            
            // Mark notification as read
            await supabase
              .from('notifications')
              .update({ is_read: true })
              .eq('id', notification.id);
          } else if (isExchangeActivation) {
            console.log('🎯 Exchange is now active - showing success message');
            toast.success("Exchange is now active! Start your learning session.");
            
            // Mark notification as read
            await supabase
              .from('notifications')
              .update({ is_read: true })
              .eq('id', notification.id);
          }
        }
      } catch (error) {
        console.error('Error checking exchange notifications:', error);
      }
    };

    checkExchangeNotification();
  }, [user?.id, chatId]);

  useEffect(() => {
    if (chatId && user) {
      fetchChatData();
    }
  }, [chatId, user]);

  // Optimized polling for messages
  const { isActive: isPollingMessages } = useOptimizedPolling(
    async () => {
      if (!chatId || !user || loading || !chatData || !otherUser) return; // Don't poll while loading or missing data
      
      try {
        let newMessages = null;
        
        // Try 'messages' table first
        try {
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });

          if (!error && data) {
            newMessages = data;
          }
        } catch (e) {
          console.log('⚠️ "messages" table not found in polling, trying "chat_messages"');
        }

        // Try 'chat_messages' table if 'messages' failed
        if (!newMessages) {
          try {
            const { data, error } = await supabase
              .from('chat_messages')
              .select('*')
              .eq('chat_id', chatId)
              .order('created_at', { ascending: true });

            if (!error && data) {
              newMessages = data;
            }
          } catch (e) {
            console.log('⚠️ "chat_messages" table not found in polling');
          }
        }

        if (newMessages) {
          const transformedMessages = newMessages.map((msg: any) => ({
            id: msg.id,
            senderId: msg.sender_id,
            message: msg.content || msg.message,
            timestamp: new Date(msg.created_at),
            type: msg.type || 'text'
          }));
          
          // Only update if messages actually changed
          setMessages(prevMessages => {
            if (JSON.stringify(prevMessages) !== JSON.stringify(transformedMessages)) {
              // Mark new messages as read when they come in
              const newMessageIds = transformedMessages
                .filter(msg => msg.senderId !== user?.id)
                .map(msg => msg.id);
              
              if (newMessageIds.length > 0) {
                // Mark messages as read in the background
                supabase
                  .from('chat_messages')
                  .update({ is_read: true })
                  .in('id', newMessageIds)
                  .then(() => {
                    console.log('✅ New messages marked as read during polling');
                  })
                  .catch(error => {
                    console.error('Error marking new messages as read:', error);
                  });
              }
              
              return transformedMessages;
            }
            return prevMessages;
          });
        }
      } catch (error) {
        console.error('Error in message polling:', error);
        // Don't let polling errors affect the UI
      }
    },
    { 
      interval: 15000, // Increased interval to reduce frequency (15 seconds)
      enabled: !!chatId && !!user && !loading && !!chatData && !!otherUser, // Don't poll while loading or missing data
      maxRetries: 3
    }
  );

  // Optimized polling for exchange state and contract data
  const { isActive: isPollingExchange } = useOptimizedPolling(
    async () => {
      if (!chatId || !user || loading || !chatData || !otherUser) return; // Don't poll while loading or missing data
      
      try {
        // Fetch updated chat state
        const { data: updatedChat, error: chatError } = await supabase
          .from('chats')
          .select('*, exchange_state')
          .eq('id', chatId)
          .single();

        if (chatError) {
          console.error('Error polling chat state:', chatError);
          return;
        }

        if (updatedChat) {
          setExchangeState(updatedChat.exchange_state || 'pending_start');
        }

        // Fetch updated contract data
        const { data: updatedContract, error: contractError } = await supabase
          .from('exchange_contracts')
          .select('*')
          .eq('chat_id', chatId)
          .single();

        if (contractError && contractError.code !== 'PGRST116') {
          console.error('Error polling contract data:', contractError);
          return;
        }

        if (updatedContract) {
          const isUser1 = chatData?.user1_id === user.id;
          const contractData = {
            currentUserSkill: isUser1 ? updatedContract.user1_skill : updatedContract.user2_skill,
            otherUserSkill: isUser1 ? updatedContract.user2_skill : updatedContract.user1_skill,
            currentUserAgreed: isUser1 ? updatedContract.user1_agreed : updatedContract.user2_agreed,
            otherUserAgreed: isUser1 ? updatedContract.user2_agreed : updatedContract.user1_agreed,
            currentUserFinished: isUser1 ? updatedContract.user1_finished : updatedContract.user2_finished,
            otherUserFinished: isUser1 ? updatedContract.user2_finished : updatedContract.user1_finished,
          };
          setContractData(contractData);

          // Auto-open modal for second user when contract is created
          if (updatedContract && !showExchangeModal && exchangeState === 'draft_contract') {
            const hasUserSelected = contractData.currentUserSkill;
            const hasOtherUserSelected = contractData.otherUserSkill;
            
            // If other user has selected but current user hasn't, auto-open modal
            if (hasOtherUserSelected && !hasUserSelected) {
              console.log('🎯 Auto-opening modal - other user has selected their skill');
              setShowExchangeModal(true);
            }
          }

          // Auto-open modal for contract agreement when both users have selected skills
          if (updatedContract && !showExchangeModal && exchangeState === 'contract_proposed') {
            const hasUserSelected = contractData.currentUserSkill;
            const hasOtherUserSelected = contractData.otherUserSkill;
            const userAgreed = contractData.currentUserAgreed;
            
            // If both users have selected skills but current user hasn't agreed yet, auto-open modal
            if (hasUserSelected && hasOtherUserSelected && !userAgreed) {
              console.log('🎯 Auto-opening modal - contract ready for agreement');
              setShowExchangeModal(true);
            }
          }

          // Auto-open finish modal when other user has finished
          if (updatedContract && !showFinishModal && exchangeState === 'active_exchange') {
            const userFinished = contractData.currentUserFinished;
            const otherUserFinished = contractData.otherUserFinished;
            
            // If other user has finished but current user hasn't, auto-open finish modal
            if (otherUserFinished && !userFinished) {
              console.log('🎯 Auto-opening finish modal - other user has finished');
              setShowFinishModal(true);
            }
          }
        }
      } catch (error) {
        console.error('Error in exchange polling:', error);
        // Don't let polling errors crash the component
      }
    },
    { 
      interval: 20000, // Increased interval to reduce frequency (20 seconds)
      enabled: !!chatId && !!user && !loading && !!chatData && !!otherUser && exchangeState !== 'active_exchange', // Don't poll while loading or missing data
      maxRetries: 3
    }
  );

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
            currentUserAgreed: isUser1 ? contract.user1_agreed : contract.user2_agreed,
            otherUserAgreed: isUser1 ? contract.user2_agreed : contract.user1_agreed,
            currentUserFinished: isUser1 ? contract.user1_finished : contract.user2_finished,
            otherUserFinished: isUser1 ? contract.user2_finished : contract.user1_finished,
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

      // Fetch messages - try different table names
      console.log('💬 Fetching messages...');
      let messagesData = null;
      let messagesError = null;

      // Try 'messages' table first
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });
        
        if (!error && data) {
          messagesData = data;
          console.log('✅ Messages found in "messages" table');
        }
      } catch (e) {
        console.log('⚠️ "messages" table not found, trying "chat_messages"');
      }

      // Try 'chat_messages' table if 'messages' failed
      if (!messagesData) {
        try {
          const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });
          
          if (!error && data) {
            messagesData = data;
            console.log('✅ Messages found in "chat_messages" table');
          }
        } catch (e) {
          console.log('⚠️ "chat_messages" table not found');
        }
      }

      if (messagesData) {
        const transformedMessages = messagesData.map((msg: any) => ({
          id: msg.id,
          senderId: msg.sender_id,
          message: msg.content || msg.message,
          timestamp: new Date(msg.created_at),
          type: msg.type || 'text'
        }));
        setMessages(transformedMessages);
        console.log('✅ Messages set:', transformedMessages.length, 'messages');
        
        // Mark messages as read when chat is opened
        try {
          const { error } = await supabase
            .from('chat_messages')
            .update({ is_read: true })
            .eq('chat_id', chatId)
            .neq('sender_id', user?.id);
          
          if (error) {
            console.error('Error marking messages as read:', error);
          } else {
            console.log('✅ Messages marked as read for chat:', chatId);
          }
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      } else {
        console.log('⚠️ No messages found, setting empty array');
        setMessages([]);
      }

    } catch (error) {
      console.error('Error in fetchChatData:', error);
      toast.error("Failed to load chat data");
      navigate('/messages');
    } finally {
      // Add a small delay to ensure all state updates are processed before setting loading to false
      setTimeout(() => {
        setLoading(false);
        console.log('✅ Loading complete, polling can now start');
      }, 100);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Only scroll to bottom if user is already at the bottom or if it's a new message
  const shouldScrollToBottom = () => {
    const messagesContainer = document.querySelector('.h-96.overflow-y-auto');
    if (!messagesContainer) return false;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer as HTMLElement;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
    return isAtBottom;
  };

  useEffect(() => {
    // Only auto-scroll if user is at the bottom and it's not the initial load
    if (!isInitialLoad && shouldScrollToBottom()) {
      scrollToBottom();
    }
  }, [messages, isInitialLoad]);

  // Initial load - scroll to top to show messages from the beginning
  useEffect(() => {
    if (messages.length > 0 && isInitialLoad) {
      const messagesContainer = document.querySelector('.h-96.overflow-y-auto');
      if (messagesContainer) {
        (messagesContainer as HTMLElement).scrollTop = 0;
        setIsInitialLoad(false); // Mark initial load as complete
      }
    }
  }, [messages.length, isInitialLoad]);

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
      // Use English transliteration for Arabic names as per user preference
      const displayName = language === 'ar' ? transliterateName(senderName, 'en') : senderName;

      // Create notification for the other user about new message
      try {
        await createNotification({
          userId: otherUser.id,
          title: t('actions.newMessage'),
          message: `${displayName}: ${message.trim().substring(0, 50)}${message.trim().length > 50 ? '...' : ''}`,
          isRead: false,
          type: 'new_message',
          actionUrl: `/chat/${chatId}`,
          metadata: { 
            senderId: user.id,
            senderName: displayName,
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
    if (isUpdatingState) return; // Prevent opening if we're updating state
    console.log('🚀 Opening exchange modal');
    setShowExchangeModal(true);
  };

  const handleFinishExchange = () => {
    setShowFinishModal(true);
  };

  const handleExchangeAgreed = async (data: { userSkill: string }) => {
    if (!user || !chatData || !otherUser) return;

    try {
      console.log('🤝 Processing exchange agreement:', data);
      setIsUpdatingState(true); // Prevent polling interference

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
              user1_skill: data.userSkill || null
            } : {
              user2_skill: data.userSkill || null
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
          currentUserAgreed: false,
          otherUserAgreed: false,
        };
        setContractData(contractData);

        // Send notification to other user
        try {
          const senderName = user.name || user.email || 'Someone';
          const displayName = language === 'ar' ? transliterateName(senderName, 'en') : senderName;
          await createNotification({
            userId: otherUser.id,
            title: t('actions.exchangeRequest'),
            message: `${displayName} wants to start the exchange. Choose what you will teach.`,
            isRead: false,
            type: 'learning_match',
            actionUrl: `/chat/${chatId}`,
            metadata: { 
              senderId: user.id,
              senderName: displayName,
              chatId: chatId,
              skill: data.userSkill,
              exchangeState: 'draft_contract',
              shouldOpenModal: true
            }
          });

          // Add system message to chat
          const systemMessage = {
            id: Date.now().toString(),
            sender_id: user?.id || '', // Use current user's ID
            message: `[SYSTEM] ${senderName} wants to start an exchange and will teach: ${data.userSkill}. Click "Start Exchange" to choose what you'll teach.`,
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
            senderId: user?.id || '', // Use current user's ID
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
          user1_skill: data.userSkill
        } : {
          user2_skill: data.userSkill
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
          currentUserAgreed: isUser1 ? updatedContract.user1_agreed : updatedContract.user2_agreed,
          otherUserAgreed: isUser1 ? updatedContract.user2_agreed : updatedContract.user1_agreed,
        };
        setContractData(contractData);

        // Check if both users have selected their skills (including "Nothing" case)
        const user1Selected = updatedContract.user1_skill;
        const user2Selected = updatedContract.user2_skill;
        const bothSelected = user1Selected && user2Selected;

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

      // Close the modal
      setShowExchangeModal(false);

      // Add a small delay to ensure state updates are processed
      setTimeout(() => {
        console.log('✅ Modal closed and state updated');
      }, 100);

    } catch (error) {
      console.error('Error in handleExchangeAgreed:', error);
      toast.error("Failed to process exchange agreement");
    } finally {
      setIsUpdatingState(false); // Re-enable polling
    }
  };

  const handleAgreeToContract = async () => {
    if (!user || !chatData || !otherUser || !contractData) return;

    try {
      console.log('🤝 Agreeing to final contract');
      setIsUpdatingState(true); // Prevent polling interference
      
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
        
        // Add system message to chat
        const systemMessage = {
          id: Date.now().toString(),
          sender_id: user?.id || '', // Use current user's ID
          message: `[SYSTEM] Exchange is now active! Both users have agreed to the contract.`,
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
          senderId: user?.id || '', // Use current user's ID
          message: systemMessage.message,
          timestamp: new Date(),
          type: 'system'
        }]);
        
        // Send notification to other user
        try {
          const senderName = user.name || user.email || 'Someone';
          const displayName = language === 'ar' ? transliterateName(senderName, 'en') : senderName;
          await createNotification({
            userId: otherUser.id,
            title: t('actions.exchangeActive'),
            message: `Your exchange with ${displayName} is now active. Start learning!`,
            isRead: false,
            type: 'learning_match',
            actionUrl: `/chat/${chatId}`,
            metadata: { 
              senderId: user.id,
              senderName: displayName,
              chatId: chatId
            }
          });
        } catch (notificationError) {
          console.error('Failed to create activation notification:', notificationError);
        }

        toast.success("Exchange is now active! Start your learning session.");
      } else {
        // Send notification to other user to review the contract
        try {
          const senderName = user.name || user.email || 'Someone';
          const displayName = language === 'ar' ? transliterateName(senderName, 'en') : senderName;
          await createNotification({
            userId: otherUser.id,
            title: t('actions.contractReadyForReview'),
            message: `${displayName} has agreed to the exchange contract. Please review and agree to start the exchange.`,
            isRead: false,
            type: 'learning_match',
            actionUrl: `/chat/${chatId}`,
            metadata: { 
              senderId: user.id,
              senderName: displayName,
              chatId: chatId,
              shouldOpenModal: true
            }
          });
        } catch (notificationError) {
          console.error('Failed to create contract review notification:', notificationError);
        }
        
        toast.success("You agreed to the exchange. Waiting for the other person to agree.");
      }

      // Close the modal
      setShowExchangeModal(false);

      // Add a small delay to ensure state updates are processed
      setTimeout(() => {
        console.log('✅ Contract agreement modal closed and state updated');
      }, 100);

    } catch (error) {
      console.error('Error in handleAgreeToContract:', error);
      toast.error("Failed to agree to contract");
    } finally {
      setIsUpdatingState(false); // Re-enable polling
    }
  };

  const handleDeclineContract = async () => {
    if (!user || !chatData || !otherUser) return;

    try {
      console.log('❌ Declining contract');
      setIsUpdatingState(true); // Prevent polling interference
      
      // Delete the contract completely to start fresh
      await supabase
        .from('exchange_contracts')
        .delete()
        .eq('chat_id', chatId);

      // Reset chat state to pending_start to allow new exchange
      await supabase
        .from('chats')
        .update({ 
          exchange_state: 'pending_start',
          updated_at: new Date().toISOString()
        })
        .eq('id', chatId);

      setExchangeState('pending_start');
      
      // Clear local contract data completely
      setContractData(null);
      
      // Add system message to chat
      const systemMessage = {
        id: Date.now().toString(),
        sender_id: user?.id || '', // Use current user's ID
        message: `[SYSTEM] Exchange was declined. You can discuss and start a new exchange anytime.`,
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
        senderId: user?.id || '', // Use current user's ID
        message: systemMessage.message,
        timestamp: new Date(),
        type: 'system'
      }]);
      
      // Send notification to other user
      try {
        const senderName = user.name || user.email || 'Someone';
        await createNotification({
          userId: otherUser.id,
          title: 'Exchange Declined',
          message: `${senderName} declined the exchange. You can discuss and start a new one anytime.`,
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
        console.error('Failed to create decline notification:', notificationError);
      }

      toast.success("Exchange declined. You can discuss and start a new exchange anytime.");
      
      // Close the modal
      setShowExchangeModal(false);

    } catch (error) {
      console.error('Error in handleDeclineContract:', error);
      toast.error("Failed to decline contract");
    } finally {
      setIsUpdatingState(false); // Re-enable polling
    }
  };

  const handleExchangeFinished = async () => {
    if (!contractData || !user || !chatData || !otherUser) return;

    try {
      console.log('🏁 Marking exchange as finished');
      setIsUpdatingState(true); // Prevent polling interference
      
      // Mark current user as finished
      const isUser1 = chatData.user1_id === user.id;
      const finishData = isUser1 ? { user1_finished: true } : { user2_finished: true };

      console.log('🏁 Attempting to update contract with finish data:', finishData);
      console.log('🏁 Chat ID:', chatId);
      
      const { data: updateResult, error: finishError } = await supabase
        .from('exchange_contracts')
        .update(finishData)
        .eq('chat_id', chatId)
        .select();

      console.log('🏁 Update result:', updateResult);
      console.log('🏁 Update error:', finishError);

      if (finishError) {
        console.error('Error marking exchange as finished:', finishError);
        toast.error(`Failed to mark exchange as finished: ${finishError.message}`);
        return;
      }

      // Update local state
      const updatedContractData = { ...contractData, currentUserFinished: true };
      setContractData(updatedContractData);

      // Check if both users have finished
      const bothFinished = isUser1 
        ? (true && contractData.otherUserFinished)
        : (contractData.otherUserFinished && true);

      if (bothFinished) {
        // Mark exchange as completed
        await supabase
          .from('exchange_contracts')
          .update({ 
            finished_at: new Date().toISOString()
          })
          .eq('chat_id', chatId);

        // Update chat state to completed
        await supabase
          .from('chats')
          .update({ 
            exchange_state: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', chatId);

        setExchangeState('completed');
        
        // Add system message to chat
        const systemMessage = {
          id: Date.now().toString(),
          sender_id: user?.id || '', // Use current user's ID
          message: `[SYSTEM] Exchange completed! Both users have finished. Please leave a review for your learning partner.`,
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
          senderId: user?.id || '', // Use current user's ID
          message: systemMessage.message,
          timestamp: new Date(),
          type: 'system'
        }]);
        
        // Send notification to other user
        try {
          const senderName = user.name || user.email || 'Someone';
          const displayName = language === 'ar' ? transliterateName(senderName, 'en') : senderName;
          await createNotification({
            userId: otherUser.id,
            title: t('actions.exchangeCompleted'),
            message: `Your exchange with ${displayName} has been completed. Please leave a review!`,
            isRead: false,
            type: 'exchange_completed',
            actionUrl: `/chat/${chatId}`,
            metadata: { 
              senderId: user.id,
              senderName: displayName,
              chatId: chatId
            }
          });
        } catch (notificationError) {
          console.error('Failed to create completion notification:', notificationError);
        }

        toast.success("Exchange completed! Please leave a review for your learning partner.");
        
        // Show review modal after a short delay
        setTimeout(() => {
          setShowReviewModal(true);
        }, 1000);
      } else {
        // Add system message to chat
        const systemMessage = {
          id: Date.now().toString(),
          sender_id: user?.id || '', // Use current user's ID
          message: `[SYSTEM] You marked the exchange as finished. Waiting for the other person to finish.`,
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
          senderId: user?.id || '', // Use current user's ID
          message: systemMessage.message,
          timestamp: new Date(),
          type: 'system'
        }]);
        
        // Send notification to other user
        try {
          const senderName = user.name || user.email || 'Someone';
          const displayName = language === 'ar' ? transliterateName(senderName, 'en') : senderName;
          await createNotification({
            userId: otherUser.id,
            title: t('actions.exchangeFinished'),
            message: `${displayName} marked the exchange as finished. Please finish yours too!`,
            isRead: false,
            type: 'exchange_finished',
            actionUrl: `/chat/${chatId}`,
            metadata: { 
              senderId: user.id,
              senderName: displayName,
              chatId: chatId
            }
          });
        } catch (notificationError) {
          console.error('Failed to create finish notification:', notificationError);
        }

        toast.success("You marked the exchange as finished. Waiting for the other person to finish.");
      }

      // Close the modal
      setShowFinishModal(false);

    } catch (error) {
      console.error('Error in handleExchangeFinished:', error);
      toast.error("Failed to mark exchange as finished");
    } finally {
      setIsUpdatingState(false); // Re-enable polling
    }
  };

  const handleReviewSubmitted = () => {
    toast.success("Thank you!", {
      description: "Your review helps improve our community. Keep learning and teaching!",
    });
  };

  // Memoize the renderMessage function to prevent unnecessary re-renders
  const renderMessage = useCallback((msg: ChatMessage) => {
    const isCurrentUser = msg.senderId === user?.id;
    const isSystemMessage = msg.type === 'system' || msg.message.startsWith('[SYSTEM]');

    if (isSystemMessage) {
      return (
        <div key={msg.id} className="flex justify-center my-4">
          <div className="bg-muted px-4 py-2 rounded-lg text-sm text-muted-foreground">
            {msg.message.replace('[SYSTEM] ', '')}
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
              ? (user?.id?.charAt(0).toUpperCase() || 'Y')
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
  }, [user?.id, otherUser?.avatar_url, otherUser?.display_name]);

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

  if (!user) {
    console.log('❌ No user found, redirecting to login');
    navigate('/');
    return null;
  }

  if (!otherUser || !chatData) {
    console.log('❌ Missing data, showing not found:', { otherUser: !!otherUser, chatData: !!chatData });
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Chat not found</h2>
          <p className="text-muted-foreground mb-4">The conversation you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/messages')}>{t('actions.backToMessages')}</Button>
        </div>
      </div>
    );
  }

  // Add error boundary for the main content
  try {
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/messages')}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('actions.backToMessages')}
              </Button>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={otherUser.avatar_url} />
                  <AvatarFallback>
                    {otherUser.display_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">{otherUser.display_name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {exchangeState === 'active_exchange' ? 'Active Exchange' : 'Chat'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Exchange Status Badge */}
            {exchangeState !== 'pending_start' && (
              <Badge variant={exchangeState === 'active_exchange' ? 'default' : 'secondary'}>
                {exchangeState === 'active_exchange' ? 'Active Exchange' : 'Draft Exchange'}
              </Badge>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="container mx-auto max-w-4xl p-4 pb-24">
          <Card>
            <CardContent className="p-6">
              <div className="h-96 overflow-y-auto mb-4 relative">
                {messages.map(msg => (
                  <ChatMessageComponent 
                    key={msg.id}
                    msg={msg} 
                    currentUserId={memoizedUserData.id} 
                    otherUser={memoizedOtherUser} 
                    currentUserAvatar={memoizedUserData.profilePicture}
                    currentUserName={memoizedUserData.name}
                  />
                ))}
                <div ref={messagesEndRef} />
                
                {/* Scroll to bottom button - only show if not at bottom */}
                {messages.length > 0 && !shouldScrollToBottom() && !isInitialLoad && (
                  <Button
                    onClick={scrollToBottom}
                    size="sm"
                    className="absolute bottom-4 right-4 rounded-full w-10 h-10 p-0 shadow-lg"
                    variant="secondary"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                )}
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
          onFinalAgree={handleAgreeToContract}
          onDecline={handleDeclineContract}
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
          exchange={contractData}
          currentUserId={user?.id || ''}
        />

        {/* Review Modal */}
        {showReviewModal && otherUser && contractData && (
          <ExchangeReviewModal
            isOpen={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            exchange={{
              id: chatId || '',
              otherUser: {
                id: otherUser.id,
                name: otherUser.display_name,
                avatar: otherUser.avatar_url
              },
              skill: `${contractData.currentUserSkill || ''} ↔ ${contractData.otherUserSkill || ''}`,
              type: 'exchange',
              description: `Exchange between ${user?.display_name || 'You'} and ${otherUser.display_name}`
            }}
            onReviewSubmitted={handleReviewSubmitted}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error('Error rendering Chat component:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">There was an error loading the chat.</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }
});

export default Chat;