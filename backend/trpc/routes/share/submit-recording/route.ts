import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { shareLinks } from "../create-link/route";

export const submitRecordingProcedure = publicProcedure
  .input(z.object({
    linkId: z.string(),
    transcription: z.string(),
  }))
  .mutation(async ({ input }: { input: { linkId: string; transcription: string; } }) => {
    const shareLink = shareLinks.get(input.linkId);
    
    if (!shareLink) {
      throw new Error('Share link not found');
    }
    
    if (shareLink.expiresAt < Date.now()) {
      throw new Error('Share link has expired');
    }
    
    if (shareLink.status === 'completed') {
      throw new Error('Recording already submitted');
    }
    
    // Update the share link with the transcription
    shareLink.transcription = input.transcription;
    shareLink.status = 'completed';
    shareLinks.set(input.linkId, shareLink);
    
    return {
      success: true,
      message: 'Recording submitted successfully',
    };
  });