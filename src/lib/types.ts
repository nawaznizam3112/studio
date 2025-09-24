export type Campaign = {
  id: string;
  name: string;
  service: string;
  startDate: string;
  endDate: string;
  entries: number;
  status: 'active' | 'ended' | 'upcoming';
  image: string;
  imageHint: string;
  services?: string[];
};

export type Patient = {
  id: string;
  name: string;
  lastVisit: string;
  lastService: string;
};

export type Winner = {
  id: string;
  name: string;
  campaignName: string;
  winDate: string;
  avatar: string;
  avatarHint: string;
};

export type EngagementData = {
  date: string;
  entries: number;
};
