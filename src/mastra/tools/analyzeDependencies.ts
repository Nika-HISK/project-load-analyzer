import { Tool } from "@mastra/core/tools";
import { z } from "zod";

const heavyPackagesList: Record<string, { weight: number; category: string }> = {
    
  "tensorflow": { weight: 10, category: "AI/ML" },
  "@tensorflow/tfjs": { weight: 8, category: "AI/ML" },
  "torch": { weight: 10, category: "AI/ML" },
  "opencv": { weight: 9, category: "Computer Vision" },
  "mediapipe": { weight: 8, category: "Computer Vision" },
  

  "puppeteer": { weight: 8, category: "Browser Automation" },
  "playwright": { weight: 8, category: "Browser Automation" },
  "selenium-webdriver": { weight: 7, category: "Browser Automation" },
  

  "sharp": { weight: 7, category: "Image Processing" },
  "jimp": { weight: 5, category: "Image Processing" },
  "canvas": { weight: 6, category: "Image Processing" },
  "ffmpeg": { weight: 9, category: "Video Processing" },
  "node-ffmpeg": { weight: 9, category: "Video Processing" },
  

  "mysql2": { weight: 4, category: "Database" },
  "pg": { weight: 4, category: "Database" },
  "mongodb": { weight: 5, category: "Database" },
  "redis": { weight: 4, category: "Database" },
  "elasticsearch": { weight: 6, category: "Database" },
  

  "webpack": { weight: 5, category: "Build Tools" },
  "vite": { weight: 4, category: "Build Tools" },
  "rollup": { weight: 4, category: "Build Tools" },
  "parcel": { weight: 4, category: "Build Tools" },
  

  "next": { weight: 5, category: "Framework" },
  "nuxt": { weight: 5, category: "Framework" },
  "electron": { weight: 7, category: "Desktop" },
  

  "bcrypt": { weight: 4, category: "Crypto" },
  "crypto": { weight: 3, category: "Crypto" },
  "argon2": { weight: 4, category: "Crypto" },
  

  "pdf-parse": { weight: 4, category: "File Processing" },
  "xlsx": { weight: 4, category: "File Processing" },
  "archiver": { weight: 3, category: "File Processing" },
  

  "jest": { weight: 3, category: "Testing" },
  "cypress": { weight: 6, category: "Testing" },
  "@storybook/react": { weight: 5, category: "Testing" },
};

export const analyzeDependencies = new Tool({
  id: "analyzeDependencies",
  description: "Parses package.json and analyzes dependency heaviness with weights and categories",
  inputSchema: z.object({
    packageJson: z.string(),
  }),
  outputSchema: z.object({
    heavyPackages: z.array(z.string()),
    totalWeight: z.number(),
    categories: z.record(z.number()),
    riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    analysis: z.object({
      hasBrowserAutomation: z.boolean(),
      hasAI: z.boolean(),
      hasImageProcessing: z.boolean(),
      hasVideoProcessing: z.boolean(),
      hasDatabase: z.boolean(),
      totalDependencies: z.number(),
    }),
  }),
  execute: async ({ context }) => {
    const { packageJson } = context;
    try {
      const pkg = JSON.parse(packageJson);
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      const totalDependencies = Object.keys(allDeps || {}).length;
      
      let totalWeight = 0;
      const categories: Record<string, number> = {};
      const heavyPackages: string[] = [];
      
      Object.keys(allDeps || {}).forEach((pkgName) => {
        if (heavyPackagesList[pkgName]) {
          const { weight, category } = heavyPackagesList[pkgName];
          heavyPackages.push(pkgName);
          totalWeight += weight;
          categories[category] = (categories[category] || 0) + weight;
        }
      });
      
      let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      if (totalWeight <= 5) riskLevel = "LOW";
      else if (totalWeight <= 15) riskLevel = "MEDIUM";
      else if (totalWeight <= 30) riskLevel = "HIGH";
      else riskLevel = "CRITICAL";
      
      const analysis = {
        hasBrowserAutomation: heavyPackages.some(pkg => 
          ["puppeteer", "playwright", "selenium-webdriver"].includes(pkg)
        ),
        hasAI: heavyPackages.some(pkg => 
          ["tensorflow", "@tensorflow/tfjs", "torch", "opencv", "mediapipe"].includes(pkg)
        ),
        hasImageProcessing: heavyPackages.some(pkg => 
          ["sharp", "jimp", "canvas"].includes(pkg)
        ),
        hasVideoProcessing: heavyPackages.some(pkg => 
          ["ffmpeg", "node-ffmpeg"].includes(pkg)
        ),
        hasDatabase: heavyPackages.some(pkg => 
          ["mysql2", "pg", "mongodb", "redis", "elasticsearch"].includes(pkg)
        ),
        totalDependencies,
      };
      
      return { 
        heavyPackages, 
        totalWeight, 
        categories, 
        riskLevel, 
        analysis 
      };
    } catch {
      return { 
        heavyPackages: [], 
        totalWeight: 0, 
        categories: {}, 
        riskLevel: "LOW" as const,
        analysis: {
          hasBrowserAutomation: false,
          hasAI: false,
          hasImageProcessing: false,
          hasVideoProcessing: false,
          hasDatabase: false,
          totalDependencies: 0,
        }
      };
    }
  },
});