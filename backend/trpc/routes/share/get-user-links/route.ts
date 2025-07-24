import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { shareLinks } from "../create-link/route";

export const getUserLinksProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .query(async ({ input }: { input: { userId: string; } }) => {
    const userLinks = Array.from(shareLinks.values())
      .filter(link => link.userId === input.userId)
      .sort((a, b) => b.createdAt - a.createdAt);
    
    return userLinks;
  });