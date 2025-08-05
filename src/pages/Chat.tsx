import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
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
import { logger } from '@/utils/logger';
import {
  Send,
  ArrowLeft,
  Play,
  Square,
  Loader2,
  ChevronDown,
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
    otherUser?: any;
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

    const handleAvatarClick = useCallback(() => {
      if (!isCurrentUser && otherUser?.id) {
        window.open(`/profile/${otherUser.id}`, '_blank');
      }
    }, [isCurrentUser, otherUser?.id]);

    if (isSystemMessage) {
      return (
        <div key={msg.id} className="flex justify-center my-3 sm:my-4">
          <div className="bg-muted px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm text-muted-foreground">
            {msg.message.replace('[SYSTEM] ', '')}
          </div>
        </div>
      );
    }

    return (
      <div
        key={msg.id}
        className={`flex gap-2 mb-3 sm:mb-4 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
      >
        <Avatar
          className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleAvatarClick}
        >
          <AvatarImage
            src={isCurrentUser ? currentUserAvatar : otherUser?.avatar_url}
            alt={isCurrentUser ? currentUserName : otherUser?.display_name}
          />
          <AvatarFallback>
            {isCurrentUser
              ? (currentUserName || 'You').charAt(0).toUpperCase()
              : (otherUser?.display_name || 'User').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div
          className={`flex flex-col max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}
        >
          <div
            className={`px-3 py-2 rounded-lg text-sm ${
              isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            {msg.message}
          </div>
          <div
            className={`text-xs text-muted-foreground mt-1 ${
              isCurrentUser ? 'text-right' : 'text-left'
            }`}
          >
            {msg.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    );
  }
);

ChatMessageComponent.displayName = 'ChatMessageComponent';

// Memoized Chat component
const Chat = React.memo(() => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const { t } = useTranslation();
  const { language } = useLanguage();

  // Performance monitoring
  usePerformanceMonitor('Chat', { threshold: 50 });

  // State management with useMemo for complex objects
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [exchangeState, setExchangeState] = useState<string>('pending_start');
  const [contractData, setContractData] = useState<any>(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isExchangeActive, setIsExchangeActive] = useState(false);
  const [exchangeNotification, setExchangeNotification] = useState<
    string | null
  >(null);
  const [isUpdatingState, setIsUpdatingState] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Memoized values for performance
  const currentUserId = useMemo(() => user?.id, [user?.id]);
  const currentUserName = useMemo(
    () => user?.name || user?.email || 'You',
    [user?.name, user?.email]
  );
  const currentUserAvatar = useMemo(() => user?.avatar_url, [user?.avatar_url]);
  const isCurrentUserInvolved = useMemo(
    () =>
      chatData &&
      (chatData.user1_id === currentUserId ||
        chatData.user2_id === currentUserId),
    [chatData, currentUserId]
  );

  // Computed values for exchange actions
  const canStartExchange = useMemo(() => {
    return exchangeState === 'pending_start' && !contractData;
  }, [exchangeState, contractData]);

  const canFinishExchange = useMemo(() => {
    if (!contractData || !currentUserId || !chatData) return false;

    const isUser1 = chatData.user1_id === currentUserId;
    const userFinished = isUser1
      ? contractData.user1_finished
      : contractData.user2_finished;
    const otherUserFinished = isUser1
      ? contractData.user2_finished
      : contractData.user1_finished;

    return (
      exchangeState === 'active_exchange' && !userFinished && otherUserFinished
    );
  }, [exchangeState, contractData, currentUserId, chatData]);

  // Data fetching functions
  const fetchChatData = useCallback(async () => {
    if (!chatId || !currentUserId) return;

    try {
      logger.debug('🔄 Fetching chat data for chatId:', chatId);

      // Fetch chat data
      const { data: chatDataResult, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();

      if (chatError) {
        logger.error('Error fetching chat data:', chatError);
        toast.error('Failed to load chat');
        setLoading(false);
        return;
      }

      if (!chatDataResult) {
        logger.error('Chat not found');
        setLoading(false);
        return;
      }

      setChatData(chatDataResult);
      setExchangeState(chatDataResult.exchange_state || 'pending_start');

      // Get the other user's ID
      const otherUserId =
        chatDataResult.user1_id === currentUserId
          ? chatDataResult.user2_id
          : chatDataResult.user1_id;

      // Fetch other user's profile
      const { data: otherUserData, error: userError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, skills_to_teach')
        .eq('id', otherUserId)
        .single();

      if (userError) {
        logger.error('Error fetching other user data:', userError);
        toast.error('Failed to load user data');
        setLoading(false);
        return;
      }

      setOtherUser(otherUserData);

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        logger.error('Error fetching messages:', messagesError);
        toast.error('Failed to load messages');
      } else {
        const formattedMessages = messagesData.map(msg => ({
          id: msg.id,
          senderId: msg.sender_id,
          message: msg.message,
          timestamp: new Date(msg.created_at),
          type: msg.message.startsWith('[SYSTEM]') ? 'system' : 'text',
        }));
        setMessages(formattedMessages);
      }

      // Fetch exchange contract if exists
      const { data: contractData, error: contractError } = await supabase
        .from('exchange_contracts')
        .select('*')
        .eq('chat_id', chatId)
        .single();

      if (!contractError && contractData) {
        setContractData(contractData);
      }

      setLoading(false);
      logger.debug('✅ Chat data loaded successfully');
    } catch (error) {
      logger.error('Error in fetchChatData:', error);
      toast.error('Failed to load chat data');
      setLoading(false);
    }
  }, [chatId, currentUserId]);

  // Memoized scroll functions - MUST be defined before useEffects
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const shouldScrollToBottom = useCallback(() => {
    const element = messagesEndRef.current;
    if (!element) return false;

    const { scrollTop, scrollHeight, clientHeight } =
      element.parentElement || {};
    if (!scrollTop || !scrollHeight || !clientHeight) return false;

    return scrollTop + clientHeight >= scrollHeight - 100;
  }, []);

  // Data fetching effects
  useEffect(() => {
    if (chatId && currentUserId && loading) {
      logger.debug('🔄 Initial data fetch triggered');
      fetchChatData();
    }
  }, [chatId, currentUserId, loading, fetchChatData]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Memoized callbacks for performance
  const checkExchangeNotification = useCallback(async () => {
    if (!chatId || !currentUserId) return;

    try {
      const { data: contracts, error } = await supabase
        .from('exchange_contracts')
        .select('*')
        .eq('chat_id', chatId)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error checking exchange notification:', error);
        return;
      }

      if (contracts) {
        const isUser1 = contracts.user1_id === currentUserId;
        const userAgreed = isUser1
          ? contracts.user1_agreed
          : contracts.user2_agreed;
        const otherUserAgreed = isUser1
          ? contracts.user2_agreed
          : contracts.user1_agreed;
        const userFinished = isUser1
          ? contracts.user1_finished
          : contracts.user2_finished;
        const otherUserFinished = isUser1
          ? contracts.user2_finished
          : contracts.user1_finished;

        if (userAgreed && otherUserAgreed && !isExchangeActive) {
          setIsExchangeActive(true);
          setExchangeNotification(
            'Exchange started! You can now begin your learning session.'
          );
        } else if (userFinished && otherUserFinished && isExchangeActive) {
          setIsExchangeActive(false);
          setExchangeNotification(
            'Exchange completed! You can now review your experience.'
          );
          setShowFinishModal(true);
        }
      }
    } catch (error) {
      logger.error('Error in checkExchangeNotification:', error);
    }
  }, [chatId, currentUserId, isExchangeActive]);

  // Optimized polling for exchange notifications
  const { isActive: isPollingActive } = useOptimizedPolling(
    checkExchangeNotification,
    {
      interval: 5000, // Check every 5 seconds
      enabled: !!chatId && !!currentUserId,
      maxRetries: 3,
    }
  );

  // Memoized message handling
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !chatId || !currentUserId || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        senderId: currentUserId,
        message: messageText,
        timestamp: new Date(),
        type: 'text',
      };

      // Optimistic update
      setMessages(prev => [...prev, newMsg]);

      // Save to database
      const { error } = await supabase.from('chat_messages').insert({
        chat_id: chatId,
        sender_id: currentUserId,
        message: messageText,
      });

      if (error) {
        logger.error('Error sending message:', error);
        toast.error('Failed to send message');
        // Remove optimistic update on error
        setMessages(prev => prev.filter(msg => msg.id !== newMsg.id));
      } else {
        // Send notification to other user
        if (otherUser?.id) {
          try {
            await createNotification({
              userId: otherUser.id,
              title: 'New Message',
              message: `${currentUserName} sent you a message`,
              isRead: false,
              type: 'chat_message',
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
        }
      }
    } catch (error) {
      logger.error('Error in handleSendMessage:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  }, [
    newMessage,
    chatId,
    currentUserId,
    sending,
    otherUser?.id,
    currentUserName,
    createNotification,
  ]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Memoized exchange handlers
  const handleStartExchange = useCallback(() => {
    setShowExchangeModal(true);
  }, []);

  const handleFinishExchange = useCallback(() => {
    setShowFinishModal(true);
  }, []);

  const handleExchangeAgreed = useCallback(
    async (data: { userSkill: string }) => {
      if (!chatId || !currentUserId || !otherUser?.id) return;

      try {
        const isUser1 = chatData?.user1_id === currentUserId;
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

        setContractData(contractData);
        setExchangeState('contract_proposed');

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

        setShowExchangeModal(false);
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
      currentUserName,
      createNotification,
    ]
  );

  const handleAgreeToContract = async () => {
    if (!user || !chatData || !otherUser || !contractData) return;

    try {
      logger.debug('🤝 Agreeing to final contract');
      setIsUpdatingState(true); // Prevent polling interference

      // Mark current user as agreed
      const isUser1 = chatData.user1_id === user.id;
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

      // Update local state
      const updatedContractData = { ...contractData, currentUserAgreed: true };
      setContractData(updatedContractData);

      // Check if both users have agreed
      const bothAgreed = isUser1
        ? true && contractData.otherUserAgreed
        : contractData.otherUserAgreed && true;

      if (bothAgreed) {
        // Move to active_exchange state
        await supabase
          .from('chats')
          .update({
            exchange_state: 'active_exchange',
            updated_at: new Date().toISOString(),
          })
          .eq('id', chatId);

        setExchangeState('active_exchange');

        // Add system message to chat
        const systemMessage = {
          id: Date.now().toString(),
          sender_id: user?.id || '', // Use current user's ID
          message: `[SYSTEM] Exchange is now active! Both users have agreed to the contract.`,
          created_at: new Date().toISOString(),
          chat_id: chatId,
        };

        // Save system message to database
        await supabase.from('chat_messages').insert(systemMessage);

        // Add to local messages
        setMessages(prev => [
          ...prev,
          {
            id: systemMessage.id,
            senderId: user?.id || '', // Use current user's ID
            message: systemMessage.message,
            timestamp: new Date(),
            type: 'system',
          },
        ]);

        // Send notification to other user
        try {
          const senderName = user.name || user.email || 'Someone';
          const displayName =
            language === 'ar'
              ? transliterateName(senderName, 'en')
              : senderName;
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
              chatId: chatId,
            },
          });
        } catch (notificationError) {
          logger.error(
            'Failed to create activation notification:',
            notificationError
          );
        }

        toast.success('Exchange is now active! Start your learning session.');
      } else {
        // Send notification to other user to review the contract
        try {
          const senderName = user.name || user.email || 'Someone';
          const displayName =
            language === 'ar'
              ? transliterateName(senderName, 'en')
              : senderName;
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
              shouldOpenModal: true,
            },
          });
        } catch (notificationError) {
          logger.error(
            'Failed to create contract review notification:',
            notificationError
          );
        }

        toast.success(
          'You agreed to the exchange. Waiting for the other person to agree.'
        );
      }

      // Close the modal
      setShowExchangeModal(false);

      // Add a small delay to ensure state updates are processed
      setTimeout(() => {
        logger.debug('✅ Contract agreement modal closed and state updated');
      }, 100);
    } catch (error) {
      logger.error('Error in handleAgreeToContract:', error);
      toast.error('Failed to agree to contract');
    } finally {
      setIsUpdatingState(false); // Re-enable polling
    }
  };

  const handleDeclineContract = async () => {
    if (!user || !chatData || !otherUser) return;

    try {
      logger.debug('❌ Declining contract');
      setIsUpdatingState(true); // Prevent polling interference

      // Delete the contract completely to start fresh
      await supabase.from('exchange_contracts').delete().eq('chat_id', chatId);

      // Reset chat state to pending_start to allow new exchange
      await supabase
        .from('chats')
        .update({
          exchange_state: 'pending_start',
          updated_at: new Date().toISOString(),
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
        chat_id: chatId,
      };

      // Save system message to database
      await supabase.from('chat_messages').insert(systemMessage);

      // Add to local messages
      setMessages(prev => [
        ...prev,
        {
          id: systemMessage.id,
          senderId: user?.id || '', // Use current user's ID
          message: systemMessage.message,
          timestamp: new Date(),
          type: 'system',
        },
      ]);

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
            chatId: chatId,
          },
        });
      } catch (notificationError) {
        logger.error(
          'Failed to create decline notification:',
          notificationError
        );
      }

      toast.success(
        'Exchange declined. You can discuss and start a new exchange anytime.'
      );

      // Close the modal
      setShowExchangeModal(false);
    } catch (error) {
      logger.error('Error in handleDeclineContract:', error);
      toast.error('Failed to decline contract');
    } finally {
      setIsUpdatingState(false); // Re-enable polling
    }
  };

  const handleExchangeFinished = async () => {
    if (!contractData || !user || !chatData || !otherUser) return;

    try {
      logger.debug('🏁 Marking exchange as finished');
      setIsUpdatingState(true); // Prevent polling interference

      // Mark current user as finished
      const isUser1 = chatData.user1_id === user.id;
      const finishData = isUser1
        ? { user1_finished: true }
        : { user2_finished: true };

      logger.debug(
        '🏁 Attempting to update contract with finish data:',
        finishData
      );
      logger.debug('🏁 Chat ID:', chatId);

      const { data: updateResult, error: finishError } = await supabase
        .from('exchange_contracts')
        .update(finishData)
        .eq('chat_id', chatId)
        .select();

      logger.debug('🏁 Update result:', updateResult);
      logger.debug('🏁 Update error:', finishError);

      if (finishError) {
        logger.error('Error marking exchange as finished:', finishError);
        toast.error(
          `Failed to mark exchange as finished: ${finishError.message}`
        );
        return;
      }

      // Update local state
      const updatedContractData = {
        ...contractData,
        currentUserFinished: true,
      };
      setContractData(updatedContractData);

      // Check if both users have finished
      const bothFinished = isUser1
        ? true && contractData.otherUserFinished
        : contractData.otherUserFinished && true;

      if (bothFinished) {
        // Mark exchange as completed
        await supabase
          .from('exchange_contracts')
          .update({
            finished_at: new Date().toISOString(),
          })
          .eq('chat_id', chatId);

        // Update chat state to completed
        await supabase
          .from('chats')
          .update({
            exchange_state: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', chatId);

        setExchangeState('completed');

        // Add system message to chat
        const systemMessage = {
          id: Date.now().toString(),
          sender_id: user?.id || '', // Use current user's ID
          message: `[SYSTEM] Exchange completed! Both users have finished. Please leave a review for your learning partner.`,
          created_at: new Date().toISOString(),
          chat_id: chatId,
        };

        // Save system message to database
        await supabase.from('chat_messages').insert(systemMessage);

        // Add to local messages
        setMessages(prev => [
          ...prev,
          {
            id: systemMessage.id,
            senderId: user?.id || '', // Use current user's ID
            message: systemMessage.message,
            timestamp: new Date(),
            type: 'system',
          },
        ]);

        // Send notification to other user
        try {
          const senderName = user.name || user.email || 'Someone';
          const displayName =
            language === 'ar'
              ? transliterateName(senderName, 'en')
              : senderName;
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
              chatId: chatId,
            },
          });
        } catch (notificationError) {
          logger.error(
            'Failed to create completion notification:',
            notificationError
          );
        }

        toast.success(
          'Exchange completed! Please leave a review for your learning partner.'
        );

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
          chat_id: chatId,
        };

        // Save system message to database
        await supabase.from('chat_messages').insert(systemMessage);

        // Add to local messages
        setMessages(prev => [
          ...prev,
          {
            id: systemMessage.id,
            senderId: user?.id || '', // Use current user's ID
            message: systemMessage.message,
            timestamp: new Date(),
            type: 'system',
          },
        ]);

        // Send notification to other user
        try {
          const senderName = user.name || user.email || 'Someone';
          const displayName =
            language === 'ar'
              ? transliterateName(senderName, 'en')
              : senderName;
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
              chatId: chatId,
            },
          });
        } catch (notificationError) {
          logger.error(
            'Failed to create finish notification:',
            notificationError
          );
        }

        toast.success(
          'You marked the exchange as finished. Waiting for the other person to finish.'
        );
      }

      // Close the modal
      setShowFinishModal(false);
    } catch (error) {
      logger.error('Error in handleExchangeFinished:', error);
      toast.error('Failed to mark exchange as finished');
    } finally {
      setIsUpdatingState(false); // Re-enable polling
    }
  };

  const handleReviewSubmitted = () => {
    toast.success('Thank you!', {
      description:
        'Your review helps improve our community. Keep learning and teaching!',
    });
    setHasReviewed(true);
  };

  // Memoize the renderMessage function to prevent unnecessary re-renders
  const renderMessage = useCallback(
    (msg: ChatMessage) => {
      const isCurrentUser = msg.senderId === user?.id;
      const isSystemMessage =
        msg.type === 'system' || msg.message.startsWith('[SYSTEM]');

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
        <div
          key={msg.id}
          className={`flex gap-2 mb-4 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
        >
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage
              src={isCurrentUser ? undefined : otherUser?.avatar_url}
            />
            <AvatarFallback>
              {isCurrentUser
                ? user?.id?.charAt(0).toUpperCase() || 'Y'
                : otherUser?.display_name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className={`max-w-[70%] ${isCurrentUser ? 'text-right' : ''}`}>
            <div
              className={`inline-block p-3 rounded-lg ${
                isCurrentUser
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {msg.message}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {msg.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      );
    },
    [user?.id, otherUser?.avatar_url, otherUser?.display_name]
  );

  if (loading) {
    logger.debug('⏳ Showing loading state');
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
    logger.debug('❌ No user found, redirecting to login');
    navigate('/');
    return null;
  }

  if (!otherUser || !chatData) {
    logger.debug('❌ Missing data, showing not found:', {
      otherUser: !!otherUser,
      chatData: !!chatData,
    });
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
      canFinishExchange,
    });

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                onClick={() => navigate('/messages')}
                variant="ghost"
                size="sm"
                className="gap-1 sm:gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t('actions.backToMessages')}
                </span>
              </Button>
              <div className="flex items-center gap-2 sm:gap-3">
                <Avatar
                  className="w-8 h-8 sm:w-10 sm:h-10 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() =>
                    window.open(`/profile/${otherUser.id}`, '_blank')
                  }
                >
                  <AvatarImage src={otherUser.avatar_url} />
                  <AvatarFallback>
                    {otherUser.display_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-sm sm:text-base">
                    {otherUser.display_name}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {exchangeState === 'active_exchange'
                      ? 'Active Exchange'
                      : 'Chat'}
                  </p>
                </div>
              </div>
            </div>

            {/* Exchange Status Badge */}
            {exchangeState !== 'pending_start' && (
              <Badge
                variant={
                  exchangeState === 'active_exchange' ? 'default' : 'secondary'
                }
                className="text-xs"
              >
                {exchangeState === 'active_exchange'
                  ? 'Active Exchange'
                  : 'Draft Exchange'}
              </Badge>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="container mx-auto max-w-4xl p-2 sm:p-4 pb-20 sm:pb-24">
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="h-80 sm:h-96 overflow-y-auto mb-3 sm:mb-4 relative">
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

                {/* Scroll to bottom button - only show if not at bottom */}
                {messages.length > 0 && !shouldScrollToBottom() && (
                  <Button
                    onClick={scrollToBottom}
                    size="sm"
                    className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 shadow-lg"
                    variant="secondary"
                  >
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                )}
              </div>

              {/* Exchange Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 mb-3 sm:mb-4">
                {canStartExchange && (
                  <Button
                    onClick={handleStartExchange}
                    className="gap-1 sm:gap-2 text-xs sm:text-sm"
                    variant="default"
                  >
                    <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                    Start Exchange
                  </Button>
                )}
                {canFinishExchange && isExchangeActive && (
                  <Button
                    onClick={handleFinishExchange}
                    className="gap-1 sm:gap-2 text-xs sm:text-sm"
                    variant="outline"
                  >
                    <Square className="h-3 w-3 sm:h-4 sm:w-4" />
                    Finish Exchange
                  </Button>
                )}
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 text-xs sm:text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="w-8 h-8 sm:w-10 sm:h-10"
                >
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exchange Modal */}
        <ExchangeModal
          isOpen={showExchangeModal}
          onClose={() => {
            logger.debug('🚪 ExchangeModal onClose called');
            setShowExchangeModal(false);
          }}
          onAgree={handleExchangeAgreed}
          onFinalAgree={handleAgreeToContract}
          onDecline={handleDeclineContract}
          chatId={chatId || ''}
          otherUserName={otherUser?.display_name || 'User'}
          currentUserSkills={(() => {
            const skills = user?.skillsToTeach || [];
            logger.debug(
              '🎓 Current user skills being passed to modal:',
              skills
            );
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
                avatar: otherUser.avatar_url,
              },
              skill: `${contractData.currentUserSkill || ''} ↔ ${contractData.otherUserSkill || ''}`,
              type: 'exchange',
              description: `Exchange between ${user?.display_name || 'You'} and ${otherUser.display_name}`,
            }}
            onReviewSubmitted={handleReviewSubmitted}
          />
        )}
      </div>
    );
  } catch (error) {
    logger.error('Error rendering Chat component:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">
            There was an error loading the chat.
          </p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    );
  }
});

export default Chat;
