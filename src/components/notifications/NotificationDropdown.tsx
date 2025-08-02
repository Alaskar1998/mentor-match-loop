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
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { translateDate, translateName, transliterateName } from "@/utils/translationUtils";

// Function to translate notification messages
const translateNotificationMessage = (notification: Notification, language: string): string => {
  if (language !== 'ar') {
    return notification.message;
  }

  // Extract the actual name from the message if senderName is "Someone"
  let senderName = transliterateName(notification.senderName || 'Someone', 'en');
  
  // If senderName is "Someone", try to extract the real name from the message
  if (senderName === 'Someone') {
    // Try different patterns to extract the real name
    const nameMatch = notification.message.match(/([A-Za-z]+):/);
    if (nameMatch) {
      senderName = transliterateName(nameMatch[1], 'en');
    } else {
      // Try to extract from "Your exchange with Ahmad is now active"
      const exchangeMatch = notification.message.match(/Your exchange with ([A-Za-z]+) is now active/);
      if (exchangeMatch) {
        senderName = transliterateName(exchangeMatch[1], 'en');
      } else {
        // Try to extract from "Ahmad wants to start the exchange"
        const wantsMatch = notification.message.match(/([A-Za-z]+) wants to start the exchange/);
        if (wantsMatch) {
          senderName = transliterateName(wantsMatch[1], 'en');
        } else {
          // Try to extract from "Ahmad has agreed to the exchange contract"
          const agreedMatch = notification.message.match(/([A-Za-z]+) has agreed to the exchange contract/);
          if (agreedMatch) {
            senderName = transliterateName(agreedMatch[1], 'en');
          } else {
            // Try to extract from "Ahmad has reviewed your exchange"
            const reviewedMatch = notification.message.match(/([A-Za-z]+) has reviewed your exchange/);
            if (reviewedMatch) {
              senderName = transliterateName(reviewedMatch[1], 'en');
            } else {
              // Try to extract from "Ahmad marked the exchange as finished"
              const finishedMatch = notification.message.match(/([A-Za-z]+) marked the exchange as finished/);
              if (finishedMatch) {
                senderName = transliterateName(finishedMatch[1], 'en');
              }
            }
          }
        }
      }
    }
  }
  
  switch (notification.type) {
    case 'exchange_completed':
      return `${senderName} قام بتقييم التبادل. يمكنك الآن ترك تقييمك أيضاً.`;
    case 'exchange_finished':
      return `${senderName} حدد التبادل كمكتمل. يرجى إنهاء تبادلك أيضاً!`;
    case 'exchange_active':
      return `تبادلك مع ${senderName} نشط الآن. ابدأ التعلم!`;
    case 'learning_match':
      if (notification.message.includes('wants to start the exchange')) {
        return `${senderName} يريد بدء التبادل. اختر ما ستقوم بتدريسه.`;
      } else if (notification.message.includes('has agreed to the exchange contract')) {
        return `${senderName} وافق على عقد التبادل. يرجى المراجعة والموافقة لبدء التبادل.`;
      } else if (notification.message.includes('has reviewed your exchange')) {
        return `${senderName} قام بتقييم التبادل. يمكنك الآن ترك تقييمك أيضاً.`;
      } else if (notification.message.includes('Your exchange with') && notification.message.includes('is now active')) {
        // Extract name from "Your exchange with Ahmad is now active"
        const nameMatch = notification.message.match(/Your exchange with ([A-Za-z]+) is now active/);
        const extractedName = nameMatch ? transliterateName(nameMatch[1], 'en') : senderName;
        return `تبادلك مع ${extractedName} نشط الآن. ابدأ التعلم!`;
      }
      return notification.message;
    default:
      return notification.message;
  }
};

interface NotificationDropdownProps {
  type: 'general' | 'chat';
}

export const NotificationDropdown = ({ type }: NotificationDropdownProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language } = useLanguage();
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
            {type === 'general' ? t('actions.notifications') : t('actions.messages')}
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
                {t('actions.markAllRead')}
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
                    {t('actions.clearAll')}
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
              <p className="text-sm">{type === 'general' ? t('actions.noNotificationsYet') : t('actions.noMessagesYet')}</p>
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
                        {notification.type === 'new_message' ? t('actions.newMessage') :
                         notification.type === 'exchange_request' || notification.type === 'learning_match' ? t('actions.exchangeRequest') :
                         notification.type === 'exchange_active' ? t('actions.exchangeActive') :
                         notification.type === 'exchange_completed' ? t('actions.exchangeCompleted') :
                         notification.type === 'exchange_finished' ? t('actions.exchangeFinished') :
                         notification.type === 'contract_ready_for_review' ? t('actions.contractReadyForReview') :
                         notification.title}
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
                      {notification.type === 'new_message' && notification.senderName 
                        ? `${transliterateName(notification.senderName, 'en')}: ${notification.message.replace(/^[^:]+: /, '')}`
                        : translateNotificationMessage(notification, language)
                      }
                    </p>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {translateDate(notification.createdAt, language)}
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
                {type === 'general' ? t('actions.viewAllNotifications') : t('actions.viewAllMessages')}
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};