import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../integrations/supabase/client';
import { notificationService } from '../services/notificationService';
import { toast } from 'sonner';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  User,
  Calendar,
  MapPin,
  Star,
  MessageCircle,
  Check,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ExchangeReviewModal } from '../components/review/ExchangeReviewModal';


// Tab configuration
const tabs = [
  { id: 'active', label: 'Active', icon: Clock },
  { id: 'responses', label: 'Responses', icon: MessageCircle },
  { id: 'request', label: 'Request', icon: MessageSquare },
  { id: 'sent', label: 'Sent', icon: XCircle },
  { id: 'completed', label: 'Completed', icon: CheckCircle }
];

// Interface for exchange data
interface Exchange {
  id: string;
  type: string;
  status: string;
  otherUser: { name: string; avatar: string | null };
  skill: string;
  date: string;
  location: string;
  description: string;
  rating?: number;
}

// Interface for learning response data
interface LearningResponse {
  id: string;
  learning_request_id: string;
  responder: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    isVerified: boolean;
  };
  message: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  skill: string;
}

// Interface for invitation data
interface Invitation {
  id: string;
  sender_id: string;
  recipient_id: string;
  skill: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  sender?: {
    id: string;
    name: string;
    avatar: string;
  };
  recipient?: {
    id: string;
    name: string;
    avatar: string;
  };
}

// Real data will be fetched from database
const mockExchanges: Record<string, Exchange[]> = {
  active: [],
  request: [],
  sent: [],
  completed: []
};

export default function MyExchanges() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('active');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
  const [responses, setResponses] = useState<LearningResponse[]>([]);
  const [sentInvites, setSentInvites] = useState<Invitation[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<Invitation[]>([]);
  const [activeExchanges, setActiveExchanges] = useState<any[]>([]);
  const [completedExchanges, setCompletedExchanges] = useState<any[]>([]);

  const fetchActiveExchanges = async () => {
    if (!user) return;

    try {
      console.log('🔄 Fetching active exchanges...');
      
      // Fetch chats where user is participant and exchange_state is active_exchange
      const { data: chats, error } = await supabase
        .from('chats')
        .select(`
          *,
          exchange_contracts (
            *
          ),
          profiles!chats_user1_id_fkey (
            id,
            display_name,
            avatar_url
          ),
          profiles_user2:profiles!chats_user2_id_fkey (
            id,
            display_name,
            avatar_url
          )
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('exchange_state', 'active_exchange');

      if (error) {
        console.error('Error fetching active exchanges:', error);
        return;
      }

      // Transform the data
      const exchanges = (chats || []).map(chat => {
        const isUser1 = chat.user1_id === user.id;
        const otherUser = isUser1 ? chat.profiles_user2 : chat.profiles;
        const contract = chat.exchange_contracts?.[0];
        
        return {
          id: chat.id,
          skill: chat.skill,
          otherUser: {
            name: otherUser?.display_name || 'Unknown User',
            avatar: otherUser?.avatar_url
          },
          userSkill: isUser1 ? contract?.user1_skill : contract?.user2_skill,
          otherUserSkill: isUser1 ? contract?.user2_skill : contract?.user1_skill,
          userIsMentorship: isUser1 ? contract?.user1_is_mentorship : contract?.user2_is_mentorship,
          otherUserIsMentorship: isUser1 ? contract?.user2_is_mentorship : contract?.user1_is_mentorship,
          startedAt: new Date(chat.updated_at),
          canFinish: new Date().getTime() - new Date(chat.updated_at).getTime() > 30 * 60 * 1000 // 30 minutes
        };
      });

      setActiveExchanges(exchanges);
      console.log('✅ Active exchanges fetched:', exchanges);
    } catch (error) {
      console.error('Error fetching active exchanges:', error);
    }
  };

  const fetchCompletedExchanges = async () => {
    if (!user) return;

    try {
      console.log('🔄 Fetching completed exchanges...');
      
      // Fetch chats where user is participant and exchange_state is completed or both users have reviewed
      const { data: chats, error } = await supabase
        .from('chats')
        .select(`
          *,
          exchange_contracts (
            *
          ),
          profiles!chats_user1_id_fkey (
            id,
            display_name,
            avatar_url
          ),
          profiles_user2:profiles!chats_user2_id_fkey (
            id,
            display_name,
            avatar_url
          ),
          reviews (
            *
          )
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('exchange_state', 'completed');

      if (error) {
        console.error('Error fetching completed exchanges:', error);
        return;
      }

      // Transform the data
      const exchanges = (chats || []).map(chat => {
        const isUser1 = chat.user1_id === user.id;
        const otherUser = isUser1 ? chat.profiles_user2 : chat.profiles;
        const contract = chat.exchange_contracts?.[0];
        const userReview = chat.reviews?.find(r => r.reviewer_id === user.id);
        const otherUserReview = chat.reviews?.find(r => r.reviewer_id !== user.id);
        
        return {
          id: chat.id,
          skill: chat.skill,
          otherUser: {
            name: otherUser?.display_name || 'Unknown User',
            avatar: otherUser?.avatar_url
          },
          userSkill: isUser1 ? contract?.user1_skill : contract?.user2_skill,
          otherUserSkill: isUser1 ? contract?.user2_skill : contract?.user1_skill,
          userIsMentorship: isUser1 ? contract?.user1_is_mentorship : contract?.user2_is_mentorship,
          completedAt: new Date(chat.updated_at),
          userReview,
          otherUserReview,
          averageRating: otherUserReview ? 
            Math.round((otherUserReview.skill_rating + otherUserReview.communication_rating) / 2) : null
        };
      });

      setCompletedExchanges(exchanges);
      console.log('✅ Completed exchanges fetched:', exchanges);
    } catch (error) {
      console.error('Error fetching completed exchanges:', error);
    }
  };

  // Fetch user's learning responses from database
  const fetchUserResponses = async () => {
    if (!user?.id) return;

    try {
      console.log('Fetching user responses for user:', user.id);
      
      // First, get the user's learning requests
      const { data: userRequests, error: requestsError } = await supabase
        .from('learning_requests')
        .select('id, skill, description')
        .eq('user_id', user.id);

      if (requestsError) {
        console.error('Error fetching user requests:', requestsError);
        toast.error("Failed to load requests");
        return;
      }

      console.log('Found user requests:', userRequests);

      if (!userRequests || userRequests.length === 0) {
        console.log('No learning requests found for user');
        setResponses([]);
        return;
      }

      // Get the request IDs
      const requestIds = userRequests.map(req => req.id);
      console.log('Request IDs to check for responses:', requestIds);

      // Now try to fetch responses to these requests using type assertion
      console.log('Attempting to fetch responses for requests:', requestIds);
      
      try {
        // Use type assertion to bypass TypeScript restrictions
        // Only fetch pending responses (not declined or accepted)
        const { data: responses, error: responsesError } = await (supabase as any)
          .from('learning_responses')
          .select('*')
          .in('learning_request_id', requestIds)
          .eq('status', 'pending');

        if (responsesError) {
          console.error('Error fetching responses:', responsesError);
          toast.error("Failed to load responses");
          setResponses([]);
          return;
        }

        console.log('Raw responses from database:', responses);

        if (!responses || responses.length === 0) {
          console.log('No responses found in database');
          setResponses([]);
          return;
        }

        // Transform database data to LearningResponse format
        const transformedResponses: LearningResponse[] = await Promise.all(
          responses.map(async (response: any) => {
            try {
              // Fetch responder profile details
              const { data: profile } = await supabase
                .from('profiles')
                .select('display_name, avatar_url')
                .eq('id', response.responder_id)
                .single();

              // Fetch request details to get the skill
              const { data: request } = await supabase
                .from('learning_requests')
                .select('skill')
                .eq('id', response.learning_request_id)
                .single();

              return {
                id: response.id,
                learning_request_id: response.learning_request_id,
                responder: {
                  id: response.responder_id,
                  name: profile?.display_name || 'Anonymous User',
                  avatar: profile?.avatar_url || '👤',
                  rating: 0, // Default rating since it's not in profiles table
                  isVerified: false, // Default verification status
                },
                message: response.message,
                status: response.status as "pending" | "accepted" | "declined",
                created_at: response.created_at,
                skill: request?.skill || 'Unknown Skill',
              };
            } catch (error) {
              console.error('Error fetching details for response:', response.id, error);
              // Return a basic response if details can't be fetched
              return {
                id: response.id,
                learning_request_id: response.learning_request_id,
                responder: {
                  id: response.responder_id,
                  name: 'Anonymous User',
                  avatar: '👤',
                  rating: 0,
                  isVerified: false,
                },
                message: response.message,
                status: response.status as "pending" | "accepted" | "declined",
                created_at: response.created_at,
                skill: 'Unknown Skill',
              };
            }
          })
                 );
        
        setResponses(transformedResponses);
        console.log('Transformed and set responses:', transformedResponses.length);
        
      } catch (error) {
        console.error('Error fetching responses:', error);
        toast.error("Failed to load responses");
        setResponses([]);
      }
      
    } catch (error) {
      console.error('Error fetching user responses:', error);
      toast.error("Failed to load responses");
    }
  };

  // Fetch user's sent invites from database
  const fetchSentInvites = async () => {
    if (!user?.id) return;

    try {
      console.log('Fetching sent invites for user:', user.id);
      
      const { data: invites, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sent invites:', error);
        toast.error("Failed to load sent invites");
        return;
      }

      console.log('Raw sent invites from database:', invites);

      if (!invites || invites.length === 0) {
        console.log('No sent invites found');
        setSentInvites([]);
        return;
      }

      // Transform database data to Invitation format with recipient details
      const transformedInvites: Invitation[] = await Promise.all(
        invites.map(async (invite: any) => {
          try {
            // Fetch recipient profile details
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('id', invite.recipient_id)
              .single();

            return {
              id: invite.id,
              sender_id: invite.sender_id,
              recipient_id: invite.recipient_id,
              skill: invite.skill,
              message: invite.message,
              status: invite.status as "pending" | "accepted" | "declined",
              created_at: invite.created_at,
              recipient: {
                id: invite.recipient_id,
                name: profile?.display_name || 'Anonymous User',
                avatar: profile?.avatar_url || '👤',
              }
            };
          } catch (error) {
            console.error('Error fetching recipient details for invite:', invite.id, error);
            return {
              id: invite.id,
              sender_id: invite.sender_id,
              recipient_id: invite.recipient_id,
              skill: invite.skill,
              message: invite.message,
              status: invite.status as "pending" | "accepted" | "declined",
              created_at: invite.created_at,
              recipient: {
                id: invite.recipient_id,
                name: 'Anonymous User',
                avatar: '👤',
              }
            };
          }
        })
      );
      
      setSentInvites(transformedInvites);
      console.log('Transformed and set sent invites:', transformedInvites.length);
      
    } catch (error) {
      console.error('Error fetching sent invites:', error);
      toast.error("Failed to load sent invites");
    }
  };

  // Fetch user's received invites from database
  const fetchReceivedInvites = async () => {
    if (!user?.id) return;

    try {
      console.log('Fetching received invites for user:', user.id);
      
      const { data: invites, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching received invites:', error);
        toast.error("Failed to load received invites");
        return;
      }

      console.log('Raw received invites from database:', invites);

      if (!invites || invites.length === 0) {
        console.log('No received invites found');
        setReceivedInvites([]);
        return;
      }

      // Transform database data to Invitation format with sender details
      const transformedInvites: Invitation[] = await Promise.all(
        invites.map(async (invite: any) => {
          try {
            // Fetch sender profile details
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('id', invite.sender_id)
              .single();

            return {
              id: invite.id,
              sender_id: invite.sender_id,
              recipient_id: invite.recipient_id,
              skill: invite.skill,
              message: invite.message,
              status: invite.status as "pending" | "accepted" | "declined",
              created_at: invite.created_at,
              sender: {
                id: invite.sender_id,
                name: profile?.display_name || 'Anonymous User',
                avatar: profile?.avatar_url || '👤',
              }
            };
          } catch (error) {
            console.error('Error fetching sender details for invite:', invite.id, error);
            return {
              id: invite.id,
              sender_id: invite.sender_id,
              recipient_id: invite.recipient_id,
              skill: invite.skill,
              message: invite.message,
              status: invite.status as "pending" | "accepted" | "declined",
              created_at: invite.created_at,
              sender: {
                id: invite.sender_id,
                name: 'Anonymous User',
                avatar: '👤',
              }
            };
          }
        })
      );
      
      setReceivedInvites(transformedInvites);
      console.log('Transformed and set received invites:', transformedInvites.length);
      
    } catch (error) {
      console.error('Error fetching received invites:', error);
      toast.error("Failed to load received invites");
    }
  };

  // Read tab parameter from URL on component mount
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabs.some(tab => tab.id === tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      // If no tab parameter is provided, set default to 'active' and update URL
      setSearchParams({ tab: 'active' });
    }
  }, [searchParams, setSearchParams]);

  // Update URL when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Fetch user's learning responses when user changes or when Responses tab is opened
  useEffect(() => {
    if (user?.id) {
      fetchUserResponses();
      fetchSentInvites();
      fetchReceivedInvites();
      fetchActiveExchanges(); // Fetch active exchanges when user changes
      fetchCompletedExchanges(); // Fetch completed exchanges when user changes
    }
  }, [user?.id]);

  // Auto-update responses every 10 seconds (same as notifications)
  useEffect(() => {
    if (!user?.id || activeTab !== 'responses') return;

    const pollInterval = setInterval(() => {
      fetchUserResponses();
    }, 10000); // 10 seconds

    return () => clearInterval(pollInterval);
  }, [user?.id, activeTab]);

  // Auto-update sent invites every 10 seconds
  useEffect(() => {
    if (!user?.id || activeTab !== 'sent') return;

    const pollInterval = setInterval(() => {
      fetchSentInvites();
    }, 10000); // 10 seconds

    return () => clearInterval(pollInterval);
  }, [user?.id, activeTab]);

  // Auto-update received invites every 10 seconds
  useEffect(() => {
    if (!user?.id || activeTab !== 'request') return;

    const pollInterval = setInterval(() => {
      fetchReceivedInvites();
    }, 10000); // 10 seconds

    return () => clearInterval(pollInterval);
  }, [user?.id, activeTab]);

  // Auto-refresh data every 10 seconds when on specific tabs
  useEffect(() => {
    if (!user) return;

    let interval: NodeJS.Timeout;
    
    if (activeTab === 'sent') {
      interval = setInterval(fetchSentInvites, 10000);
    } else if (activeTab === 'request') {
      interval = setInterval(fetchReceivedInvites, 10000);
    } else if (activeTab === 'active') {
      interval = setInterval(fetchActiveExchanges, 10000);
    } else if (activeTab === 'completed') {
      interval = setInterval(fetchCompletedExchanges, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, user?.id]);

  // Refresh responses when Responses tab is opened
  useEffect(() => {
    if (user?.id && activeTab === 'responses') {
      console.log('Responses tab opened, refreshing responses...');
      fetchUserResponses();
    }
  }, [user?.id, activeTab]);

  // Refresh sent invites when Sent tab is opened
  useEffect(() => {
    if (user?.id && activeTab === 'sent') {
      console.log('Sent tab opened, refreshing sent invites...');
      fetchSentInvites();
    }
  }, [user?.id, activeTab]);

  // Refresh received invites when Request tab is opened
  useEffect(() => {
    if (user?.id && activeTab === 'request') {
      console.log('Request tab opened, refreshing received invites...');
      fetchReceivedInvites();
    }
  }, [user?.id, activeTab]);

  // Get current tab's exchanges
  const currentExchanges = mockExchanges[activeTab as keyof typeof mockExchanges] || [];

  // Get count for each tab
  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'responses': return responses.length;
      case 'sent': return sentInvites.length;
      case 'request': return receivedInvites.length;
      case 'active': return activeExchanges.length;
      case 'completed': return completedExchanges.length;
      default: return 0;
    }
  };

  // Get status badge variant and icon
  const getStatusConfig = (status: string, type: string) => {
    switch (status) {
      case 'active':
        return { variant: 'default' as const, icon: Clock, text: 'Active' };
      case 'pending':
        return { variant: 'secondary' as const, icon: Clock, text: 'Pending' };
      case 'completed':
        return { variant: 'outline' as const, icon: CheckCircle, text: 'Completed' };
      default:
        return { variant: 'secondary' as const, icon: Clock, text: status };
    }
  };

  // Get exchange type badge
  const getTypeBadge = (type: string) => {
    return type === 'mentorship' ? 'Mentorship' : 'Exchange';
  };

  // Handle opening review modal
  const handleOpenReview = (exchange: Exchange) => {
    setSelectedExchange(exchange);
    setReviewModalOpen(true);
  };

  // Handle review submission
  const handleReviewSubmitted = () => {
    // Refresh the exchanges data or update the UI
    // For now, we'll just close the modal
    setReviewModalOpen(false);
    setSelectedExchange(null);
  };

  // Handle accepting a learning response
  const handleAcceptResponse = async (response: LearningResponse) => {
    if (!user?.id) {
      toast.error("You must be logged in to accept responses");
      return;
    }

    try {
      // TODO: Update response status in database
      console.log('Accepting response:', response.id);
      
      // Create a chat thread for the exchange
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert({
          user1_id: user.id,
          user2_id: response.responder.id,
          skill: response.skill,
          status: 'active'
        })
        .select()
        .single();

      if (chatError) {
        console.error('Error creating chat:', chatError);
        toast.error("Failed to create chat thread");
        return;
      }

      console.log('Chat created successfully:', chatData);
      
      // Get request creator's display name for notification
      const { data: creatorProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();

      const creatorName = creatorProfile?.display_name || user.email || 'Someone';

      // Create notification for the responder about acceptance
      try {
        await notificationService.createNotification({
          userId: response.responder.id,
          title: '✅ Response Accepted!',
          message: `${creatorName} accepted your response to their ${response.skill} learning request`,
          isRead: false,
          type: 'invitation_accepted',
          actionUrl: `/chat/${chatData.id}`,
          metadata: { 
            creatorId: user.id,
            creatorName: creatorName,
            skill: response.skill,
            chatId: chatData.id
          }
        });
      } catch (notificationError) {
        console.error('Failed to create acceptance notification:', notificationError);
      }

      // Update response status to 'accepted' in database
      const { error: updateError } = await (supabase as any)
        .from('learning_responses')
        .update({ status: 'accepted' })
        .eq('id', response.id);

      if (updateError) {
        console.error('Error updating response status:', updateError);
        toast.error("Failed to accept response");
        return;
      }

      console.log('Response accepted successfully in database');
      toast.success("✅ Response accepted — chat opened!");
      // Remove from local state immediately
      setResponses(prev => prev.filter(r => r.id !== response.id));
      // TODO: Move exchange to Active tab
      
      // Redirect to messages page after a short delay to show the success message
      setTimeout(() => {
        navigate('/messages');
      }, 1500);
    } catch (error) {
      console.error('Error accepting response:', error);
      toast.error("Failed to accept response");
    }
  };

  // Handle declining a learning response
  const handleDeclineResponse = async (response: LearningResponse) => {
    if (!user?.id) {
      toast.error("You must be logged in to decline responses");
      return;
    }

    try {
      console.log('Declining response:', response.id);
      
      // Update response status to 'declined' in database
      const { error: updateError } = await (supabase as any)
        .from('learning_responses')
        .update({ status: 'declined' })
        .eq('id', response.id);

      if (updateError) {
        console.error('Error updating response status:', updateError);
        toast.error("Failed to decline response");
        return;
      }

      console.log('Response declined successfully in database');
      // Remove from local state immediately
      setResponses(prev => prev.filter(r => r.id !== response.id));
      toast.success("✅ Response declined successfully");
    } catch (error) {
      console.error('Error declining response:', error);
      toast.error("Failed to decline response. Please try again.");
    }
  };

  // Handle accepting a received invitation
  const handleAcceptInvitation = async (invite: Invitation) => {
    if (!user?.id) {
      toast.error("You must be logged in to accept invitations");
      return;
    }

    try {
      console.log('✅ Accepting invitation:', invite.id);
      
      // Update invitation status to 'accepted' in database
      const { error: updateError } = await supabase
        .from('invitations')
        .update({ status: 'accepted' })
        .eq('id', invite.id);

      if (updateError) {
        console.error('Error updating invitation status:', updateError);
        toast.error("Failed to accept invitation");
        return;
      }

      // Create a chat thread for the exchange
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert({
          user1_id: invite.sender_id,
          user2_id: user.id,
          skill: invite.skill,
          status: 'active'
        })
        .select()
        .single();

      if (chatError) {
        console.error('Error creating chat:', chatError);
        toast.error("Failed to create chat thread");
        return;
      }

      console.log('Chat created successfully:', chatData);
      
      // Get current user's display name for notification
      const { data: recipientProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();

      const recipientName = recipientProfile?.display_name || user.email || 'Someone';

      // Create notification for the sender about acceptance
      try {
        await notificationService.createNotification({
          userId: invite.sender_id,
          title: '✅ Invitation Accepted!',
          message: `${recipientName} accepted your invitation to learn ${invite.skill}`,
          isRead: false,
          type: 'invitation_accepted',
          actionUrl: `/chat/${chatData.id}`,
          metadata: { 
            recipientId: user.id,
            recipientName: recipientName,
            skill: invite.skill,
            chatId: chatData.id
          }
        });
        console.log('✅ Acceptance notification sent to sender');
      } catch (notificationError) {
        console.error('Failed to create acceptance notification:', notificationError);
      }

      console.log('Invitation accepted successfully');
      toast.success("✅ Invitation accepted — chat created!");
      
      // Remove from local state immediately
      setReceivedInvites(prev => prev.filter(inv => inv.id !== invite.id));
      
      // Redirect to messages page after a short delay
      setTimeout(() => {
        navigate('/messages');
      }, 1500);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error("Failed to accept invitation");
    }
  };

  // Handle declining a received invitation
  const handleDeclineInvitation = async (invite: Invitation) => {
    if (!user?.id) {
      toast.error("You must be logged in to decline invitations");
      return;
    }

    try {
      console.log('❌ Declining invitation:', invite.id);
      
      // Update invitation status to 'declined' in database
      const { error: updateError } = await supabase
        .from('invitations')
        .update({ status: 'declined' })
        .eq('id', invite.id);

      if (updateError) {
        console.error('Error updating invitation status:', updateError);
        toast.error("Failed to decline invitation");
        return;
      }

      console.log('Invitation declined successfully');
      
      // Remove from local state immediately
      setReceivedInvites(prev => prev.filter(inv => inv.id !== invite.id));
      toast.success("✅ Invitation declined");
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast.error("Failed to decline invitation");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Exchanges</h1>
        <p className="text-muted-foreground">
          Manage your skill exchanges and mentorship sessions
        </p>
      </div>

      {/* Horizontal Navigation Tabs */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {getTabCount(tab.id)}
                </Badge>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Section */}
      <div className="space-y-4">
        {activeTab === 'responses' ? (
          // Responses Tab Content
          <div>
            {/* Responses Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Responses to Your Requests</h3>
            </div>
            
            {responses.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No responses yet</h3>
                    <p className="text-sm">
                      You haven't received any responses to your learning requests yet.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              responses.map((response) => (
                <Card key={response.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      {/* Response Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>
                            {response.responder.avatar}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{response.responder.name}</h3>
                            {response.responder.isVerified && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                Verified
                              </Badge>
                            )}
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current text-yellow-400" />
                              <span className="text-sm">{response.responder.rating}</span>
                            </div>
                          </div>
                          
                          <Badge variant="secondary" className="text-xs mb-2">
                            {response.skill}
                          </Badge>
                          
                          <p className="text-muted-foreground mb-3">{response.message}</p>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(response.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeclineResponse(response)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleAcceptResponse(response)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : activeTab === 'sent' ? (
          // Sent Invites Tab Content
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Sent Invitations</h3>
            </div>
            
            {sentInvites.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <XCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No sent invitations</h3>
                    <p className="text-sm">
                      You haven't sent any invitations yet. Start by browsing users and sending invites!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              sentInvites.map((invite) => (
                <Card key={invite.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={invite.recipient?.avatar} />
                          <AvatarFallback>
                            {invite.recipient?.avatar || '👤'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{invite.recipient?.name}</h3>
                            <Badge variant={invite.status === 'pending' ? 'secondary' : invite.status === 'accepted' ? 'default' : 'destructive'} className="text-xs">
                              {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <Badge variant="secondary" className="text-xs mb-2">
                            {invite.skill}
                          </Badge>
                          
                          <p className="text-muted-foreground mb-3">{invite.message}</p>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(invite.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : activeTab === 'request' ? (
          // Received Invites Tab Content
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Received Invitations</h3>
            </div>
            
            {receivedInvites.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No pending invitations</h3>
                    <p className="text-sm">
                      You don't have any pending invitations from other users.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              receivedInvites.map((invite) => (
                <Card key={invite.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={invite.sender?.avatar} />
                          <AvatarFallback>
                            {invite.sender?.avatar || '👤'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{invite.sender?.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              Wants to learn
                            </Badge>
                          </div>
                          
                          <Badge variant="secondary" className="text-xs mb-2">
                            {invite.skill}
                          </Badge>
                          
                          <p className="text-muted-foreground mb-3">{invite.message}</p>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(invite.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeclineInvitation(invite)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleAcceptInvitation(invite)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : activeTab === 'active' ? (
          // Active Exchanges Tab Content
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Active Exchanges</h3>
            </div>
            
            {activeExchanges.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No active exchanges</h3>
                    <p className="text-sm">
                      You don't have any active exchanges at the moment.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              activeExchanges.map((exchange) => (
                <Card key={exchange.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={exchange.otherUser.avatar} />
                          <AvatarFallback>
                            {exchange.otherUser.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{exchange.otherUser.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {exchange.userIsMentorship ? 'Mentorship' : 'Exchange'}
                            </Badge>
                            <Badge variant="default" className="text-xs">
                              Active
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground mb-2">
                            {exchange.userIsMentorship ? 'You are mentoring' : 'You are learning'} {exchange.otherUserSkill}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {exchange.startedAt.toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {/* Assuming a default location or that it's not always available */}
                              {exchange.location || 'Location not specified'}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {exchange.skill}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Chat
                        </Button>
                        {exchange.canFinish && (
                          <Button size="sm" variant="outline" onClick={() => {
                            // TODO: Implement chat completion logic
                            toast.info("Chat completion not yet implemented.");
                          }}>
                            Finish
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : activeTab === 'completed' ? (
          // Completed Exchanges Tab Content
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Completed Exchanges</h3>
            </div>
            
            {completedExchanges.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No completed exchanges</h3>
                    <p className="text-sm">
                      You haven't completed any exchanges yet.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              completedExchanges.map((exchange) => (
                <Card key={exchange.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={exchange.otherUser.avatar} />
                          <AvatarFallback>
                            {exchange.otherUser.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{exchange.otherUser.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {exchange.userIsMentorship ? 'Mentorship' : 'Exchange'}
                            </Badge>
                            <Badge variant="default" className="text-xs">
                              Completed
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground mb-2">
                            {exchange.userIsMentorship ? 'You were mentoring' : 'You were learning'} {exchange.otherUserSkill}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {exchange.completedAt.toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {/* Assuming a default location or that it's not always available */}
                              {exchange.location || 'Location not specified'}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {exchange.skill}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Chat
                        </Button>
                        {exchange.averageRating && (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < exchange.averageRating!
                                    ? 'fill-current text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleOpenReview(exchange)}
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : currentExchanges.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No {activeTab} exchanges</h3>
                <p className="text-sm">
                  {activeTab === 'active' && "You don't have any active exchanges at the moment."}
                  {activeTab === 'completed' && "No completed exchanges yet."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          currentExchanges.map((exchange) => {
            const statusConfig = getStatusConfig(exchange.status, exchange.type);
            const StatusIcon = statusConfig.icon;
            
            return (
              <Card key={exchange.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Exchange Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={exchange.otherUser.avatar} />
                        <AvatarFallback>
                          {exchange.otherUser.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{exchange.otherUser.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {getTypeBadge(exchange.type)}
                          </Badge>
                          <Badge variant={statusConfig.variant} className="text-xs">
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.text}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-2">{exchange.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(exchange.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {exchange.location}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {exchange.skill}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      {exchange.status === 'active' && (
                        <>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Chat
                          </Button>
                          <Button size="sm">
                            Complete
                          </Button>
                        </>
                      )}
                      
                      {exchange.status === 'completed' && (
                        <>
                          {exchange.rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < exchange.rating!
                                      ? 'fill-current text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleOpenReview(exchange)}
                          >
                            Review
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      {selectedExchange && (
        <ExchangeReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          exchange={selectedExchange}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
} 