import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Mail, MoreHorizontal, Check, X, Trash2 } from "lucide-react";
import { Notification } from "@/types/notifications";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface NotificationDropdownProps {
  type: 'general' | 'chat';
}

export const NotificationDropdown = ({ type }: NotificationDropdownProps) => {
  const navigate = useNavigate();
  const {
    generalNotifications,
    chatNotifications,
    unreadCounts,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);

  const notifications = type === 'general' ? generalNotifications : chatNotifications;
  const unreadCount = type === 'general' ? unreadCounts.general : unreadCounts.chat;

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    
    setIsOpen(false);
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAllAsRead(type);
  };

  const handleClearAll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await clearAll(type);
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (notificationType: string) => {
    switch (notificationType) {
      case 'invitation_received':
        return '📨';
      case 'invitation_accepted':
        return '✅';
      case 'invitation_declined':
        return '❌';
      case 'learning_match':
        return '🎯';
      case 'system_announcement':
        return '📢';
      case 'giveaway':
        return '🎁';
      case 'exchange_completed':
        return '🎉';
      case 'profile_viewed':
        return '👁️';
      case 'new_message':
        return '💬';
      case 'new_chat':
        return '💭';
      default:
        return '📬';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {type === 'general' ? (
            <Bell className="h-5 w-5" />
          ) : (
            <Mail className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0 min-w-5"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 bg-background border shadow-lg" align="end">
        <div className="flex items-center justify-between p-3">
          <h3 className="font-semibold">
            {type === 'general' ? 'Notifications' : 'Messages'}
          </h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-6 px-2 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="w-full justify-start text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Clear all
                  </Button>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              {type === 'general' ? (
                <Bell className="h-8 w-8 mb-2 opacity-50" />
              ) : (
                <Mail className="h-8 w-8 mb-2 opacity-50" />
              )}
              <p className="text-sm">No {type === 'general' ? 'notifications' : 'messages'} yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                  !notification.isRead ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">
                    {type === 'chat' && 'senderAvatar' in notification 
                      ? notification.senderAvatar 
                      : getNotificationIcon(notification.type)
                    }
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm font-medium leading-tight ${
                        !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {notification.title}
                      </h4>
                      
                      <div className="flex items-center gap-1">
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteNotification(e, notification.id)}
                          className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  navigate(type === 'general' ? '/my-exchanges' : '/messages');
                  setIsOpen(false);
                }}
              >
                View all {type === 'general' ? 'notifications' : 'messages'}
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};