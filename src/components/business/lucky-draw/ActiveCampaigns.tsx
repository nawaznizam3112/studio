
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Sparkles } from 'lucide-react';
import { Campaign, CampaignEntry } from '../../../types/campaign';
import { CampaignCard } from './CampaignCard';
import { EnterDrawDialog } from './EnterDrawDialog';
import { toast } from 'sonner';
import { useSession } from '@/hooks/use-session.tsx';


interface ActiveCampaignsProps {
  campaigns: Campaign[];
  businessName: string;
  onEnterDraw?: (campaignId: string, customerData: { name: string; phone: string; email?: string }) => void;
}

export function ActiveCampaigns({ campaigns, businessName, onEnterDraw }: ActiveCampaignsProps) {
  const { session } = useSession();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showEnterDialog, setShowEnterDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeCampaigns = campaigns.filter(c => 
    c.status === 'active' && 
    (!c.endDate || new Date() <= new Date(c.endDate))
  );

  const handleEnterDrawClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowEnterDialog(true);
  };

  const handleConfirmEntry = (customerData: { name: string; phone: string; email?: string }) => {
    if (!selectedCampaign) return;

    setIsSubmitting(true);
    // Call the onEnterDraw callback if provided
    onEnterDraw?.(selectedCampaign.id, customerData);

    // This part is now handled by the parent component's toast
    // toast.success(`Successfully entered the draw for ${selectedCampaign.prize}!`, {
    //   description: `We'll notify ${businessName} about your interest in ${selectedCampaign.associatedService}.`,
    //   duration: 5000,
    // });
    
    setIsSubmitting(false);
    setShowEnterDialog(false);
    setSelectedCampaign(null);
  };

  const handleCloseDialog = () => {
    setShowEnterDialog(false);
    setSelectedCampaign(null);
  };
  
  const initialUserData = {
      name: session?.name || '',
      phone: '', // Phone is not stored in session, so user must enter it.
      email: '', // Email is not stored in session
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-2">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Lucky Draw Campaigns
          </CardTitle>
          <p className="text-muted-foreground">
            Enter exciting draws and win amazing prizes from {businessName}
          </p>
        </CardHeader>
      </Card>

      {activeCampaigns.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Gift className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium">No Active Campaigns</h3>
              <p className="text-muted-foreground">
                There are no lucky draw campaigns available at the moment. Check back soon!
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              businessName={businessName}
              onEnterDraw={handleEnterDrawClick}
            />
          ))}
        </div>
      )}

      {/* Entry Confirmation Dialog */}
      {selectedCampaign && (
        <EnterDrawDialog
          isOpen={showEnterDialog}
          onClose={handleCloseDialog}
          campaign={selectedCampaign}
          businessName={businessName}
          onConfirm={handleConfirmEntry}
          isSubmitting={isSubmitting}
          initialUserData={initialUserData}
        />
      )}
    </div>
  );
}
