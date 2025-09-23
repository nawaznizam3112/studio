'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting patients to follow up with.
 *
 * - suggestPatientFollowUps - A function that suggests patients to follow up with based on past services and available appointment slots.
 * - SuggestPatientFollowUpsInput - The input type for the suggestPatientFollowUps function.
 * - SuggestPatientFollowUpsOutput - The return type for the suggestPatientFollowUps function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPatientFollowUpsInputSchema = z.object({
  availableSlots: z.string().describe('A description of available appointment slots.'),
  patientHistory: z.string().describe('A summary of the patient history at the clinic.'),
});
export type SuggestPatientFollowUpsInput = z.infer<
  typeof SuggestPatientFollowUpsInputSchema
>;

const SuggestPatientFollowUpsOutputSchema = z.object({
  patientSuggestions: z
    .string()
    .describe(
      'A list of patient names and reasons why they should be contacted to fill available slots.'
    ),
});
export type SuggestPatientFollowUpsOutput = z.infer<
  typeof SuggestPatientFollowUpsOutputSchema
>;

export async function suggestPatientFollowUps(
  input: SuggestPatientFollowUpsInput
): Promise<SuggestPatientFollowUpsOutput> {
  return suggestPatientFollowUpsFlow(input);
}

const suggestPatientFollowUpsPrompt = ai.definePrompt({
  name: 'suggestPatientFollowUpsPrompt',
  input: {schema: SuggestPatientFollowUpsInputSchema},
  output: {schema: SuggestPatientFollowUpsOutputSchema},
  prompt: `You are an AI assistant helping clinic administrators efficiently manage appointments.

  Based on the available appointment slots and patient history, suggest which patients to follow up with to fill the open slots.

  Available Slots: {{{availableSlots}}}
  Patient History: {{{patientHistory}}}

  Provide a list of patient names and a brief reason for contacting them.
  Format your response as a list:
  - Patient Name: Reason for contact.
  `,
});

const suggestPatientFollowUpsFlow = ai.defineFlow(
  {
    name: 'suggestPatientFollowUpsFlow',
    inputSchema: SuggestPatientFollowUpsInputSchema,
    outputSchema: SuggestPatientFollowUpsOutputSchema,
  },
  async input => {
    const {output} = await suggestPatientFollowUpsPrompt(input);
    return output!;
  }
);
