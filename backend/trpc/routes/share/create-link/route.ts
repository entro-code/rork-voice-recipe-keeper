import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { nanoid } from "nanoid";

// In-memory storage for demo purposes
// In production, use a database
const shareLinks = new Map<string, {
  id: string;
  userId: string;
  recipientName: string;
  recipientPhone: string;
  createdAt: number;
  expiresAt: number;
  status: 'pending' | 'completed';
  audioUrl?: string;
  transcription?: string;
}>();

export const createShareLinkProcedure = publicProcedure
  .input(z.object({
    recipientName: z.string(),
    recipientPhone: z.string(),
    userId: z.string(),
  }))
  .mutation(async ({ input }: { input: { recipientName: string; recipientPhone: string; userId: string; } }) => {
    const linkId = nanoid(10);
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    
    const shareLink = {
      id: linkId,
      userId: input.userId,
      recipientName: input.recipientName,
      recipientPhone: input.recipientPhone,
      createdAt: Date.now(),
      expiresAt,
      status: 'pending' as const,
    };
    
    shareLinks.set(linkId, shareLink);
    
    return {
      linkId,
      shareUrl: `${process.env.EXPO_PUBLIC_RORK_API_BASE_URL}/share/${linkId}`,
      expiresAt,
    };
  });

export { shareLinks };