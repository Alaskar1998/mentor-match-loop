import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
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
import { logger } from '@/utils/logger';
import {
  Send,
  ArrowLeft,
  Play,
  Square,
  Loader2,
  RefreshCw,
} from 'lucide-react';

// Global type declarations for cleanup timers
declare global {
  interface Window {
    chatCleanupTimers?: number[];
    chatScrollTimeout?: number;
  }
}

interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system';
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

// Constants for better maintainability
const CHAT_LOADING_TIMEOUT = 10000;
const SCROLL_DELAY = 100;
const MESSAGE_LIMIT = 20;

// Chat message component optimized for performance
const ChatMessageComponent = React.memo(
  ({
    msg,
    currentUserId,
    otherUser,
    currentUserAvatar,
    currentUserName,
  }: {
    msg: ChatMessage;
    currentUserId?: string;
    otherUser?: OtherUser | null;
    currentUserAvatar?: string;
    currentUserName?: string;
  }) => {
    const isCurrentUser = useMemo(
      () => msg.senderId === currentUserId,
      [msg.senderId, currentUserId]
    );
    
    const isSystemMessage = useMemo(
      () => msg.type === 'system' || msg.message.startsWith('[SYSTEM]'),
      [msg.type, msg.message]
    );

    const formattedTime = useMemo(() => {
      return msg.timestamp.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }, [msg.timestamp]);

    const displayName = useMemo(() => {
      if (isCurrentUser) {
        return currentUserName || 'You';
      }
      return otherUser?.display_name || 'User';
    }, [isCurrentUser, currentUserName, otherUser?.display_name]);

    const avatarSrc = useMemo(() => {
      return isCurrentUser ? currentUserAvatar : otherUser?.avatar_url;
    }, [isCurrentUser, currentUserAvatar, otherUser?.avatar_url]);

    const avatarFallback = useMemo(() => {
      return displayName.charAt(0).toUpperCase();
    }, [displayName]);

    if (isSystemMessage) {
      return (
        <div className="flex justify-center my-4">
          <div className="bg-muted px-4 py-2 rounded-lg text-sm text-muted-foreground">
            {msg.message.replace('[SYSTEM] ', '')}
          </div>
        </div>
      );
    }

    return (
      <div className={`mb-4 ${isCurrentUser ? 'flex justify-end' : 'flex justify-start'}`}>
        <div className={`flex gap-3 max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <Link 
            to={`/profile/${isCurrentUser ? currentUserId : otherUser?.id}`}
            className="hover:opacity-80 transition-opacity"
          >
            <Avatar className="w-8 h-8 flex-shrink-0 cursor-pointer">
              <AvatarImage
                src={avatarSrc}
                alt={displayName}
              />
              <AvatarFallback>
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1">
            <div className={`flex items-center gap-2 mb-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              <span className="font-medium text-sm">
                {displayName}
              </span>
              <span className="text-xs text-muted-foreground">
                {formattedTime}
              </span>
            </div>
            <div className={`text-sm p-3 rounded-lg ${
              isCurrentUser 
                ? 'bg-primary text-primary-foreground ml-auto' 
                : 'bg-muted text-foreground'
            }`}>
              {msg.message}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ChatMessageComponent.displayName = 'ChatMessageComponent';

// Main Chat component
const Chat = React.memo(() => {
  const { exchangeId: chatId } = useParams<{ exchangeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const { t } = useTranslation();

  usePerformanceMonitor('Chat', { 
    threshold: 50,
    enabled: process.env.NODE_ENV === 'development'
  });

  // State management - optimized with better typing
  const [state, setState] = useState<{
    messages: ChatMessage[];
    newMessage: string;
    loading: boolean;
    sending: boolean;
    otherUser: OtherUser | null;
    chatData: ChatData | null;
    exchangeState: string;
    contractData: any;
    showExchangeModal: boolean;
    showFinishModal: boolean;
    showReviewModal: boolean;
    isExchangeActive: boolean;
    exchangeNotification: string | null;
    isUpdatingState: boolean;
    hasReviewed: boolean;
  }>({
    messages: [],
    newMessage: '',
    loading: true,
    sending: false,
    otherUser: null,
    chatData: null,
    exchangeState: 'pending_start',
    contractData: null,
    showExchangeModal: false,
    showFinishModal: false,
    showReviewModal: false,
    isExchangeActive: false,
    exchangeNotification: null,
    isUpdatingState: false,
    hasReviewed: false,
  });

  const {
    messages, newMessage, loading, sending, otherUser, chatData, 
    exchangeState, contractData, showExchangeModal, showFinishModal,
    showReviewModal, isExchangeActive, exchangeNotification, 
    isUpdatingState, hasReviewed
  } = state;

  // Optimized state update function
  const updateState = useCallback((updates: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized values - optimized dependencies
  const currentUserId = useMemo(() => user?.id, [user?.id]);
  const currentUserName = useMemo(
    () => user?.name || user?.email || 'You',
    [user?.name, user?.email]
  );
  const currentUserAvatar = useMemo(() => user?.profilePicture || '', [user?.profilePicture]);

  // Memoized computed values
  const isUser1 = useMemo(() => {
    return chatData?.user1_id === currentUserId;
  }, [chatData?.user1_id, currentUserId]);

  const canStartExchange = useMemo(() => {
    return exchangeState === 'pending_start' && !contractData;
  }, [exchangeState, contractData]);

  const canFinishExchange = useMemo(() => {
    return exchangeState === 'active_exchange';
  }, [exchangeState]);

  // Early validation - optimized with early return
  useEffect(() => {
    if (!chatId || chatId === 'undefined' || chatId === 'null') {
      toast.error('Invalid chat ID');
      navigate('/dashboard');
      return;
    }
  }, [chatId, navigate]);

  // Optimized scroll to bottom function
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior });
      }
    }, SCROLL_DELAY);
  }, []);

  // Fetch chat data - optimized with better error handling and batching
  const fetchChatData = useCallback(async () => {
    if (!chatId || !currentUserId) return;

    // Set loading timeout
    chatLoadingTimeoutRef.current = setTimeout(() => {
      toast.error('Chat loading timeout - please try again');
      setState(prev => ({ ...prev, loading: false }));
      navigate('/dashboard');
    }, CHAT_LOADING_TIMEOUT);

    try {
      // Fetch chat data and messages in parallel for better performance
      const [chatDataResult, messagesResult, contractResult] = await Promise.allSettled([
        supabase
          .from('chats')
          .select('*')
          .eq('id', chatId)
          .single(),
        supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: false })
          .limit(MESSAGE_LIMIT),
        supabase
          .from('exchange_contracts')
          .select('*')
          .eq('chat_id', chatId)
          .single()
      ]);

      // Clear timeout early on success
      if (chatLoadingTimeoutRef.current) {
        clearTimeout(chatLoadingTimeoutRef.current);
        chatLoadingTimeoutRef.current = null;
      }

      // Handle chat data
      if (chatDataResult.status === 'rejected' || !chatDataResult.value.data) {
        toast.error('Chat not found or no longer exists');
        setState(prev => ({ ...prev, loading: false }));
        navigate('/dashboard');
        return;
      }

      const chatData = chatDataResult.value.data;
      const otherUserId = chatData.user1_id === currentUserId
        ? chatData.user2_id
        : chatData.user1_id;

      // Fetch other user data
      const { data: otherUserData } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, skills_to_teach')
        .eq('id', otherUserId)
        .single();

      // Apply state updates
      setState(prev => ({
        ...prev,
        chatData: chatData,
        exchangeState: chatData.exchange_state || 'pending_start',
        otherUser: otherUserData ? {
          id: otherUserData.id,
          display_name: otherUserData.display_name || '',
          avatar_url: otherUserData.avatar_url || '',
          skills_to_teach: Array.isArray(otherUserData.skills_to_teach) ? otherUserData.skills_to_teach : []
        } : null,
        loading: false,
        ...(messagesResult.status === 'fulfilled' && messagesResult.value.data ? {
          messages: messagesResult.value.data
            .reverse()
            .map(msg => ({
              id: msg.id,
              senderId: msg.sender_id,
              message: msg.message,
              timestamp: new Date(msg.created_at),
              type: (msg.message.startsWith('[SYSTEM]') ? 'system' : 'text') as 'text' | 'system',
            }))
        } : {}),
        ...(contractResult.status === 'fulfilled' && contractResult.value.data ? {
          contractData: contractResult.value.data
        } : {})
      }));

    } catch (error) {
      // Clear timeout on error
      if (chatLoadingTimeoutRef.current) {
        clearTimeout(chatLoadingTimeoutRef.current);
        chatLoadingTimeoutRef.current = null;
      }
      logger.error('Error in fetchChatData:', error);
      toast.error('Failed to load chat data');
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [chatId, currentUserId, navigate]);

  // Real-time subscription for new messages and exchange updates - optimized
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newMessage = payload.new as any;
          
          const formattedMessage: ChatMessage = {
            id: newMessage.id,
            senderId: newMessage.sender_id,
            message: newMessage.message,
            timestamp: new Date(newMessage.created_at),
            type: (newMessage.message.startsWith('[SYSTEM]') ? 'system' : 'text') as 'text' | 'system',
          };

          // Check if message already exists to avoid duplicates
          const messageExists = messages.some(msg => msg.id === formattedMessage.id);
          if (!messageExists) {
            setState(prev => ({ ...prev, messages: [...prev.messages, formattedMessage] }));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chats',
          filter: `id=eq.${chatId}`,
        },
        (payload) => {
          const updatedChat = payload.new as any;
          if (updatedChat.exchange_state) {
            setState(prev => ({ ...prev, exchangeState: updatedChat.exchange_state }));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'exchange_contracts',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const newContract = payload.new as any;
          setState(prev => ({ ...prev, contractData: newContract }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'exchange_contracts',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const updatedContract = payload.new as any;
          setState(prev => ({ ...prev, contractData: updatedContract }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, currentUserId, messages]);

  // Data fetching effect
  useEffect(() => {
    if (chatId && currentUserId && loading) {
      fetchChatData();
    }
  }, [chatId, currentUserId, loading, fetchChatData]);

  // Scroll to bottom for new messages from others - optimized
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.senderId !== currentUserId) {
        scrollToBottom();
      }
    }
  }, [messages, currentUserId, scrollToBottom]);

  // Periodic refresh as fallback - ensures messages stay updated
  useEffect(() => {
    if (!chatId || !currentUserId) return;

    const refreshInterval = setInterval(async () => {
      try {
        const { data: newMessages } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });

        if (newMessages && newMessages.length !== messages.length) {
          const formattedMessages = newMessages.map(msg => ({
            id: msg.id,
            senderId: msg.sender_id,
            message: msg.message,
            timestamp: new Date(msg.created_at),
            type: (msg.message.startsWith('[SYSTEM]') ? 'system' : 'text') as 'text' | 'system',
          }));
          
          setState(prev => ({ ...prev, messages: formattedMessages }));
        }
      } catch (error) {
        logger.error('Error in periodic refresh:', error);
      }
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(refreshInterval);
  }, [chatId, currentUserId, messages.length]);

  // Cleanup effect - improved memory management
  useEffect(() => {
    return () => {
      // Clear all timeouts
      if (chatLoadingTimeoutRef.current) {
        clearTimeout(chatLoadingTimeoutRef.current);
        chatLoadingTimeoutRef.current = null;
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Message handling - optimized with better error handling
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !chatId || !currentUserId || sending) return;

    const messageText = newMessage.trim();
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUserId,
      message: messageText,
      timestamp: new Date(),
      type: 'text',
    };

    // Optimistic update with proper ID handling
    const optimisticMsg = {
      ...newMsg,
      id: `temp_${Date.now()}_${Math.random()}`, // Temporary ID to avoid conflicts
    };
    
    updateState({ 
      newMessage: '', 
      sending: true,
      messages: [...messages, optimisticMsg]
    });

    try {
      const { error } = await supabase.from('chat_messages').insert({
        chat_id: chatId,
        sender_id: currentUserId,
        message: messageText,
      });

      if (error) {
        logger.error('Error sending message:', error);
        toast.error('Failed to send message');
        // Revert optimistic update
        updateState({ 
          messages: messages.filter(msg => msg.id !== optimisticMsg.id),
          newMessage: messageText
        });
        return;
      }

      // Send notification to other user
      if (otherUser?.id) {
        createNotification({
          userId: otherUser.id,
          title: 'New Message',
          message: `${currentUserName} sent you a message`,
          isRead: false,
          type: 'new_message',
          actionUrl: `/chat/${chatId}`,
          metadata: {
            senderId: currentUserId,
            senderName: currentUserName,
            chatId: chatId,
          },
        }).catch(error => {
          logger.error('Error sending notification:', error);
        });
      }

    } catch (error) {
      logger.error('Error in handleSendMessage:', error);
      toast.error('Failed to send message');
      // Revert optimistic update
      updateState({ 
        messages: messages.filter(msg => msg.id !== optimisticMsg.id),
        newMessage: messageText
      });
    } finally {
      updateState({ sending: false });
    }
  }, [
    newMessage,
    chatId,
    currentUserId,
    sending,
    messages,
    otherUser?.id,
    currentUserName,
    createNotification,
    updateState
  ]);

  // Optimized key press handler
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Exchange handlers - optimized
  const handleStartExchange = useCallback(() => {
    updateState({ showExchangeModal: true });
  }, [updateState]);

  const handleFinishExchange = useCallback(() => {
    updateState({ showFinishModal: true });
  }, [updateState]);

  const handleExchangeAgreed = useCallback(
    async (data: { userSkill: string }) => {
      if (!chatId || !currentUserId || !otherUser?.id) return;

      try {
        const contractData = {
          chat_id: chatId,
          user1_id: chatData?.user1_id || currentUserId,
          user2_id: chatData?.user2_id || otherUser.id,
          user1_skill: isUser1 ? data.userSkill : 'Nothing',
          user2_skill: isUser1 ? 'Nothing' : data.userSkill,
          user1_agreed: isUser1,
          user2_agreed: !isUser1,
        };

        const { error } = await supabase
          .from('exchange_contracts')
          .upsert(contractData, { onConflict: 'chat_id' });

        if (error) {
          logger.error('Error creating exchange contract:', error);
          toast.error('Failed to start exchange');
          return;
        }

                 // Update state
         updateState({ 
           contractData: contractData,
           exchangeState: 'contract_proposed',
           showExchangeModal: false
         });

        // Send notification to other user
        try {
          await createNotification({
            userId: otherUser.id,
            title: 'Exchange Proposal',
            message: `${currentUserName} proposed an exchange`,
            isRead: false,
            type: 'learning_match',
            actionUrl: `/chat/${chatId}`,
            metadata: {
              senderId: currentUserId,
              senderName: currentUserName,
              chatId: chatId,
            },
          });
        } catch (error) {
          logger.error('Error sending notification:', error);
        }

        toast.success('Exchange proposal sent!');
      } catch (error) {
        logger.error('Error in handleExchangeAgreed:', error);
        toast.error('Failed to start exchange');
      }
    },
    [
      chatId,
      currentUserId,
      otherUser?.id,
      chatData,
      isUser1,
      currentUserName,
      createNotification,
      updateState
    ]
  );

  const handleAgreeToContract = async () => {
    if (!user || !chatData || !otherUser || !contractData) return;

    try {
      updateState({ isUpdatingState: true });

      const agreeData = isUser1
        ? { user1_agreed: true }
        : { user2_agreed: true };

      const { error: agreeError } = await supabase
        .from('exchange_contracts')
        .update(agreeData)
        .eq('chat_id', chatId);

      if (agreeError) {
        logger.error('Error updating agreement:', agreeError);
        toast.error('Failed to agree to contract');
        return;
      }

      // Update local contract data with current user's agreement
      const updatedContractData = {
        ...contractData,
        user1_agreed: isUser1 ? true : contractData.user1_agreed,
        user2_agreed: !isUser1 ? true : contractData.user2_agreed,
      };
      updateState({ contractData: updatedContractData });

      // Check if both users have agreed
      const bothAgreed = updatedContractData.user1_agreed && updatedContractData.user2_agreed;

      if (bothAgreed) {
        await supabase
          .from('chats')
          .update({
            exchange_state: 'active_exchange',
            updated_at: new Date().toISOString(),
          })
          .eq('id', chatId);

        const systemMessage = {
          id: Date.now().toString(),
          sender_id: user?.id || '',
          message: `[SYSTEM] Exchange is now active! Both users have agreed to the contract.`,
          created_at: new Date().toISOString(),
          chat_id: chatId,
        };

        await supabase.from('chat_messages').insert(systemMessage);

                 // Update state
         updateState({ 
           exchangeState: 'active_exchange',
           messages: [
             ...messages,
             {
               id: systemMessage.id,
               senderId: user?.id || '',
               message: systemMessage.message,
               timestamp: new Date(),
               type: 'system' as const,
             },
           ]
         });

        toast.success('Exchange is now active! Start your learning session.');
      } else {
        toast.success(
          'You agreed to the exchange. Waiting for the other person to agree.'
        );
      }

      updateState({ showExchangeModal: false });
    } catch (error) {
      logger.error('Error in handleAgreeToContract:', error);
      toast.error('Failed to agree to contract');
    } finally {
      updateState({ isUpdatingState: false });
    }
  };

  const handleDeclineContract = async () => {
    if (!user || !chatData || !otherUser) return;

    try {
      updateState({ isUpdatingState: true });

      await supabase.from('exchange_contracts').delete().eq('chat_id', chatId);

      await supabase
        .from('chats')
        .update({
          exchange_state: 'pending_start',
          updated_at: new Date().toISOString(),
        })
        .eq('id', chatId);

      const systemMessage = {
        id: Date.now().toString(),
        sender_id: user?.id || '',
        message: `[SYSTEM] Exchange was declined. You can discuss and start a new exchange anytime.`,
        created_at: new Date().toISOString(),
        chat_id: chatId,
      };

      await supabase.from('chat_messages').insert(systemMessage);

             // Update state
       updateState({ 
         exchangeState: 'pending_start', 
         contractData: null,
         messages: [
           ...messages,
           {
             id: systemMessage.id,
             senderId: user?.id || '',
             message: systemMessage.message,
             timestamp: new Date(),
             type: 'system' as const,
           },
         ]
       });

      toast.success(
        'Exchange declined. You can discuss and start a new exchange anytime.'
      );

      updateState({ showExchangeModal: false });
    } catch (error) {
      logger.error('Error in handleDeclineContract:', error);
      toast.error('Failed to decline contract');
    } finally {
      updateState({ isUpdatingState: false });
    }
  };

  const handleExchangeFinished = async () => {
    if (!contractData || !user || !chatData || !otherUser) return;

    try {
      updateState({ isUpdatingState: true });

      const finishData = isUser1
        ? { user1_reviewed: true }
        : { user2_reviewed: true };

      const { error: finishError } = await supabase
        .from('exchange_contracts')
        .update(finishData)
        .eq('chat_id', chatId);

      if (finishError) {
        logger.error('Error marking exchange as finished:', finishError);
        toast.error(
          `Failed to mark exchange as finished: ${finishError.message}`
        );
        return;
      }

      // Update local contract data with current user's finish status
      const updatedContractData = {
        ...contractData,
        user1_reviewed: isUser1 ? true : contractData.user1_reviewed,
        user2_reviewed: !isUser1 ? true : contractData.user2_reviewed,
      };
      updateState({ contractData: updatedContractData });

      // Check if both users have finished
      const bothFinished = updatedContractData.user1_reviewed && updatedContractData.user2_reviewed;

      if (bothFinished) {
        await supabase
          .from('chats')
          .update({
            exchange_state: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', chatId);

        const systemMessage = {
          id: Date.now().toString(),
          sender_id: user?.id || '',
          message: `[SYSTEM] Exchange completed! Both users have finished. Please leave a review for your learning partner.`,
          created_at: new Date().toISOString(),
          chat_id: chatId,
        };

        await supabase.from('chat_messages').insert(systemMessage);

                 // Update state
         updateState({ 
           exchangeState: 'completed',
           messages: [
             ...messages,
             {
               id: systemMessage.id,
               senderId: user?.id || '',
               message: systemMessage.message,
               timestamp: new Date(),
               type: 'system' as const,
             },
           ]
         });

        toast.success(
          'Exchange completed! Please leave a review for your learning partner.'
        );

        setTimeout(() => {
          updateState({ showReviewModal: true });
        }, 1000);
      } else {
        toast.success(
          'You marked the exchange as finished. Waiting for the other person to finish.'
        );
      }

      updateState({ showFinishModal: false });
    } catch (error) {
      logger.error('Error in handleExchangeFinished:', error);
      toast.error('Failed to mark exchange as finished');
    } finally {
      updateState({ isUpdatingState: false });
    }
  };

  const handleReviewSubmitted = () => {
    toast.success('Thank you!', {
      description:
        'Your review helps improve our community. Keep learning and teaching!',
    });
    updateState({ hasReviewed: true });
  };

  // Manual refresh function for messages
  const handleRefreshMessages = useCallback(async () => {
    if (!chatId) return;
    
    try {
      const { data: newMessages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (newMessages) {
        const formattedMessages = newMessages.map(msg => ({
          id: msg.id,
          senderId: msg.sender_id,
          message: msg.message,
          timestamp: new Date(msg.created_at),
          type: (msg.message.startsWith('[SYSTEM]') ? 'system' : 'text') as 'text' | 'system',
        }));
        
        setState(prev => ({ ...prev, messages: formattedMessages }));
        toast.success('Messages refreshed!');
      }
    } catch (error) {
      logger.error('Error refreshing messages:', error);
      toast.error('Failed to refresh messages');
    }
  }, [chatId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading chat...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/');
    return null;
  }

  if (!otherUser || !chatData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Chat not found</h2>
          <p className="text-muted-foreground mb-4">
            The conversation you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/messages')}>
            {t('actions.backToMessages')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/messages')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Messages
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                Chat with {otherUser.display_name}
              </h1>
              <p className="text-muted-foreground">
                {exchangeState === 'active_exchange' ? 'Active Exchange' : 'Chat'}
              </p>
            </div>
          </div>
          
          {canStartExchange && (
            <Button onClick={handleStartExchange}>
              <Play className="h-4 w-4 mr-2" />
              Start Exchange
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleRefreshMessages} 
              variant="ghost" 
              size="sm"
              title="Refresh messages"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            {canFinishExchange && (
              <Button onClick={handleFinishExchange} variant="outline">
                <Square className="h-4 w-4 mr-2" />
                Finish Exchange
              </Button>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map(msg => (
                <ChatMessageComponent
                  key={msg.id}
                  msg={msg}
                  currentUserId={currentUserId}
                  otherUser={otherUser}
                  currentUserAvatar={currentUserAvatar}
                  currentUserName={currentUserName}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Message Input */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={e => updateState({ newMessage: e.target.value })}
                onKeyPress={handleKeyPress}
                placeholder="Send a message..."
                className="flex-1"
                ref={inputRef}
              />
              <Button
                onClick={handleSendMessage}
                disabled={sending}
                size="icon"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Exchange Status */}
        {contractData && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Exchange Status</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Contract Status:</span>
                  <Badge variant={exchangeState === 'active_exchange' ? 'default' : 'secondary'}>
                    {exchangeState === 'active_exchange' ? 'Active' : 'Pending'}
                  </Badge>
                </div>
                {contractData.user1_skill && (
                  <div className="text-sm text-muted-foreground">
                    Skills: {contractData.user1_skill} ↔ {contractData.user2_skill || 'Pending'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <ExchangeModal
        isOpen={showExchangeModal}
        onClose={() => updateState({ showExchangeModal: false })}
        onAgree={handleExchangeAgreed}
        onFinalAgree={handleAgreeToContract}
        onDecline={handleDeclineContract}
        chatId={chatId || ''}
        otherUserName={otherUser?.display_name || 'User'}
        currentUserSkills={user?.skillsToTeach || []}
        exchangeState={exchangeState}
        contractData={contractData ? {
          currentUserSkill: isUser1 ? contractData.user1_skill : contractData.user2_skill,
          otherUserSkill: isUser1 ? contractData.user2_skill : contractData.user1_skill,
          currentUserAgreed: isUser1 ? contractData.user1_agreed : contractData.user2_agreed,
          otherUserAgreed: isUser1 ? contractData.user2_agreed : contractData.user1_agreed,
        } : undefined}
      />

      <FinishExchangeModal
        isOpen={showFinishModal}
        onClose={() => updateState({ showFinishModal: false })}
        onConfirm={handleExchangeFinished}
        exchange={contractData ? {
          id: chatId || '',
          status: exchangeState === 'active_exchange' ? 'active' : exchangeState === 'completed' ? 'completed' : 'pending',
          currentUserSkill: isUser1 ? contractData.user1_skill : contractData.user2_skill,
          otherUserSkill: isUser1 ? contractData.user2_skill : contractData.user1_skill,
          currentUserFinished: isUser1 ? contractData.user1_reviewed : contractData.user2_reviewed,
          otherUserFinished: isUser1 ? contractData.user2_reviewed : contractData.user1_reviewed,
        } : null}
        currentUserId={user?.id || ''}
      />

      {showReviewModal && otherUser && contractData && (
        <ExchangeReviewModal
          isOpen={showReviewModal}
          onClose={() => updateState({ showReviewModal: false })}
          exchange={{
            id: chatId || '',
            otherUser: {
              id: otherUser.id,
              name: otherUser.display_name,
              avatar: otherUser.avatar_url,
            },
            skill: `${isUser1 ? contractData.user1_skill : contractData.user2_skill || ''} ↔ ${isUser1 ? contractData.user2_skill : contractData.user1_skill || ''}`,
            type: 'exchange',
            description: `Exchange between ${user?.name || user?.email || 'You'} and ${otherUser.display_name}`,
          }}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
});

export default Chat;
