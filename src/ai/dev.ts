import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-patient-follow-ups.ts';
import '@/ai/flows/generate-marketing-materials.ts';
import '@/ai/flows/create-lead.ts';
