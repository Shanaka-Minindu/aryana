import { auth } from "@/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  singleImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const session = await auth();
      if (!session || !(session.user.role === "ADMIN"))
        throw new Error("Unauthorized");
      // Auth logic here
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Single file URL:", file.ufsUrl);
    }),

  // Scenario 2: Multiple images (e.g., Product Gallery)
  multiImageUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 8 } })
.middleware(async () => {
    const session = await auth();
    if (session?.user.role !== "ADMIN") throw new Error("Unauthorized");
    return { userId: session.user.id };
  })
  .onUploadComplete(async ({ metadata, file }) => {
    // This confirms the server-side part finished
    console.log("Upload complete for userId:", metadata.userId);
    console.log("File URL:", file.url);
    }),
} satisfies FileRouter;



export type OurFileRouter = typeof ourFileRouter;
