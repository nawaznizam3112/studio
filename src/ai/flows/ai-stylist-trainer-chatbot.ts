
'use server';
/**
 * @fileOverview A chatbot AI agent that answers questions about style or fitness routines.
 *
 * - aiStylistTrainerChatbot - A function that handles the chatbot process.
 * - AiStylistTrainerChatbotInput - The input type for the aiStylistTrainerChatbot function.
 * - AiStylistTrainerChatbotOutput - The return type for the aiStylistTrainerChatbot function.
 */

import {ai} from '@/ai/genkit';
import { getServiceHistory } from '@/app/actions';
import {z} from 'genkit';

const AiStylistTrainerChatbotInputSchema = z.object({
  query: z.string().describe('The user query about style, fitness, or their service history.'),
  userId: z.string().describe('The user ID.'),
});
export type AiStylistTrainerChatbotInput = z.infer<typeof AiStylistTrainerChatbotInputSchema>;

const AiStylistTrainerChatbotOutputSchema = z.object({
  response: z.string().describe('The response from the chatbot.'),
});
export type AiStylistTrainerChatbotOutput = z.infer<typeof AiStylistTrainerChatbotOutputSchema>;

// AI Tool to get service history
const serviceHistoryTool = ai.defineTool(
    {
        name: 'getServiceHistory',
        description: "Get the service history for a given user to provide personalized recommendations or answer questions about their past services.",
        inputSchema: z.object({ userId: z.string() }),
        outputSchema: z.object({ history: z.array(z.object({
            service: z.string(),
            date: z.string(),
            businessName: z.string()
        })) }),
    },
    async (input) => getServiceHistory(input.userId)
);

export async function aiStylistTrainerChatbot(input: AiStylistTrainerChatbotInput): Promise<AiStylistTrainerChatbotOutput> {
  return aiStylistTrainerChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiStylistTrainerChatbotPrompt',
  input: {schema: AiStylistTrainerChatbotInputSchema},
  output: {schema: AiStylistTrainerChatbotOutputSchema},
  tools: [serviceHistoryTool],
  prompt: `You are a helpful AI chatbot that answers questions about style, fitness routines, or a user's service history.
  If the user asks for recommendations or what they should do next, use their service history to provide personalized advice.
  If the user asks for their history, retrieve it using the tool and format it nicely in the response.
  Respond to the following user query:
  {{query}}`,
});

const aiStylistTrainerChatbotFlow = ai.defineFlow(
  {
    name: 'aiStylistTrainerChatbotFlow',
    inputSchema: AiStylistTrainerChatbotInputSchema,
    outputSchema: AiStylistTrainerChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
