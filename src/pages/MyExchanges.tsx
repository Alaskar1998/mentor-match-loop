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

  // Refresh responses when Responses tab is opened
  useEffect(() => {
    if (user?.id && activeTab === 'responses') {
      console.log('Responses tab opened, refreshing responses...');
      fetchUserResponses();
    }
  }, [user?.id, activeTab]);

  // Get current tab's exchanges
  const currentExchanges = mockExchanges[activeTab as keyof typeof mockExchanges] || [];

  // Get count for each tab
  const getTabCount = (tabId: string) => {
    switch (tabId) {
      case 'active':
        return mockExchanges.active?.length || 0;
      case 'responses':
        return responses.length;
      case 'request':
        return mockExchanges.request?.length || 0;
      case 'sent':
        return mockExchanges.sent?.length || 0;
      case 'completed':
        return mockExchanges.completed?.length || 0;
      default:
        return 0;
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
        ) : currentExchanges.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No {activeTab} exchanges</h3>
                <p className="text-sm">
                  {activeTab === 'active' && "You don't have any active exchanges at the moment."}
                  {activeTab === 'responses' && "You haven't received any responses to your learning requests yet."}
                  {activeTab === 'request' && "No pending requests from other users."}
                  {activeTab === 'sent' && "You haven't sent any exchange requests yet."}
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
                      
                      {exchange.status === 'pending' && activeTab === 'request' && (
                        <>
                          <Button size="sm" variant="outline">
                            Decline
                          </Button>
                          <Button size="sm">
                            Accept
                          </Button>
                        </>
                      )}
                      
                      {exchange.status === 'pending' && activeTab === 'sent' && (
                        <Button size="sm" variant="outline">
                          Cancel
                        </Button>
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