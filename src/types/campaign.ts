
export interface CampaignEntry {
    id: string;
    campaignId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    enteredAt: Date;
    isWinner: boolean;
}

export interface Campaign {
  id: string;
  businessId: string;
  title: string;
  description: string;
  prize: string;
  prizeImageUrl?: string;
  status: 'active' | 'completed' | 'draft';
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  endDate?: Date;
  entries: CampaignEntry[];
  associatedService?: string;
}

export interface CreateCampaignData {
    title: string;
    description: string;
    prize: string;
    associatedService: string;
    prizeImageUrl?: string;
}

    