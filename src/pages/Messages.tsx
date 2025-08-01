import { useState, useEffect, useCallback } from "react";
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
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

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
  const { user, isAuthenticated, isLoading: authLoading, isSessionRestoring } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const highlightChatId = searchParams.get("chatId");

  // Debounced fetch function to prevent excessive calls
  const debouncedFetchChats = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime;
    
    // Only fetch if it's been more than 5 seconds since last fetch
    if (timeSinceLastFetch < 5000) {
      console.log('⏱️ Skipping fetch - too soon since last fetch');
      return;
    }
    
    setLastFetchTime(now);
    await fetchChats();
  }, [lastFetchTime]);

  useEffect(() => {
    // Wait for auth to be ready and user to be loaded
    if (isAuthenticated && user?.id && !authLoading && !isSessionRestoring) {
      console.log('✅ Auth ready, fetching chats for user:', user.id);
      // Add a small delay to ensure user object is fully populated
      setTimeout(() => {
        debouncedFetchChats();
      }, 200);
    } else if (!isAuthenticated && !user && !authLoading && !isSessionRestoring) {
      // If not authenticated and auth is done loading, stop loading
      console.log('❌ Not authenticated, stopping loading');
      setLoading(false);
    } else {
      console.log('⏳ Auth state:', { 
        isAuthenticated, 
        userId: user?.id, 
        authLoading, 
        isSessionRestoring,
        hasUser: !!user,
        userEmail: user?.email,
        userObject: user
      });
    }
  }, [isAuthenticated, user, authLoading, isSessionRestoring, debouncedFetchChats]);

  // Add a separate effect to handle the case where user becomes available after initial load
  useEffect(() => {
    // If we have a user with ID but no chats loaded yet, fetch them
    if (isAuthenticated && user?.id && !authLoading && !isSessionRestoring && chats.length === 0 && !loading) {
      console.log('🔄 User became available, fetching chats for user:', user.id);
      // Add a small delay to ensure user object is fully populated
      setTimeout(() => {
        debouncedFetchChats();
      }, 200);
    }
  }, [isAuthenticated, user, authLoading, isSessionRestoring, chats.length, loading, debouncedFetchChats]);

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
      console.log('🔄 fetchChats called with user:', user);
      setLoading(true);
      
      // Check if user ID exists before making the query
      if (!user?.id) {
        console.log("❌ Waiting for user ID to be available...", { user });
        setLoading(false);
        return;
      }
      
      console.log("🔄 Fetching chats for user:", user.id);
      
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
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching chats:", error);
        toast.error("Failed to load conversations");
        setLoading(false);
        return;
      }

      console.log("📋 Found chats:", chatsData?.length || 0, chatsData);

      // For each chat, get the last message and recipient info
      const chatsWithDetails = await Promise.all(
        chatsData.map(async (chat) => {
          const recipientId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id;
          
          // Get last message
          const { data: lastMessageData } = await supabase
            .from("chat_messages")
            .select("message, created_at")
            .eq("chat_id", chat.id)
            .order("created_at", { ascending: false })
            .limit(1);

          // Get unread count (messages not from current user AND not read)
          const { count: unreadCount } = await supabase
            .from("chat_messages")
            .select("*", { count: "exact", head: true })
            .eq("chat_id", chat.id)
            .neq("sender_id", user.id)
            .eq("is_read", false);

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
      console.log("✅ Chats loaded successfully:", chatsWithDetails.length);
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = async (chatId: string) => {
    try {
      // Check if user ID exists before making the query
      if (!user?.id) {
        console.error("No user ID available for marking messages as read");
        return;
      }
      
      // Mark all messages in this chat as read for the current user
      const { error } = await supabase
        .from("chat_messages")
        .update({ is_read: true })
        .eq("chat_id", chatId)
        .neq("sender_id", user.id);

      if (error) {
        console.error("Error marking messages as read:", error);
      } else {
        console.log("✅ Messages marked as read for chat:", chatId);
        // Only refresh the chats list if there were unread messages
        const chat = chats.find(c => c.id === chatId);
        if (chat && chat.unreadCount > 0) {
          console.log('🔄 Refreshing chats list due to unread messages being marked as read');
          await debouncedFetchChats();
        }
      }
    } catch (error) {
      console.error("Error in handleChatClick:", error);
    }
    
    // Navigate to the chat
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

  // If not authenticated and auth is done loading, redirect to home
  useEffect(() => {
    console.log('🔍 Redirect check:', { 
      isAuthenticated, 
      authLoading, 
      isSessionRestoring, 
      user: !!user,
      shouldRedirect: !isAuthenticated && !authLoading && !isSessionRestoring && user === null 
    });
    
    if (!isAuthenticated && !authLoading && !isSessionRestoring && user === null) {
      console.log('User not authenticated, redirecting to home');
      navigate('/');
    }
  }, [isAuthenticated, authLoading, isSessionRestoring, user, navigate]);

  if (loading || authLoading || isSessionRestoring) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">
              {isSessionRestoring ? t('actions.loadingSession') : authLoading ? t('actions.loading') : t('actions.loadingConversations')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // If auth is done loading but user is not authenticated, show redirect message
  if (!authLoading && !isSessionRestoring && !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">{t('actions.redirecting')}</span>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated but user object is not fully loaded yet, show loading
  if (isAuthenticated && (!user || !user.id)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">{t('actions.loadingUserData')}</span>
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
            <h1 className="text-3xl font-bold text-foreground">{t('actions.messages')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('actions.manageConversations')}
            </p>
          </div>
          <Button onClick={() => navigate("/search")} className="gap-2">
            <Users className="h-4 w-4" />
            {t('actions.findNewPartners')}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t('actions.searchConversations')}
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
                {searchQuery ? t('actions.noConversationsFound') : t('actions.noConversationsYet')}
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                {searchQuery
                  ? t('actions.tryAdjustingSearch')
                  : t('actions.startConnectingPartners')}
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate("/search")} className="gap-2">
                  <Users className="h-4 w-4" />
                  {t('actions.findPartners')}
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