'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  Loader2, 
  Users, 
  Activity,
  Zap,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

type Status = 'connected' | 'connecting' | 'disconnected';

// Mock implementation of useRealtimeStatus
const useRealtimeStatus = (): Status => {
  const [status, setStatus] = useState<Status>('connected');
  
  useEffect(() => {
    // Simulate status changes for demo
    const t1 = setTimeout(() => setStatus('connected'), 2000);
    const t2 = setTimeout(() => setStatus('connecting'), 10000);
    const t3 = setTimeout(() => setStatus('disconnected'), 13000);
    const t4 = setTimeout(() => setStatus('connected'), 17000);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);
  
  return status;
};

// Mock realtimeService
const realtimeService = {
  getActiveChannels: () => ['business-main', 'leaderboard-weekly', 'user-notifications'],
  isConnected: () => true
};


interface RealtimeStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function RealtimeStatus({ className = '', showDetails = false }: RealtimeStatusProps) {
  const status = useRealtimeStatus();
  const [activeChannels, setActiveChannels] = useState<string[]>([]);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveChannels(realtimeService.getActiveChannels());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className="w-3 h-3" />;
      case 'connecting':
        return <Loader2 className="w-3 h-3 animate-spin" />;
      default:
        return <WifiOff className="w-3 h-3" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      default:
        return 'bg-red-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Live';
      case 'connecting':
        return 'Connecting...';
      default:
        return 'Offline';
    }
  };

  if (!showDetails) {
    return (
      <Badge 
        className={`${getStatusColor()} text-white ${className}`}
        onClick={() => setShowDetailedView(true)}
      >
        {getStatusIcon()}
        <span className="ml-1">{getStatusText()}</span>
      </Badge>
    );
  }

  return (
    <>
      {/* Simple status indicator */}
      <div className={`relative flex items-center space-x-2 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 h-8"
        >
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          <span className="text-sm">{getStatusText()}</span>
          {isExpanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </Button>

        {/* Expanded status panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 mt-2 z-50"
            >
              <Card className="p-4 bg-background/95 backdrop-blur-sm border shadow-lg w-64">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span className="font-medium">Real-time Status</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {/* Connection status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Connection</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon()}
                      <span className="text-sm font-medium">{getStatusText()}</span>
                    </div>
                  </div>

                  {/* Active channels */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Channels</span>
                    <Badge variant="secondary">
                      {activeChannels.length}
                    </Badge>
                  </div>

                  {/* Channel list */}
                  {activeChannels.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Active:</span>
                      {activeChannels.slice(0, 3).map((channel, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          <span className="text-xs font-mono">{channel}</span>
                        </div>
                      ))}
                      {activeChannels.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{activeChannels.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Connection actions */}
                  <div className="flex space-x-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="flex-1 h-7 text-xs"
                    >
                      Refresh
                    </Button>
                    {status !== 'connected' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          // Trigger reconnection logic
                          console.log('Manual reconnection requested');
                        }}
                        className="flex-1 h-7 text-xs"
                      >
                        Reconnect
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detailed status modal */}
      <AnimatePresence>
        {showDetailedView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailedView(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Real-time Connection</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailedView(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Status overview */}
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
                  <div>
                    <div className="font-medium">{getStatusText()}</div>
                    <div className="text-sm text-muted-foreground">
                      {status === 'connected' 
                        ? 'All real-time features are working'
                        : status === 'connecting'
                        ? 'Establishing connection...'
                        : 'Real-time features unavailable'
                      }
                    </div>
                  </div>
                </div>

                {/* Features status */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Features</span>
                  </h4>
                  
                  <div className="space-y-2">
                    {[
                      'Live QR scan notifications',
                      'Real-time chat messages',
                      'Live leaderboards',
                      'Business analytics updates'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{feature}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          status === 'connected' ? 'bg-green-400' : 'bg-gray-400'
                        }`} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active channels */}
                {activeChannels.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Active Channels ({activeChannels.length})</span>
                    </h4>
                    
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {activeChannels.map((channel, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          <span className="font-mono text-xs">{channel}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailedView(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  {status !== 'connected' && (
                    <Button
                      onClick={() => {
                        window.location.reload();
                      }}
                      className="flex-1"
                    >
                      Reconnect
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Hook for easy status checking in components
export function useConnectionStatus() {
  const status = useRealtimeStatus();
  
  return {
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    isOffline: status === 'disconnected',
    status
  };
}
