'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  X, 
  QrCode, 
  Users, 
  MessageCircle, 
  Trophy, 
  Gift,
  TrendingUp,
  Star,
  Zap,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface NotificationItem {
  id: string;
  type: 'qr_scan' | 'chat_message' | 'reward_earned' | 'leaderboard_change' | 'new_customer' | 'milestone';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  data?: any;
  priority: 'low' | 'medium' | 'high';
  actionLabel?: string;
  actionCallback?: () => void;
}

interface RealtimeNotificationsProps {
  businessId?: string;
  userId?: string;
  isBusinessOwner?: boolean;
  className?: string;
}

export function RealtimeNotifications({ 
  businessId, 
  userId, 
  isBusinessOwner = false, 
  className = '' 
}: RealtimeNotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadInitialNotifications();
  }, [businessId, userId, isBusinessOwner]);

  const loadInitialNotifications = () => {
    // Mock initial notifications
    const mockNotifications: NotificationItem[] = [
      {
        id: '1',
        type: 'qr_scan',
        title: 'New QR Scan',
        message: 'Sarah Johnson scanned Service Menu QR',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        isRead: false,
        priority: 'medium',
        data: { customerName: 'Sarah Johnson', pointsEarned: 50 }
      },
      {
        id: '2',
        type: 'chat_message',
        title: 'New Message',
        message: 'Customer is asking about booking availability',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        isRead: false,
        priority: 'high',
        actionLabel: 'Reply',
        actionCallback: () => console.log('Open chat')
      },
      {
        id: '3',
        type: 'milestone',
        title: 'Milestone Reached!',
        message: 'You\'ve reached 1000 total points!',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        isRead: true,
        priority: 'high',
        data: { milestone: '1000 points' }
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
  };

  const handleQRScanNotification = (event: any) => {
    const notification: NotificationItem = {
      id: `qr_${Date.now()}`,
      type: 'qr_scan',
      title: 'New QR Scan',
      message: `${event.payload.customerName} scanned ${event.payload.qrType} (+${event.payload.pointsEarned} pts)`,
      timestamp: event.timestamp,
      isRead: false,
      priority: 'medium',
      data: event.payload
    };

    addNotification(notification);
    
    // Show toast for business owners
    if (isBusinessOwner) {
      toast.success(`${event.payload.customerName} earned ${event.payload.pointsEarned} points!`, {
        icon: '🎯'
      });
    }
  };

  const handleChatNotification = (event: any) => {
    const isFromCustomer = event.payload.isCustomer && isBusinessOwner;
    const isFromBusiness = !event.payload.isCustomer && !isBusinessOwner;
    
    if (isFromCustomer || isFromBusiness) {
      const notification: NotificationItem = {
        id: `chat_${event.payload.id}`,
        type: 'chat_message',
        title: 'New Message',
        message: `${isFromCustomer ? event.payload.customerName : event.payload.businessName}: ${event.payload.message}`,
        timestamp: event.timestamp,
        isRead: false,
        priority: 'high',
        data: event.payload,
        actionLabel: 'Reply',
        actionCallback: () => {
          // Open chat interface
          console.log('Open chat with', event.payload.from);
        }
      };

      addNotification(notification);
    }
  };

  const handleRewardNotification = (event: any) => {
    const notification: NotificationItem = {
      id: `reward_${Date.now()}`,
      type: 'reward_earned',
      title: 'Reward Earned!',
      message: `You earned: ${event.payload.rewardName}`,
      timestamp: event.timestamp,
      isRead: false,
      priority: 'high',
      data: event.payload
    };

    addNotification(notification);
    
    toast.success(`You earned a reward: ${event.payload.rewardName}!`, {
      icon: '🎁'
    });
  };

  const handleChallengeNotification = (event: any) => {
    const notification: NotificationItem = {
      id: `challenge_${Date.now()}`,
      type: 'milestone',
      title: 'Challenge Update',
      message: event.payload.message,
      timestamp: event.timestamp,
      isRead: false,
      priority: 'medium',
      data: event.payload
    };

    addNotification(notification);
  };

  const handleMetricsNotification = (event: any) => {
    // Notify about significant metrics changes
    if (event.payload.totalScansToday && event.payload.totalScansToday % 10 === 0) {
      const notification: NotificationItem = {
        id: `metrics_${Date.now()}`,
        type: 'milestone',
        title: 'Daily Milestone',
        message: `${event.payload.totalScansToday} QR scans today!`,
        timestamp: event.timestamp,
        isRead: false,
        priority: 'medium',
        data: event.payload
      };

      addNotification(notification);
    }
  };

  const addNotification = (notification: NotificationItem) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep max 50 notifications
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'qr_scan':
        return <QrCode className="w-4 h-4" />;
      case 'chat_message':
        return <MessageCircle className="w-4 h-4" />;
      case 'reward_earned':
        return <Gift className="w-4 h-4" />;
      case 'leaderboard_change':
        return <Trophy className="w-4 h-4" />;
      case 'new_customer':
        return <Users className="w-4 h-4" />;
      case 'milestone':
        return <Star className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: NotificationItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50/50 dark:bg-red-900/20';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/20';
      default:
        return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </Button>

      {/* Notifications panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 w-80 z-50"
          >
            <Card className="shadow-xl border bg-background/95 backdrop-blur-sm">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <h3 className="font-medium">Notifications</h3>
                  {unreadCount > 0 && (
                    <Badge variant="destructive">{unreadCount}</Badge>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs h-7"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-7 w-7 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Notifications list */}
              <ScrollArea className="max-h-96">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div>No notifications yet</div>
                    <div className="text-sm">You'll see real-time updates here</div>
                  </div>
                ) : (
                  <div className="divide-y group">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`p-4 hover:bg-muted/50 transition-colors border-l-4 ${
                          getPriorityColor(notification.priority)
                        } ${!notification.isRead ? 'font-medium' : 'opacity-70'}`}
                        onClick={() => !notification.isRead && markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            notification.priority === 'high' 
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/30' 
                              : notification.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30'
                              : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                          }`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium truncate">
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-1">
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notification.id);
                                  }}
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(notification.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              
                              {notification.actionLabel && notification.actionCallback && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    notification.actionCallback?.();
                                  }}
                                  className="h-6 text-xs"
                                >
                                  {notification.actionLabel}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t text-center">
                  <Button variant="ghost" size="sm" className="text-xs">
                    View all notifications
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
