import { createRouteHandler } from "uploadthing/next";
import { fileRouter } from "./core";

export const runtime = "nodejs";

const uploadthingSecret = process.env.UPLOADTHING_SECRET;
const uploadthingAppId = process.env.UPLOADTHING_APP_ID ?? process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID;

if (!uploadthingSecret || !uploadthingAppId) {
  console.error("Uploadthing env missing: set UPLOADTHING_SECRET and UPLOADTHING_APP_ID.");
}

export const { GET, POST } = createRouteHandler({
  router: fileRouter,
  config: {
    uploadthingSecret: uploadthingSecret ?? "",
    uploadthingId: uploadthingAppId ?? "",
  },
});
