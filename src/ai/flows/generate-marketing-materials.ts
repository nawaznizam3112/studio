'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating marketing materials for clinic campaigns.
 *
 * It includes functions to:
 * - generateMarketingMaterials: Generates marketing materials based on campaign details.
 * - GenerateMarketingMaterialsInput: The input type for the generateMarketingMaterials function.
 * - GenerateMarketingMaterialsOutput: The return type for the generateMarketingMaterials function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMarketingMaterialsInputSchema = z.object({
  campaignName: z.string().describe('The name of the marketing campaign.'),
  serviceDescription: z.string().describe('A description of the service being offered in the campaign.'),
  targetAudience: z.string().describe('The target audience for the campaign.'),
  clinicName: z.string().describe('The name of the clinic running the campaign.'),
});

export type GenerateMarketingMaterialsInput = z.infer<
  typeof GenerateMarketingMaterialsInputSchema
>;

const GenerateMarketingMaterialsOutputSchema = z.object({
  posterText: z.string().describe('The text content for a marketing poster.'),
  whatsappCopy: z.string().describe('The text content for a WhatsApp campaign message.'),
  smsReminder: z.string().describe('The text content for an SMS reminder message.'),
});

export type GenerateMarketingMaterialsOutput = z.infer<
  typeof GenerateMarketingMaterialsOutputSchema
>;

export async function generateMarketingMaterials(
  input: GenerateMarketingMaterialsInput
): Promise<GenerateMarketingMaterialsOutput> {
  return generateMarketingMaterialsFlow(input);
}

const generateMarketingMaterialsPrompt = ai.definePrompt({
  name: 'generateMarketingMaterialsPrompt',
  input: {schema: GenerateMarketingMaterialsInputSchema},
  output: {schema: GenerateMarketingMaterialsOutputSchema},
  prompt: `You are a marketing expert helping clinics promote their services.

  Based on the following campaign details, generate marketing materials:

  Clinic Name: {{clinicName}}
  Campaign Name: {{campaignName}}
  Service Description: {{serviceDescription}}
  Target Audience: {{targetAudience}}

  Create:
  - posterText: Engaging text for a promotional poster.
  - whatsappCopy: A concise message for a WhatsApp campaign.
  - smsReminder: A short SMS reminder message.

  Ensure the marketing materials are appropriate for the target audience and highlight the benefits of the service.
  `,
});

const generateMarketingMaterialsFlow = ai.defineFlow(
  {
    name: 'generateMarketingMaterialsFlow',
    inputSchema: GenerateMarketingMaterialsInputSchema,
    outputSchema: GenerateMarketingMaterialsOutputSchema,
  },
  async input => {
    const {output} = await generateMarketingMaterialsPrompt(input);
    return output!;
  }
);
