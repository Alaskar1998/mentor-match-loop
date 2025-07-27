import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { ExchangeReviewModal } from '@/components/review/ExchangeReviewModal';
import { dummyLearningResponses } from '@/data/dummyLearningResponses';
import { supabase } from '@/integrations/supabase/client';
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

// Tab configuration for the horizontal navigation
const tabs = [
  { id: 'active', label: 'Active', icon: Clock },
  { id: 'responses', label: 'Responses', icon: MessageCircle },
  { id: 'request', label: 'Request', icon: User },
  { id: 'sent', label: 'Sent', icon: MessageSquare },
  { id: 'completed', label: 'Completed', icon: CheckCircle },
];

// Type definition for exchange objects
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

// Type definition for learning response objects
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

// Mock data for exchanges - replace with real data from your backend
const mockExchanges: Record<string, Exchange[]> = {
  active: [
    {
      id: '1',
      type: 'exchange',
      status: 'active',
      otherUser: { name: 'Sarah Johnson', avatar: null },
      skill: 'JavaScript',
      date: '2024-01-15',
      location: 'Online',
      description: 'Learning advanced React patterns and state management'
    },
    {
      id: '2',
      type: 'mentorship',
      status: 'active',
      otherUser: { name: 'Mike Chen', avatar: null },
      skill: 'Python',
      date: '2024-01-10',
      location: 'New York',
      description: 'Data science mentorship session'
    }
  ],
  request: [
    {
      id: '3',
      type: 'exchange',
      status: 'pending',
      otherUser: { name: 'Emma Davis', avatar: null },
      skill: 'Spanish',
      date: '2024-01-20',
      location: 'Online',
      description: 'Conversational Spanish practice'
    }
  ],
  sent: [
    {
      id: '4',
      type: 'exchange',
      status: 'pending',
      otherUser: { name: 'Alex Thompson', avatar: null },
      skill: 'Guitar',
      date: '2024-01-18',
      location: 'Los Angeles',
      description: 'Acoustic guitar lessons'
    }
  ],
  completed: [
    {
      id: '5',
      type: 'exchange',
      status: 'completed',
      otherUser: { name: 'Lisa Wang', avatar: null },
      skill: 'Cooking',
      date: '2024-01-05',
      location: 'San Francisco',
      description: 'Italian cuisine cooking class',
      rating: 5
    },
    {
      id: '6',
      type: 'mentorship',
      status: 'completed',
      otherUser: { name: 'David Kim', avatar: null },
      skill: 'UI/UX Design',
      date: '2024-01-01',
      location: 'Online',
      description: 'Design portfolio review',
      rating: 4
    }
  ]
};

// Mock data for learning responses - replace with real data from your backend
const mockResponses: LearningResponse[] = dummyLearningResponses;

export default function MyExchanges() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);

  // Get current tab's exchanges
  const currentExchanges = mockExchanges[activeTab as keyof typeof mockExchanges] || [];

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
      toast.success("✅ Response accepted — chat opened!");
      
      // TODO: Update response status to 'accepted' in database
      // TODO: Move exchange to Active tab
      
    } catch (error) {
      console.error('Error accepting response:', error);
      toast.error("Failed to accept response");
    }
  };

  // Handle declining a learning response
  const handleDeclineResponse = async (response: LearningResponse) => {
    try {
      // TODO: Update response status in database
      console.log('Declining response:', response.id);
      
      // Remove from responses list (in real app, this would update the database)
      toast.success("Response declined");
      
    } catch (error) {
      console.error('Error declining response:', error);
      toast.error("Failed to decline response");
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
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {activeTab === 'responses' ? mockResponses.length : currentExchanges.length}
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
          mockResponses.length === 0 ? (
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
            mockResponses.map((response) => (
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
          )
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
                        <div className="flex items-center gap-2">
                          {exchange.rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < exchange.rating! ? 'text-yellow-500 fill-current' : 'text-muted-foreground'
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
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedExchange(null);
          }}
          exchange={selectedExchange}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
} 