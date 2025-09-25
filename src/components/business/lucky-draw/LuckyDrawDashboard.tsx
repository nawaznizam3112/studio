
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Gift, 
  Users, 
  TrendingUp, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  BarChart3,
  Crown
} from 'lucide-react';
import { Campaign, CreateCampaignData } from '@/types/campaign';
import { CreateCampaignForm } from './CreateCampaignForm';
import { CampaignCard } from './CampaignCard';
import { useToast } from '@/hooks/use-toast';
import { createCampaign } from '@/app/actions';

interface LuckyDrawDashboardProps {
  businessId: string;
  businessName: string;
  campaigns: Campaign[];
  onCreateCampaign?: (data: any) => void;
  onEditCampaign?: (campaign: Campaign) => void;
  onDeleteCampaign?: (campaignId: string) => void;
  onBack: () => void;
}

export function LuckyDrawDashboard({ 
  businessId, 
  businessName, 
  campaigns, 
  onCreateCampaign, 
  onEditCampaign, 
  onDeleteCampaign,
  onBack 
}: LuckyDrawDashboardProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);


  // Mock statistics
  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalEntries: campaigns.reduce((sum, c) => sum + (c.entries?.length || 0), 0),
    conversionRate: campaigns.length > 0 ? Math.round((campaigns.reduce((sum, c) => sum + (c.entries?.length || 0), 0) / campaigns.length) * 100) / 100 : 0
  };

  const handleCreateCampaign = async (data: CreateCampaignData) => {
    setIsCreating(true);
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('reward', data.prize);
    formData.append('associatedService', data.associatedService);
    if (data.prizeImageUrl) {
      formData.append('prizeImageUrl', data.prizeImageUrl);
    }
    formData.append('businessId', businessId);
    
    const result = await createCampaign(formData);
    
    if (result.success) {
        toast({ title: "Success", description: "Campaign created successfully!" });
        onCreateCampaign?.(data);
        setShowCreateForm(false);
    } else {
        toast({ title: "Error", description: result.error, variant: 'destructive' });
    }
    setIsCreating(false);
  };

  const handleEnterDraw = (campaign: Campaign) => {
    // This would typically open a modal or redirect to entry form
    // For demo purposes, we'll just show an alert
    alert(`Viewing details for: ${campaign.title}`);
  };

  if (showCreateForm) {
    return (
      <CreateCampaignForm
        onSubmit={handleCreateCampaign}
        onCancel={() => setShowCreateForm(false)}
        isLoading={isCreating}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={onBack}
                className="mb-2"
              >
                ← Back to Dashboard
              </Button>
              <h1 className="text-2xl font-semibold">Lucky Draw Campaigns</h1>
              <p className="text-muted-foreground">{businessName}</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Gift className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Campaigns</p>
                  <p className="text-2xl font-semibold">{stats.totalCampaigns}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Campaigns</p>
                  <p className="text-2xl font-semibold">{stats.activeCampaigns}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-semibold">{stats.totalEntries}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Entries/Campaign</p>
                  <p className="text-2xl font-semibold">{stats.conversionRate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="campaigns">All Campaigns</TabsTrigger>
            <TabsTrigger value="entries">Recent Entries</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            {campaigns.length === 0 ? (
              <Card className="p-12">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">No campaigns yet</h3>
                    <p className="text-muted-foreground">Create your first lucky draw campaign to engage customers.</p>
                  </div>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Campaign
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="relative group">
                    <CampaignCard
                      campaign={campaign}
                      businessName={businessName}
                      onEnterDraw={handleEnterDraw}
                      showEntryCount={true}
                    />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onEditCampaign?.(campaign)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDeleteCampaign?.(campaign.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="entries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="w-5 h-5" />
                  <span>Recent Entries</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {campaigns.some(c => (c.entries?.length || 0) > 0) ? (
                  <div className="space-y-4">
                    {campaigns
                      .flatMap(c => (c.entries || []).map(e => ({ ...e, campaignTitle: c.title, prize: c.prize })))
                      .sort((a, b) => new Date(b.enteredAt).getTime() - new Date(a.enteredAt).getTime())
                      .slice(0, 10)
                      .map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <p className="font-medium">{entry.customerName}</p>
                            <p className="text-sm text-muted-foreground">{entry.campaignTitle}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(entry.enteredAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary">{entry.prize}</Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No entries yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
