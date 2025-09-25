
'use client';

import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Send, Calendar, Users } from 'lucide-react';
import { Campaign } from '../../../types/campaign';
import { ImageWithFallback } from '../../figma/ImageWithFallback';

interface CampaignCardProps {
  campaign: Campaign;
  businessName: string;
  onEnterDraw: (campaign: Campaign) => void;
  showEntryCount?: boolean;
}

export function CampaignCard({ campaign, businessName, onEnterDraw, showEntryCount = false }: CampaignCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const isActive = campaign.status === 'active';
  const hasEnded = campaign.expiresAt && new Date() > new Date(campaign.expiresAt);

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <div className="relative">
        {campaign.prizeImageUrl ? (
          <div className="aspect-video overflow-hidden">
            <ImageWithFallback
              src={campaign.prizeImageUrl}
              alt={`${campaign.prize} prize`}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Send className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-muted-foreground">Prize Image</p>
            </div>
          </div>
        )}
        
        {!isActive && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white px-4 py-2 rounded-full">
              <p className="text-sm font-medium">
                {hasEnded ? 'Campaign Ended' : 'Campaign Paused'}
              </p>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight">{campaign.title}</h3>
          <p className="text-sm text-muted-foreground">From {businessName}</p>
        </div>

        <Badge 
          variant="secondary" 
          className="bg-gradient-to-r from-purple-600 to-blue-500 text-white border-0"
        >
          Prize: {campaign.prize}
        </Badge>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {campaign.description}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {campaign.expiresAt && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Ends {formatDate(new Date(campaign.expiresAt))}</span>
            </div>
          )}
          {showEntryCount && (
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{(campaign.entries || []).length} entries</span>
            </div>
          )}
        </div>

        <Button
          onClick={() => onEnterDraw(campaign)}
          disabled={!isActive || hasEnded}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all duration-200"
          size="lg"
        >
          <Send className="w-4 h-4 mr-2" />
          {hasEnded ? 'Campaign Ended' : !isActive ? 'Campaign Paused' : 'Enter Draw'}
        </Button>
      </CardContent>
    </Card>
  );
}
