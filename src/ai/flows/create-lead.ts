'use server';

/**
 * @fileOverview This file defines a Genkit flow for creating a new lead.
 *
 * It includes functions to:
 * - createLead: Creates a new lead from the entry form submission.
 * - CreateLeadInput: The input type for the createLead function.
 * - CreateLeadOutput: The return type for the createLead function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateLeadInputSchema = z.object({
  campaignId: z.string().describe('The ID of the campaign.'),
  name: z.string().describe('The name of the lead.'),
  email: z.string().email().describe('The email address of the lead.'),
  phone: z.string().describe('The phone number of the lead.'),
  treatmentInterest: z.string().describe('The treatment the lead is interested in.'),
  whatsappOptIn: z.boolean().describe('Whether the lead opted in to WhatsApp messages.'),
});

export type CreateLeadInput = z.infer<typeof CreateLeadInputSchema>;

const CreateLeadOutputSchema = z.object({
  leadId: z.string().describe('The ID of the newly created lead.'),
  status: z.string().describe('The status of the lead creation process.'),
});

export type CreateLeadOutput = z.infer<typeof CreateLeadOutputSchema>;

export async function createLead(
  input: CreateLeadInput
): Promise<CreateLeadOutput> {
  return createLeadFlow(input);
}

// This is a placeholder flow. In a real application, you would use a tool
// to save the lead to a database (e.g., Firestore).
const createLeadFlow = ai.defineFlow(
  {
    name: 'createLeadFlow',
    inputSchema: CreateLeadInputSchema,
    outputSchema: CreateLeadOutputSchema,
  },
  async input => {
    console.log('Creating lead with input:', input);
    // Simulate saving to a database and getting a new ID.
    const newLeadId = `lead_${Math.random().toString(36).substring(2, 9)}`;
    
    // In a real app, you would have a tool like this:
    // const { leadId } = await saveLeadToDatabaseTool(input);

    return {
      leadId: newLeadId,
      status: 'success',
    };
  }
);
