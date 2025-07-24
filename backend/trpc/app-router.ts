import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { createShareLinkProcedure } from "./routes/share/create-link/route";
import { getShareLinkProcedure } from "./routes/share/get-link/route";
import { submitRecordingProcedure } from "./routes/share/submit-recording/route";
import { getUserLinksProcedure } from "./routes/share/get-user-links/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  share: createTRPCRouter({
    createLink: createShareLinkProcedure,
    getLink: getShareLinkProcedure,
    submitRecording: submitRecordingProcedure,
    getUserLinks: getUserLinksProcedure,
  }),
});

export type AppRouter = typeof appRouter;