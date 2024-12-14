import { zValidator } from "@hono/zod-validator";
import { createWorkSpaceSchema } from "../schemas";
import { Hono } from "hono";
import { DATABASE_ID, IMAGES_BUCKET_ID, WORKSPACES_ID } from "@/config";
import { ID } from "node-appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";

const app = new Hono().post(
  "/",
  zValidator("json", createWorkSpaceSchema),
  sessionMiddleware,
  async (c) => {
    const databases = c.get("database");
    const storage = c.get("storage");
    const user = c.get("user");

    const { name, image } = c.req.valid("json");

    let uploadedImageUrl: string | undefined;

    if (image instanceof File) {
      const file = await storage.createFile(
        IMAGES_BUCKET_ID,
        ID.unique(),
        image
      );

      const arrayBuffer = await storage.getFilePreview(
        IMAGES_BUCKET_ID,
        file.$id
      );

      uploadedImageUrl = `data:image/png;base64,${Buffer.from(
        arrayBuffer
      ).toString("base64")}`;
    }

    const workspace = await databases.createDocument(
      DATABASE_ID,
      WORKSPACES_ID,
      ID.unique(),
      {
        name,
        userId: user.$id,
        imageUrl: uploadedImageUrl,
      }
    );

    return c.json({
      data: workspace,
    });
  }
);

export default app;
