
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Gift } from 'lucide-react';
import { Campaign } from '@/types/campaign';
import Image from 'next/image';

interface CampaignCardProps {
  campaign: Campaign;
  businessName: string;
  onEnterDraw: (campaign: Campaign) => void;
  showEntryCount?: boolean;
}

export function CampaignCard({ campaign, businessName, onEnterDraw, showEntryCount = false }: CampaignCardProps) {
  const { title, description, prize, prizeImageUrl, entries, status, createdAt } = campaign;
  const createdDate = new Date(createdAt);

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
      {prizeImageUrl ? (
        <div className="relative w-full h-40">
          <Image
            src={prizeImageUrl}
            alt={prize}
            fill
            className="object-cover"
            data-ai-hint="reward prize"
          />
          {status === 'active' ? (
            <Badge className="absolute top-2 left-2 bg-green-500 text-white">Active</Badge>
          ) : (
            <Badge variant="secondary" className="absolute top-2 left-2">Completed</Badge>
          )}
        </div>
      ) : (
        <div className="h-40 bg-gradient-to-r from-purple-50 to-blue-50 flex items-center justify-center">
            <Gift className="w-16 h-16 text-purple-200" />
        </div>
      )}
      
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold truncate">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
        
        <div className="flex-grow" />

        <div className="space-y-3 mt-4">
            <div className="flex items-center text-sm">
                <Gift className="w-4 h-4 mr-2 text-purple-600" />
                <span className="font-medium">Prize:</span>
                <span className="ml-1 text-muted-foreground">{prize}</span>
            </div>
            {showEntryCount && (
                <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="font-medium">Entries:</span>
                    <span className="ml-1 text-muted-foreground">{entries.length}</span>
                </div>
            )}
            <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium">Started:</span>
                <span className="ml-1 text-muted-foreground">{createdDate.toLocaleDateString()}</span>
            </div>
        </div>

        <Button onClick={() => onEnterDraw(campaign)} className="w-full mt-4">
            View Details
        </Button>
      </CardContent>
    </Card>
  );
}
