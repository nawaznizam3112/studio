
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { getBusinessCustomerHistory } from '@/app/actions';
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
  QrCode, 
  MessageCircle, 
  Star, 
  TrendingUp, 
  Users,
  Gift,
  Crown,
  Zap,
  Clock,
  ChevronDown,
  Filter,
  RefreshCcw
} from 'lucide-react';

interface ActivityEvent {
  id: string;
  activityType: string;
  service: string;
  createdAt: string;
  userName?: string;
  userId?: string;
  data?: any;
  priority: 'low' | 'medium' | 'high';
  isRedemption?: boolean;
}

interface RealtimeActivityStreamProps {
  businessId: string;
  className?: string;
}

const filterOptions = [
    { value: 'all', label: 'All Activity', icon: Filter },
    { value: 'Check-in', label: 'Check-ins', icon: QrCode },
    { value: 'Feedback', label: 'Feedback', icon: MessageCircle },
    { value: 'Booking', label: 'Bookings', icon: Gift },
];

export function RealtimeActivityStream({ businessId, className = '' }: RealtimeActivityStreamProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadInitialActivities();
    
    const refreshInterval = setInterval(() => {
      if (autoRefresh) {
        loadInitialActivities();
      }
    }, 30000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [businessId, autoRefresh]);

  const loadInitialActivities = async () => {
    setIsLoading(true);
    const { history, error } = await getBusinessCustomerHistory(businessId);
    if (error) {
        console.error(error);
    } else {
        const formattedActivities = history.map((item: any) => ({
            id: item.id,
            activityType: item.activityType,
            service: item.service,
            createdAt: item.createdAt,
            userName: item.userName,
            userId: item.userId,
            priority: item.activityType === 'Feedback' ? 'high' : 'medium',
            isRedemption: item.isRedemption,
            description: item.activityType === 'Feedback' ? `"${item.comment}"` : item.service,
            title: item.activityType
        })) as ActivityEvent[];
        setActivities(formattedActivities);
    }
    setIsLoading(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Check-in':
        return <QrCode className="w-4 h-4" />;
      case 'Feedback':
        return <MessageCircle className="w-4 h-4" />;
      case 'Booking':
        return <Gift className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getActivityColor = (priority: ActivityEvent['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.activityType === filter;
  });

  const getTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const time = new Date(timestamp).getTime();
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };
  
  const currentFilterLabel = filterOptions.find(opt => opt.value === filter)?.label || 'All Activity';


  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold">Live Activity Stream</h3>
            <Badge variant="secondary">
              {activities.length}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <span className="mr-2">{currentFilterLabel}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={filter} onValueChange={setFilter}>
                  {filterOptions.map(option => {
                    const Icon = option.icon;
                    return (
                        <DropdownMenuRadioItem key={option.value} value={option.value} className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{option.label}</span>
                        </DropdownMenuRadioItem>
                    )
                  })}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`h-8 ${autoRefresh ? 'bg-green-100 text-green-700' : 'text-muted-foreground'}`}
            >
              <RefreshCcw className={`w-3 h-3 ${autoRefresh ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Activity list */}
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
                  <div className="w-8 h-8 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Activity will appear here as customers interact with your business</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {filteredActivities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`flex items-start space-x-3 p-3 rounded-lg border ${getActivityColor(activity.priority)}`}
                  >
                    <div className="p-1.5 rounded-full bg-background border">
                      {getActivityIcon(activity.activityType)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium truncate">{activity.title}</h4>
                        <span className="text-xs text-muted-foreground">{getTimeAgo(activity.createdAt)}</span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.service}
                      </p>
                      
                      {activity.userName && (
                        <div className="flex items-center space-x-1 mt-2">
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="text-xs">
                              {activity.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{activity.userName}</span>
                        </div>
                      )}
                    </div>
                    
                    {activity.priority === 'high' && (
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span>Live updates</span>
            </div>
            {autoRefresh && <span>• Auto-refresh enabled</span>}
          </div>
          
          <div className="flex items-center space-x-2">
            <span>Showing {filteredActivities.length} events</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadInitialActivities}
              className="h-6 px-2 text-xs"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

    
