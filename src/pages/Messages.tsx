import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MessageCircle, Clock, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Chat {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  skill: string;
  status: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
}

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const highlightChatId = searchParams.get("chatId");

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredChats(
        chats.filter(
          (chat) =>
            chat.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredChats(chats);
    }
  }, [chats, searchQuery]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      
      const { data: chatsData, error } = await supabase
        .from("chats")
        .select(`
          id,
          user1_id,
          user2_id,
          skill,
          status,
          updated_at
        `)
        .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // For each chat, get the last message and recipient info
      const chatsWithDetails = await Promise.all(
        chatsData.map(async (chat) => {
          const recipientId = chat.user1_id === user?.id ? chat.user2_id : chat.user1_id;
          
          // Get last message
          const { data: lastMessageData } = await supabase
            .from("chat_messages")
            .select("message, created_at")
            .eq("chat_id", chat.id)
            .order("created_at", { ascending: false })
            .limit(1);

          // Get unread count (messages not from current user)
          const { count: unreadCount } = await supabase
            .from("chat_messages")
            .select("*", { count: "exact", head: true })
            .eq("chat_id", chat.id)
            .neq("sender_id", user?.id);

          // Get recipient profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("id", recipientId)
            .single();

          return {
            id: chat.id,
            recipientId,
            recipientName: profileData?.display_name || "Unknown User",
            recipientAvatar: profileData?.avatar_url,
            skill: chat.skill,
            status: chat.status,
            lastMessage: lastMessageData?.[0]?.message || "No messages yet",
            timestamp: new Date(lastMessageData?.[0]?.created_at || chat.updated_at),
            unreadCount: unreadCount || 0,
          };
        })
      );

      setChats(chatsWithDetails);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "paused":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Messages</h1>
            <p className="text-muted-foreground mt-1">
              Manage your skill exchange conversations
            </p>
          </div>
          <Button onClick={() => navigate("/search")} className="gap-2">
            <Users className="h-4 w-4" />
            Find New Partners
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Messages List */}
        {filteredChats.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No conversations found" : "No conversations yet"}
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Start connecting with skill exchange partners to begin conversations"}
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate("/search")} className="gap-2">
                  <Users className="h-4 w-4" />
                  Find Partners
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredChats.map((chat) => (
              <Card
                key={chat.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  highlightChatId === chat.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleChatClick(chat.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={chat.recipientAvatar} />
                      <AvatarFallback>
                        {chat.recipientName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {chat.recipientName}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {chat.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 px-2 text-xs">
                              {chat.unreadCount}
                            </Badge>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(chat.timestamp, { addSuffix: true })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {chat.skill}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(chat.status)}`} />
                          <span className="text-xs text-muted-foreground capitalize">
                            {chat.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}