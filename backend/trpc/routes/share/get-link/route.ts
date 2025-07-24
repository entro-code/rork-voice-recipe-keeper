import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { shareLinks } from "../create-link/route";

export const getShareLinkProcedure = publicProcedure
  .input(z.object({
    linkId: z.string(),
  }))
  .query(async ({ input }: { input: { linkId: string; } }) => {
    const shareLink = shareLinks.get(input.linkId);
    
    if (!shareLink) {
      throw new Error('Share link not found');
    }
    
    if (shareLink.expiresAt < Date.now()) {
      throw new Error('Share link has expired');
    }
    
    return shareLink;
  });