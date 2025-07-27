import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Clock, MapPin, Plus, Search, Star, MessageCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ResponseModal } from "@/components/requests/ResponseModal";

interface LearningRequest {
  id: string;
  user: {
    name: string;
    avatar: string;
    rating: number;
    isVerified: boolean;
  };
  skill: string;
  level: string;
  description: string;
  country: string;
  urgency: "urgent" | "soon" | "flexible";
  postedAt: Date;
  responses: number;
}

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case "urgent":
      return "bg-red-100 text-red-800 border-red-200";
    case "soon":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "flexible":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

export const RequestsFeed = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<LearningRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LearningRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  // Refresh requests when component comes into focus (e.g., after creating a new request)
  useEffect(() => {
    const handleFocus = () => {
      fetchRequests();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      console.log('Fetching learning requests...');
      
      const { data: requestsData, error } = await supabase
        .from('learning_requests')
        .select(`
          id,
          skill,
          level,
          description,
          country,
          urgency,
          created_at,
          responses_count,
          user_id,
          profiles!learning_requests_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching requests:', error);
        toast.error(`Failed to load learning requests: ${error.message}`);
        return;
      }

      console.log('Raw requests data:', requestsData);

      const formattedRequests: LearningRequest[] = requestsData?.map(req => ({
        id: req.id,
        user: {
          name: req.profiles?.display_name || 'Anonymous User',
          avatar: req.profiles?.avatar_url || '',
          rating: 4.5, // Default rating - could be calculated from reviews
          isVerified: true // Default - could be based on actual verification status
        },
        skill: req.skill,
        level: req.level,
        description: req.description,
        country: req.country,
        urgency: req.urgency as "urgent" | "soon" | "flexible",
        postedAt: new Date(req.created_at),
        responses: req.responses_count
      })) || [];

      console.log('Formatted requests:', formattedRequests);
      setRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error("Something went wrong while loading requests");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = (request: LearningRequest) => {
    setSelectedRequest(request);
    setResponseModalOpen(true);
  };

  const handleResponseSubmitted = () => {
    // Refresh the requests data
    fetchRequests();
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = filterCountry === "all" || request.country === filterCountry;
    const matchesUrgency = filterUrgency === "all" || request.urgency === filterUrgency;
    
    return matchesSearch && matchesCountry && matchesUrgency;
  });

  const countries = Array.from(new Set(requests.map(r => r.country)));

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Learning Requests</h1>
            <p className="text-muted-foreground">
              Help learners by responding to their skill requests
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={fetchRequests} 
              variant="outline" 
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => navigate("/create-request")} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Request
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search skills or descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterCountry} onValueChange={setFilterCountry}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="soon">Soon</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">Loading learning requests...</div>
              </CardContent>
            </Card>
          ) : filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={request.user.avatar} />
                      <AvatarFallback>{request.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{request.user.name}</h3>
                        {request.user.isVerified && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current text-yellow-400" />
                          {request.user.rating}
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {request.country}
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(request.postedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getUrgencyColor(request.urgency)}>
                      {request.urgency}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-lg mb-1">
                      Looking to learn: <span className="text-primary">{request.skill}</span>
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      Current level: {request.level}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{request.description}</p>
                  <div className="flex items-center justify-between pt-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageCircle className="w-4 h-4" />
                      {request.responses} response{request.responses !== 1 ? 's' : ''}
                    </div>
                    <Button onClick={() => handleRespond(request)} size="sm">
                      Respond to Request
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground mb-4">
                No learning requests found matching your filters.
              </div>
              <Button onClick={() => navigate("/create-request")} variant="outline">
                Create the first request
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Response Modal */}
      {selectedRequest && (
        <ResponseModal
          isOpen={responseModalOpen}
          onClose={() => {
            setResponseModalOpen(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
          onResponseSubmitted={handleResponseSubmitted}
        />
      )}
    </div>
  );
};