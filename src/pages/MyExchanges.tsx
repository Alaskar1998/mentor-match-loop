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
  X,
  Send,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ExchangeReviewModal } from '../components/review/ExchangeReviewModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ReviewModal } from '../components/review/ReviewModal';
import { ResponseModal } from '../components/requests/ResponseModal';
import { useOptimizedPolling } from '../hooks/useOptimizedPolling';

// Tab configuration - responses tab is disabled
const tabs = [
  { id: 'active', label: 'Active', icon: Clock },
  // { id: 'responses', label: 'Responses', icon: MessageCircle }, // DISABLED
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

const MyExchanges = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [exchanges, setExchanges] = useState<Record<string, Exchange[]>>(mockExchanges);
  const [responses, setResponses] = useState<LearningResponse[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<LearningResponse | null>(null);
  const [acceptedInvitations, setAcceptedInvitations] = useState<Set<string>>(new Set());

  // Initialize tab from URL params
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tabs.find(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Fetch data when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchData(false); // Pass isPolling = false for initial load
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  // Timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, setting loading to false');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  // Optimized polling for real-time updates - DISABLED for now
  // const { isActive: isPolling } = useOptimizedPolling(
  //   async () => {
  //     if (user?.id) {
  //       await fetchData(true); // Pass isPolling = true
  //     }
  //   },
  //   { 
  //     interval: 10000, // 10 seconds
  //     enabled: !!user?.id,
  //     maxRetries: 3
  //   }
  // );

  const fetchData = async (isPolling = false) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Only set loading to true if this is not a polling call
      if (!isPolling) {
        setLoading(true);
      }
      
      // Fetch active exchanges
      await fetchActiveExchanges();
      
      // Fetch completed exchanges
      await fetchCompletedExchanges();
      
      // Fetch user responses (DISABLED - responses tab is disabled)
      // await fetchUserResponses();
      
      // Fetch sent invites
      await fetchSentInvites();
      
      // Fetch received invites
      await fetchReceivedInvites();
      
    } catch (error) {
      console.error('Error fetching data:', error);
      if (!isPolling) {
        toast.error('Failed to load exchanges');
      }
    } finally {
      // Only set loading to false if this is not a polling call
      if (!isPolling) {
        setLoading(false);
      }
    }
  };

  const fetchActiveExchanges = async () => {
    try {
      // First fetch exchange contracts without joins
      const { data: contractsData, error: contractsError } = await supabase
        .from('exchange_contracts')
        .select(`
          id,
          contract_data,
          status,
          created_at,
          updated_at,
          student_id,
          mentor_id
        `)
        .or(`student_id.eq.${user?.id},mentor_id.eq.${user?.id}`)
        .in('status', ['active', 'pending', 'in_progress']);

      if (contractsError) {
        console.error('Error fetching active exchanges:', contractsError);
        setExchanges(prev => ({ ...prev, active: [] }));
        return;
      }

      if (!contractsData || contractsData.length === 0) {
        setExchanges(prev => ({ ...prev, active: [] }));
        return;
      }

      // Get unique user IDs to fetch profiles separately
      const userIds = [...new Set([
        ...contractsData.map(c => c.student_id),
        ...contractsData.map(c => c.mentor_id)
      ])];

      // Fetch profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue without profiles rather than failing completely
      }

      // Create a map for quick profile lookup
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      const activeExchanges: Exchange[] = contractsData.map(exchange => {
        const contractData = exchange.contract_data || {};
        const isStudent = exchange.student_id === user?.id;
        const otherUserId = isStudent ? exchange.mentor_id : exchange.student_id;
        const otherUser = profilesMap.get(otherUserId);
        
        return {
          id: exchange.id,
          type: isStudent ? 'learning' : 'teaching',
          status: exchange.status,
          otherUser: {
            name: otherUser?.display_name || 'Unknown User',
            avatar: otherUser?.avatar_url || null
          },
          skill: contractData.student_skill || contractData.mentor_skill || 'Unknown Skill',
          date: exchange.created_at,
          location: 'Online',
          description: contractData.description || 'No description available',
          rating: undefined
        };
      });

      setExchanges(prev => ({ ...prev, active: activeExchanges }));
    } catch (error) {
      console.error('Error in fetchActiveExchanges:', error);
      setExchanges(prev => ({ ...prev, active: [] }));
    }
  };

  const fetchCompletedExchanges = async () => {
    try {
      // First fetch exchange contracts without joins
      const { data: contractsData, error: contractsError } = await supabase
        .from('exchange_contracts')
        .select(`
          id,
          contract_data,
          status,
          created_at,
          updated_at,
          student_id,
          mentor_id
        `)
        .or(`student_id.eq.${user?.id},mentor_id.eq.${user?.id}`)
        .eq('status', 'completed');

      if (contractsError) {
        console.error('Error fetching completed exchanges:', contractsError);
        setExchanges(prev => ({ ...prev, completed: [] }));
        return;
      }

      if (!contractsData || contractsData.length === 0) {
        setExchanges(prev => ({ ...prev, completed: [] }));
        return;
      }

      // Get unique user IDs to fetch profiles separately
      const userIds = [...new Set([
        ...contractsData.map(c => c.student_id),
        ...contractsData.map(c => c.mentor_id)
      ])];

      // Fetch profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue without profiles rather than failing completely
      }

      // Create a map for quick profile lookup
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      const completedExchanges: Exchange[] = contractsData.map(exchange => {
        const contractData = exchange.contract_data || {};
        const isStudent = exchange.student_id === user?.id;
        const otherUserId = isStudent ? exchange.mentor_id : exchange.student_id;
        const otherUser = profilesMap.get(otherUserId);
        
        return {
          id: exchange.id,
          type: isStudent ? 'learning' : 'teaching',
          status: exchange.status,
          otherUser: {
            name: otherUser?.display_name || 'Unknown User',
            avatar: otherUser?.avatar_url || null
          },
          skill: contractData.student_skill || contractData.mentor_skill || 'Unknown Skill',
          date: exchange.updated_at,
          location: 'Online',
          description: contractData.description || 'No description available',
          rating: undefined
        };
      });

      setExchanges(prev => ({ ...prev, completed: completedExchanges }));
    } catch (error) {
      console.error('Error in fetchCompletedExchanges:', error);
      setExchanges(prev => ({ ...prev, completed: [] }));
    }
  };

  // DISABLED - Responses tab is disabled
  // const fetchUserResponses = async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('learning_responses')
  //       .select(`
  //         id,
  //         learning_request_id,
  //         responder_id,
  //         message,
  //         status,
  //         created_at,
  //         learning_requests!learning_responses_learning_request_id_fkey(skill),
  //         profiles!learning_responses_responder_id_fkey(display_name, avatar_url)
  //       `)
  //       .eq('learning_requests.user_id', user?.id);

  //     if (error) {
  //       console.error('Error fetching user responses:', error);
  //       return;
  //     }

  //     const formattedResponses: LearningResponse[] = (data || []).map(response => ({
  //       id: response.id,
  //       learning_request_id: response.learning_request_id,
  //       responder: {
  //         id: response.responder_id,
  //         name: response.profiles?.display_name || 'Unknown User',
  //         avatar: response.profiles?.avatar_url || '',
  //         rating: 4.5, // Default rating
  //         isVerified: true // Default verification status
  //       },
  //       message: response.message,
  //       status: response.status as "pending" | "accepted" | "declined",
  //       created_at: response.created_at,
  //       skill: response.learning_requests?.skill || 'Unknown Skill'
  //     }));

  //     setResponses(formattedResponses);
  //   } catch (error) {
  //     console.error('Error in fetchUserResponses:', error);
  //   }
  // };

  const fetchSentInvites = async () => {
    try {
      // First fetch invitations without joins
      const { data: invitesData, error: invitesError } = await supabase
        .from('invitations')
        .select(`
          id,
          sender_id,
          recipient_id,
          skill,
          message,
          status,
          created_at
        `)
        .eq('sender_id', user?.id);

      if (invitesError) {
        console.error('Error fetching sent invites:', invitesError);
        setExchanges(prev => ({ ...prev, sent: [] }));
        return;
      }

      if (!invitesData || invitesData.length === 0) {
        setExchanges(prev => ({ ...prev, sent: [] }));
        return;
      }

      // Get unique recipient IDs to fetch profiles separately
      const recipientIds = [...new Set(invitesData.map(invite => invite.recipient_id))];

      // Fetch profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', recipientIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue without profiles rather than failing completely
      }

      // Create a map for quick profile lookup
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      const sentInvites: Exchange[] = invitesData
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort newer to older
        .map(invite => {
          const otherUser = profilesMap.get(invite.recipient_id);
          
          return {
            id: invite.id,
            type: 'invitation',
            status: invite.status,
            otherUser: {
              name: otherUser?.display_name || 'Unknown User',
              avatar: otherUser?.avatar_url || null
            },
            skill: invite.skill,
            date: invite.created_at,
            location: 'Online',
            description: invite.message || 'No message',
            rating: undefined
          };
        });

      setExchanges(prev => ({ ...prev, sent: sentInvites }));
    } catch (error) {
      console.error('Error in fetchSentInvites:', error);
      setExchanges(prev => ({ ...prev, sent: [] }));
    }
  };

  const fetchReceivedInvites = async () => {
    try {
      // First fetch invitations without joins
      const { data: invitesData, error: invitesError } = await supabase
        .from('invitations')
        .select(`
          id,
          sender_id,
          recipient_id,
          skill,
          message,
          status,
          created_at
        `)
        .eq('recipient_id', user?.id);

      if (invitesError) {
        console.error('Error fetching received invites:', invitesError);
        setExchanges(prev => ({ ...prev, request: [] }));
        setInvitations([]);
        return;
      }

      if (!invitesData || invitesData.length === 0) {
        setExchanges(prev => ({ ...prev, request: [] }));
        setInvitations([]);
        return;
      }

      // Store original invitation data
      setInvitations(invitesData);

      // Track accepted invitations
      const acceptedIds = invitesData
        .filter(invite => invite.status === 'accepted')
        .map(invite => invite.id);
      setAcceptedInvitations(new Set(acceptedIds));

      // Get unique sender IDs to fetch profiles separately
      const senderIds = [...new Set(invitesData.map(invite => invite.sender_id))];

      // Fetch profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', senderIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue without profiles rather than failing completely
      }

      // Create a map for quick profile lookup
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      const receivedInvites: Exchange[] = invitesData
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort newer to older
        .map(invite => {
          const otherUser = profilesMap.get(invite.sender_id);
          
          return {
            id: invite.id,
            type: 'invitation',
            status: invite.status,
            otherUser: {
              name: otherUser?.display_name || 'Unknown User',
              avatar: otherUser?.avatar_url || null
            },
            skill: invite.skill,
            date: invite.created_at,
            location: 'Online',
            description: invite.message || 'No message',
            rating: undefined
          };
        });

      setExchanges(prev => ({ ...prev, request: receivedInvites }));
    } catch (error) {
      console.error('Error in fetchReceivedInvites:', error);
      setExchanges(prev => ({ ...prev, request: [] }));
      setInvitations([]);
    }
  };

  const handleTabChange = (tabId: string) => {
    // Prevent switching to responses tab (disabled)
    if (tabId === 'responses') {
      toast.error('Responses tab is temporarily disabled');
      return;
    }
    
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'active':
        return exchanges.active.length;
      case 'responses':
        return 0; // Always 0 since responses is disabled
      case 'request':
        return exchanges.request.length;
      case 'sent':
        return exchanges.sent.length;
      case 'completed':
        return exchanges.completed.length;
      default:
        return 0;
    }
  };

  const getStatusConfig = (status: string, type: string) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-800 border-green-200', label: 'Active' };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending' };
      case 'completed':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Completed' };
      case 'declined':
        return { color: 'bg-red-100 text-red-800 border-red-200', label: 'Declined' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status };
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'learning':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Learning' };
      case 'teaching':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Teaching' };
      case 'invitation':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Invitation' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', label: type };
    }
  };

  const handleOpenReview = (exchange: Exchange) => {
    setSelectedExchange(exchange);
    setReviewModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    setReviewModalOpen(false);
    setSelectedExchange(null);
    // Refresh data without showing loading state
    fetchData(true); // Pass isPolling = true to avoid loading state
  };

  // DISABLED - Responses functionality is disabled
  // const handleAcceptResponse = async (response: LearningResponse) => {
  //   // Implementation for accepting response
  // };

  // const handleDeclineResponse = async (response: LearningResponse) => {
  //   // Implementation for declining response
  // };

  const handleAcceptInvitation = async (invite: Invitation) => {
    try {
      console.log('Accepting invitation:', invite);
      
      // Validate invitation data
      if (!invite.sender_id || !invite.recipient_id) {
        console.error('Invalid invitation data:', invite);
        toast.error('Invalid invitation data');
        return;
      }

      // First, update the invitation status
      const { error: updateError } = await supabase
        .from('invitations')
        .update({ status: 'accepted' })
        .eq('id', invite.id);

      if (updateError) {
        console.error('Error accepting invitation:', updateError);
        toast.error('Failed to accept invitation');
        return;
      }

      // Check if a chat already exists between these users for this skill
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .or(`and(user1_id.eq.${invite.sender_id},user2_id.eq.${invite.recipient_id}),and(user1_id.eq.${invite.recipient_id},user2_id.eq.${invite.sender_id})`)
        .eq('skill', invite.skill)
        .single();

      let chatData;
      if (existingChat) {
        // Use existing chat
        chatData = existingChat;
        console.log('Using existing chat:', chatData.id);
      } else {
        // Create a new chat between the users
        console.log('Creating new chat with data:', {
          user1_id: invite.sender_id,
          user2_id: invite.recipient_id,
          skill: invite.skill,
          status: 'active',
          exchange_state: 'pending_start'
        });
        
        const { data: newChatData, error: chatError } = await supabase
          .from('chats')
          .insert({
            user1_id: invite.sender_id,
            user2_id: invite.recipient_id,
            skill: invite.skill,
            status: 'active',
            exchange_state: 'pending_start'
          })
          .select()
          .single();

        if (chatError) {
          console.error('Error creating chat:', chatError);
          toast.error('Failed to create chat');
          return;
        }
        chatData = newChatData;
      }

      // Get current user's profile for notification
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user?.id)
        .single();

      const currentUserName = currentUserProfile?.display_name || user?.email || 'Someone';

      // Create notification for the sender about the acceptance
      try {
        await notificationService.createNotification({
          userId: invite.sender_id,
          title: 'Invitation Accepted!',
          message: `${currentUserName} accepted your invitation to learn ${invite.skill}. Click to start chatting!`,
          isRead: false,
          type: 'invitation_accepted',
          actionUrl: `/chat/${chatData.id}`,
          metadata: { 
            senderId: user?.id,
            senderName: currentUserName,
            chatId: chatData.id,
            skill: invite.skill
          }
        });
      } catch (notificationError) {
        console.error('Failed to create acceptance notification:', notificationError);
      }

      toast.success('Invitation accepted! The other user has been notified.');
      
      // Track this invitation as accepted
      setAcceptedInvitations(prev => new Set([...prev, invite.id]));
      
      // Refresh data without showing loading state
      await fetchData(true); // Pass isPolling = true to avoid loading state
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation');
    }
  };

  const handleSendMessage = async (invite: Invitation) => {
    try {
      // Check if a chat already exists between these users for this skill
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .or(`and(user1_id.eq.${invite.sender_id},user2_id.eq.${invite.recipient_id}),and(user1_id.eq.${invite.recipient_id},user2_id.eq.${invite.sender_id})`)
        .eq('skill', invite.skill)
        .single();

      if (existingChat) {
        // Navigate to existing chat
        navigate(`/chat/${existingChat.id}`);
      } else {
        // Create a new chat and navigate to it
        const { data: newChatData, error: chatError } = await supabase
          .from('chats')
          .insert({
            user1_id: invite.sender_id,
            user2_id: invite.recipient_id,
            skill: invite.skill,
            status: 'active',
            exchange_state: 'pending_start'
          })
          .select()
          .single();

        if (chatError) {
          console.error('Error creating chat:', chatError);
          toast.error('Failed to create chat');
          return;
        }

        navigate(`/chat/${newChatData.id}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to open chat');
    }
  };

  const handleDeclineInvitation = async (invite: Invitation) => {
    try {
      console.log('Declining invitation:', invite);
      
      // Validate invitation data
      if (!invite.id) {
        console.error('Invalid invitation data:', invite);
        toast.error('Invalid invitation data');
        return;
      }

      const { error } = await supabase
        .from('invitations')
        .update({ status: 'declined' })
        .eq('id', invite.id);

      if (error) {
        console.error('Error declining invitation:', error);
        toast.error('Failed to decline invitation');
        return;
      }

      toast.success('Invitation declined');
      // Refresh data without showing loading state
      await fetchData(true); // Pass isPolling = true to avoid loading state
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast.error('Failed to decline invitation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your exchanges...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">My Exchanges</h1>
            <p className="text-muted-foreground">
              Manage your skill exchanges and learning activities
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              {tabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex items-center gap-2"
                  disabled={tab.id === 'responses'} // Disable responses tab
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {getTabCount(tab.id) > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {getTabCount(tab.id)}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Active Exchanges */}
            <TabsContent value="active" className="space-y-4">
              {exchanges.active.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-muted-foreground mb-4">
                      No active exchanges found.
                    </div>
                    <Button onClick={() => navigate('/search')} variant="outline">
                      Find Exchange Opportunities
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                exchanges.active.map((exchange) => (
                  <Card key={exchange.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={exchange.otherUser.avatar || undefined} />
                            <AvatarFallback>{exchange.otherUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{exchange.otherUser.name}</h3>
                              <Badge className={getTypeBadge(exchange.type).color}>
                                {getTypeBadge(exchange.type).label}
                              </Badge>
                              <Badge className={getStatusConfig(exchange.status, exchange.type).color}>
                                {getStatusConfig(exchange.status, exchange.type).label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {exchange.skill} • {exchange.location}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {exchange.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/chat/${exchange.id}`)}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Chat
                          </Button>
                          {exchange.status === 'completed' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenReview(exchange)}
                            >
                              <Star className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Request Tab (Received Invitations) */}
            <TabsContent value="request" className="space-y-4">
              {exchanges.request.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-muted-foreground mb-4">
                      No received invitations found.
                    </div>
                  </CardContent>
                </Card>
              ) : (
                exchanges.request.map((invite) => (
                  <Card key={invite.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={invite.otherUser.avatar || undefined} />
                            <AvatarFallback>{invite.otherUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{invite.otherUser.name}</h3>
                              <Badge className={getStatusConfig(invite.status, invite.type).color}>
                                {getStatusConfig(invite.status, invite.type).label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {invite.skill} • {invite.location}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {invite.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {invite.status === 'pending' && !acceptedInvitations.has(invite.id) && (
                            <>
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => {
                                  const originalInvite = invitations.find(inv => inv.id === invite.id);
                                  if (originalInvite) {
                                    handleAcceptInvitation(originalInvite);
                                  } else {
                                    toast.error('Failed to find invitation data');
                                  }
                                }}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Accept
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  const originalInvite = invitations.find(inv => inv.id === invite.id);
                                  if (originalInvite) {
                                    handleDeclineInvitation(originalInvite);
                                  } else {
                                    toast.error('Failed to find invitation data');
                                  }
                                }}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Decline
                              </Button>
                            </>
                          )}
                          {(invite.status === 'accepted' || acceptedInvitations.has(invite.id)) && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => {
                                const originalInvite = invitations.find(inv => inv.id === invite.id);
                                if (originalInvite) {
                                  handleSendMessage(originalInvite);
                                } else {
                                  toast.error('Failed to find invitation data');
                                }
                              }}
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Send Message
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Sent Tab */}
            <TabsContent value="sent" className="space-y-4">
              {exchanges.sent.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-muted-foreground mb-4">
                      No sent invitations found.
                    </div>
                  </CardContent>
                </Card>
              ) : (
                exchanges.sent.map((invite) => (
                  <Card key={invite.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={invite.otherUser.avatar || undefined} />
                            <AvatarFallback>{invite.otherUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{invite.otherUser.name}</h3>
                              <Badge className={getStatusConfig(invite.status, invite.type).color}>
                                {getStatusConfig(invite.status, invite.type).label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {invite.skill} • {invite.location}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {invite.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Completed Tab */}
            <TabsContent value="completed" className="space-y-4">
              {exchanges.completed.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-muted-foreground mb-4">
                      No completed exchanges found.
                    </div>
                  </CardContent>
                </Card>
              ) : (
                exchanges.completed.map((exchange) => (
                  <Card key={exchange.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={exchange.otherUser.avatar || undefined} />
                            <AvatarFallback>{exchange.otherUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{exchange.otherUser.name}</h3>
                              <Badge className={getTypeBadge(exchange.type).color}>
                                {getTypeBadge(exchange.type).label}
                              </Badge>
                              <Badge className={getStatusConfig(exchange.status, exchange.type).color}>
                                {getStatusConfig(exchange.status, exchange.type).label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {exchange.skill} • {exchange.location}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {exchange.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenReview(exchange)}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Modals */}
        {selectedExchange && (
          <ExchangeReviewModal
            isOpen={reviewModalOpen}
            onClose={() => setReviewModalOpen(false)}
            exchange={selectedExchange}
            onReviewSubmitted={handleReviewSubmitted}
          />
        )}

        {selectedResponse && (
          <ResponseModal
            isOpen={responseModalOpen}
            onClose={() => setResponseModalOpen(false)}
            response={selectedResponse}
            onResponseSubmitted={() => {
              setResponseModalOpen(false);
              setSelectedResponse(null);
              fetchData();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MyExchanges; 