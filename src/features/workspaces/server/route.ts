import { zValidator } from "@hono/zod-validator";
import { createWorkSpaceSchema } from "../schemas";
import { Hono } from "hono";
import { DATABASE_ID, WORKSPACES_ID } from "@/config";
import { ID } from "node-appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";

const app = new Hono().post(
  "/",
  zValidator("json", createWorkSpaceSchema),
  sessionMiddleware,
  async (c) => {
    const databases = c.get("database");
    const user = c.get("user");

    const { name } = c.req.valid("json");

    const workspace = await databases.createDocument(
      DATABASE_ID,
      WORKSPACES_ID,
      ID.unique(),
      {
        name,
        userId: user.$id,
      }
    );

    return c.json({
      data: workspace,
    });
  }
);

export default app;
