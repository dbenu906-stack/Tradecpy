'use server';
/**
 * @fileOverview An AI agent that suggests an optimal risk-managed lot multiplier for a follower account.
 *
 * - suggestOptimalLotMultiplier - A function that handles the lot multiplier suggestion process.
 * - SuggestOptimalLotMultiplierInput - The input type for the suggestOptimalLotMultiplier function.
 * - SuggestOptimalLotMultiplierOutput - The return type for the suggestOptimalLotMultiplier function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalLotMultiplierInputSchema = z.object({
  followerHistoricalBalance: z
    .array(z.number())
    .describe('An array of historical balance data points for the follower account.'),
  masterVolatilityMetrics: z
    .object({
      dailyPercentageChange: z
        .array(z.number())
        .describe('An array of daily percentage changes for the master account.'),
      maxDrawdown: z.number().describe('The maximum drawdown observed on the master account.'),
      averageDailyRange: z.number().describe('The average daily range of price movement on the master account.'),
    })
    .describe('Key volatility metrics for the master account.'),
});
export type SuggestOptimalLotMultiplierInput = z.infer<
  typeof SuggestOptimalLotMultiplierInputSchema
>;

const SuggestOptimalLotMultiplierOutputSchema = z.object({
  optimalLotMultiplier: z
    .number()
    .describe('The suggested optimal risk-managed lot multiplier.'),
  reasoning: z.string().describe('The reasoning behind the suggested lot multiplier.'),
});
export type SuggestOptimalLotMultiplierOutput = z.infer<
  typeof SuggestOptimalLotMultiplierOutputSchema
>;

export async function suggestOptimalLotMultiplier(
  input: SuggestOptimalLotMultiplierInput
): Promise<SuggestOptimalLotMultiplierOutput> {
  return suggestOptimalLotMultiplierFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalLotMultiplierPrompt',
  input: {schema: SuggestOptimalLotMultiplierInputSchema},
  output: {schema: SuggestOptimalLotMultiplierOutputSchema},
  prompt: `You are an expert financial risk analyst specializing in copy trading.
Your goal is to suggest an optimal risk-managed lot multiplier for a follower account based on its historical balance and the master account's volatility.

Consider the follower's historical balance data to understand their account growth and stability.
Consider the master account's volatility metrics to gauge its risk profile. A higher volatility might suggest a more conservative multiplier.

Calculate a lot multiplier that balances potential returns with risk management for the follower.

Follower Historical Balance (chronological order): {{{JSON.stringify(followerHistoricalBalance)}}}
Master Account Volatility Metrics: {{{JSON.stringify(masterVolatilityMetrics)}}}

Provide the optimal lot multiplier and a brief reasoning for your suggestion.`,
});

const suggestOptimalLotMultiplierFlow = ai.defineFlow(
  {
    name: 'suggestOptimalLotMultiplierFlow',
    inputSchema: SuggestOptimalLotMultiplierInputSchema,
    outputSchema: SuggestOptimalLotMultiplierOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
