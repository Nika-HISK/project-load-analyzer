import { Tool } from "@mastra/core/tools";
import { z } from "zod";
import { gh } from "../lib/utils";

export const getRepoSize = new Tool({
  id: "getRepoSize",
  description: "Fetch the GitHub repo's size in MB",
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
  }),
  outputSchema: z.object({
    repoSizeMB: z.number(),
  }),
  execute: async ({ context }) => {
    const { owner, repo } = context;
    const res = await gh.rest.repos.get({ owner, repo });
    return { repoSizeMB: Math.round((res.data.size / 1024) * 100) / 100 };
  },
});
