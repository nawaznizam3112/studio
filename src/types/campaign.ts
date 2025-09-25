
export interface CampaignEntry {
    id: string;
    customerId: string;
    customerName: string;
    enteredAt: Date;
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
  entries: CampaignEntry[];
  associatedService?: string;
}
