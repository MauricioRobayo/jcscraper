import { z } from "zod";

export const quoteSchema = z.object({
  rawText: z.string(),
  text: z.string(),
  clickToTweetId: z.string(),
  source: z.string(),
});
export const quotesSchema = z.array(quoteSchema);
export type Quote = z.infer<typeof quoteSchema>;
export type Quotes = z.infer<typeof quotesSchema>;
