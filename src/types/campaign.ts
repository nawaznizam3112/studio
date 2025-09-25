
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
  createdAt: Date | string;
  updatedAt: Date | string;
  expiresAt?: Date | string;
  endDate?: Date | string;
  entries?: CampaignEntry[];
  associatedService?: string;
}

export interface CreateCampaignData {
    title: string;
    description: string;
    prize: string;
    associatedService: string;
    prizeImageUrl?: string;
}
