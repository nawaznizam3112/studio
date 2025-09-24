import type { Campaign, Winner, EngagementData, Lead } from './types';
import { PlaceHolderImages } from './placeholder-images';

const campaignImage1 = PlaceHolderImages.find(img => img.id === 'campaign-card-1');
const campaignImage2 = PlaceHolderImages.find(img => img.id === 'campaign-card-2');
const campaignImage3 = PlaceHolderImages.find(img => img.id === 'campaign-card-3');

export const campaigns: Campaign[] = [
  {
    id: '1',
    name: 'Win a Free Laser Session',
    service: 'Dermatology',
    startDate: '2024-07-01',
    endDate: '2024-07-31',
    entries: 125,
    status: 'active',
    image: campaignImage1?.imageUrl || '',
    imageHint: campaignImage1?.imageHint || 'skincare',
    services: ['Laser Hair Removal', 'Acne Treatment', 'Skin Rejuvenation', 'Chemical Peel']
  },
  {
    id: '2',
    name: 'Physiotherapy Package Draw',
    service: 'Physiotherapy',
    startDate: '2024-06-15',
    endDate: '2024-07-15',
    entries: 88,
    status: 'active',
    image: campaignImage2?.imageUrl || '',
    imageHint: campaignImage2?.imageHint || 'physiotherapy',
    services: ['Back Pain Treatment', 'Sports Injury Rehab', 'Post-operative Care', 'Neck Pain Consultation']
  },
  {
    id: '3',
    name: 'Dental Check-up Raffle',
    service: 'Dentistry',
    startDate: '2024-05-01',
    endDate: '2024-05-31',
    entries: 210,
    status: 'ended',
    image: campaignImage3?.imageUrl || '',
    imageHint: campaignImage3?.imageHint || 'dental',
    services: ['Dental Cleaning', 'Tooth Pain / Extraction', 'Whitening', 'Orthodontics']
  },
];

const winnerAvatar1 = PlaceHolderImages.find(img => img.id === 'patient-avatar-1');
const winnerAvatar2 = PlaceHolderImages.find(img => img.id === 'patient-avatar-2');
const winnerAvatar3 = PlaceHolderImages.find(img => img.id === 'patient-avatar-3');
const winnerAvatar4 = PlaceHolderImages.find(img => img.id === 'patient-avatar-4');
const winnerAvatar5 = PlaceHolderImages.find(img => img.id === 'patient-avatar-5');


export const winners: Winner[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    campaignName: 'Dental Check-up Raffle',
    winDate: '2024-06-01',
    avatar: winnerAvatar1?.imageUrl || '',
    avatarHint: winnerAvatar1?.imageHint || 'woman'
  },
  {
    id: '2',
    name: 'Amit Singh',
    campaignName: 'Skin Rejuvenation Draw',
    winDate: '2024-05-15',
    avatar: winnerAvatar2?.imageUrl || '',
    avatarHint: winnerAvatar2?.imageHint || 'man'
  },
  {
    id: '3',
    name: 'Sunita Rao',
    campaignName: 'Wellness Package Giveaway',
    winDate: '2024-05-01',
    avatar: winnerAvatar3?.imageUrl || '',
    avatarHint: winnerAvatar3?.imageHint || 'person'
  },
    {
    id: '4',
    name: 'Rajesh Kumar',
    campaignName: 'Dental Check-up Raffle',
    winDate: '2024-04-15',
    avatar: winnerAvatar4?.imageUrl || '',
    avatarHint: winnerAvatar4?.imageHint || 'person smiling'
  },
  {
    id: '5',
    name: 'Meera Desai',
    campaignName: 'Fitness Challenge Prize',
    winDate: '2024-04-01',
    avatar: winnerAvatar5?.imageUrl || '',
    avatarHint: winnerAvatar5?.imageHint || 'woman smiling'
  },
];

export const engagementData: EngagementData[] = [
  { date: 'Mon', entries: 20, leads: 15 },
  { date: 'Tue', entries: 35, leads: 28 },
  { date: 'Wed', entries: 28, leads: 22 },
  { date: 'Thu', entries: 45, leads: 38 },
  { date: 'Fri', entries: 50, leads: 42 },
  { date: 'Sat', entries: 62, leads: 55 },
  { date: 'Sun', entries: 48, leads: 40 },
];

export const patientHistory = `
- Priya Sharma: Last visit 3 months ago for teeth cleaning.
- Rohan Mehta: Completed a 6-session physiotherapy course 2 months ago for back pain.
- Anjali Verma: Regular patient for acne treatment, last visit 4 weeks ago.
- Sameer Khan: Last visit 6 months ago for a general check-up.
- Nisha Gupta: Had a laser hair removal session 5 weeks ago.
`;

export const leads: Lead[] = [
    { id: '1', name: 'Alisha Rao', email: 'alisha@example.com', phone: '9876543210', treatmentInterest: 'Laser Hair Removal', campaignName: 'Win a Free Laser Session', date: '2024-07-22', status: 'new', avatar: winnerAvatar1?.imageUrl || '', avatarHint: winnerAvatar1?.imageHint || 'woman' },
    { id: '2', name: 'Karan Verma', email: 'karan@example.com', phone: '9876543211', treatmentInterest: 'Back Pain Treatment', campaignName: 'Physiotherapy Package Draw', date: '2024-07-21', status: 'new', avatar: winnerAvatar2?.imageUrl || '', avatarHint: winnerAvatar2?.imageHint || 'man' },
    { id: '3', name: 'Sneha Reddy', email: 'sneha@example.com', phone: '9876543212', treatmentInterest: 'Acne Treatment', campaignName: 'Win a Free Laser Session', date: '2024-07-20', status: 'qualified', avatar: winnerAvatar3?.imageUrl || '', avatarHint: winnerAvatar3?.imageHint || 'person' },
    { id: '4', name: 'Vikram Singh', email: 'vikram@example.com', phone: '9876543213', treatmentInterest: 'Whitening', campaignName: 'Dental Check-up Raffle', date: '2024-05-28', status: 'converted', avatar: winnerAvatar4?.imageUrl || '', avatarHint: winnerAvatar4?.imageHint || 'person smiling' },
    { id: '5', name: 'Pooja Desai', email: 'pooja@example.com', phone: '9876543214', treatmentInterest: 'Sports Injury Rehab', campaignName: 'Physiotherapy Package Draw', date: '2024-07-19', status: 'qualified', avatar: winnerAvatar5?.imageUrl || '', avatarHint: winnerAvatar5?.imageHint || 'woman smiling' },
    { id: '6', name: 'Arjun Mehta', email: 'arjun@example.com', phone: '9876543215', treatmentInterest: 'Dental Cleaning', campaignName: 'Dental Check-up Raffle', date: '2024-05-25', status: 'lost', avatar: 'https://picsum.photos/seed/6/400/400', avatarHint: 'man portrait' },
    { id: '7', name: 'Riya Kapoor', email: 'riya@example.com', phone: '9876543216', treatmentInterest: 'Skin Rejuvenation', campaignName: 'Win a Free Laser Session', date: '2024-07-18', status: 'new', avatar: 'https://picsum.photos/seed/7/400/400', avatarHint: 'woman portrait' },
]
