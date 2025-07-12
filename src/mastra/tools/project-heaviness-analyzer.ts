import { Tool } from "@mastra/core/tools";
import { z } from "zod";
import { getFilePaths } from "../tools/getFilePaths";
import { getFileContent } from "../tools/getFileContent";
import { getRepoSize } from "./getRepoSize";
import { analyzeDependencies } from "../tools/analyzeDependencies";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

const inputSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  serverSpecs: z
    .object({
      cpuCores: z.number().min(1).default(2),
      ramGB: z.number().min(1).default(4),
    })
    .optional(),
});

const outputSchema = z.string().describe("Markdown report summarizing project heaviness and estimated concurrent users");

export const projectHeavinessAnalyzer = new Tool({
  id: "projectHeavinessAnalyzer",
  description: "Estimates memory, CPU, disk, and dependency heaviness of a GitHub project and calculates supported concurrent users based on server specs",
  inputSchema,
  outputSchema,
  execute: async ({ context }) => {
    const { owner, repo, serverSpecs } = context;
    
    const paths = await getFilePaths.execute!({
      context: { owner, repo, tree_sha: "main" },
      runtimeContext: {} as any,
    });
    
    const hasPackageJson = paths.includes("package.json");
    const hasDockerfile = paths.some(p => p.toLowerCase().includes("dockerfile"));
    const hasDockerCompose = paths.some(p => p.includes("docker-compose"));
    const hasK8sConfig = paths.some(p => p.includes("k8s") || p.includes("kubernetes"));
    
    let packageJson = "";
    type DependencyAnalysis = {
      heavyPackages: string[];
      totalWeight: number;
      categories: Record<string, number>;
      riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      analysis: {
        hasBrowserAutomation: boolean;
        hasAI: boolean;
        hasImageProcessing: boolean;
        hasVideoProcessing: boolean;
        hasDatabase: boolean;
        totalDependencies: number;
      };
    };
    let dependencyAnalysis: DependencyAnalysis = {
      heavyPackages: [],
      totalWeight: 0,
      categories: {},
      riskLevel: "LOW",
      analysis: {
        hasBrowserAutomation: false,
        hasAI: false,
        hasImageProcessing: false,
        hasVideoProcessing: false,
        hasDatabase: false,
        totalDependencies: 0,
      }
    };
    
    if (hasPackageJson) {
      const fileRes = await getFileContent.execute!({
        context: { owner, repo, path: "package.json" },
        runtimeContext: {} as any,
      });
      if (fileRes.ok) {
        packageJson = fileRes.content;
        dependencyAnalysis = await analyzeDependencies.execute!({
          context: { packageJson },
          runtimeContext: {} as any,
        });
      }
    }
    
    const repoSize = await getRepoSize.execute!({
      context: { owner, repo },
      runtimeContext: {} as any,
    });
    
    const fileTypes = {
      typescript: paths.filter(p => p.endsWith('.ts')).length,
      javascript: paths.filter(p => p.endsWith('.js')).length,
      python: paths.filter(p => p.endsWith('.py')).length,
      java: paths.filter(p => p.endsWith('.java')).length,
      go: paths.filter(p => p.endsWith('.go')).length,
      rust: paths.filter(p => p.endsWith('.rs')).length,
      cpp: paths.filter(p => p.endsWith('.cpp') || p.endsWith('.c')).length,
    };
    
    const specs = serverSpecs ?? { cpuCores: 2, ramGB: 4 };
    
    const reportPrompt = `You are analyzing the performance profile of a GitHub project for resource estimation.

## Repository Information
- **Repository**: ${owner}/${repo}
- **Size**: ${repoSize.repoSizeMB} MB
- **Total Files**: ${paths.length}
- **Has Docker**: ${hasDockerfile ? "Yes" : "No"}
- **Has Docker Compose**: ${hasDockerCompose ? "Yes" : "No"}
- **Has Kubernetes**: ${hasK8sConfig ? "Yes" : "No"}

## File Type Analysis
- TypeScript: ${fileTypes.typescript} files
- JavaScript: ${fileTypes.javascript} files
- Python: ${fileTypes.python} files
- Java: ${fileTypes.java} files
- Go: ${fileTypes.go} files
- Rust: ${fileTypes.rust} files
- C/C++: ${fileTypes.cpp} files

## Dependency Analysis
- **Risk Level**: ${dependencyAnalysis.riskLevel}
- **Total Weight**: ${dependencyAnalysis.totalWeight}
- **Heavy Packages**: ${dependencyAnalysis.heavyPackages.join(", ") || "None"}
- **Categories**: ${Object.entries(dependencyAnalysis.categories).map(([cat, weight]) => `${cat}: ${weight}`).join(", ") || "None"}

## Dependency Flags
- **Browser Automation**: ${dependencyAnalysis.analysis.hasBrowserAutomation ? "Yes" : "No"}
- **AI/ML**: ${dependencyAnalysis.analysis.hasAI ? "Yes" : "No"}
- **Image Processing**: ${dependencyAnalysis.analysis.hasImageProcessing ? "Yes" : "No"}
- **Video Processing**: ${dependencyAnalysis.analysis.hasVideoProcessing ? "Yes" : "No"}
- **Database**: ${dependencyAnalysis.analysis.hasDatabase ? "Yes" : "No"}
- **Total Dependencies**: ${dependencyAnalysis.analysis.totalDependencies}

## Server Specs
- **CPU Cores**: ${specs.cpuCores}
- **RAM**: ${specs.ramGB} GB

## Package.json Content
${packageJson.slice(0, 2000)}${packageJson.length > 2000 ? "..." : ""}

---

### Task:
Create a comprehensive resource analysis report. Be realistic about limitations and provide ranges rather than exact numbers.

**IMPORTANT GUIDELINES:**
1. For concurrent users, provide RANGES based on application type:
   - Static sites: 1000-10000+ users
   - Simple APIs: 100-1000 users
   - Medium complexity: 50-500 users
   - Heavy processing: 10-100 users
   - AI/ML apps: 1-50 users

2. Consider the following factors:
   - Repository size vs actual runtime memory usage
   - Heavy dependencies significantly impact estimates
   - Browser automation tools are extremely resource-intensive
   - AI/ML libraries require substantial memory
   - Database connections add overhead

3. Provide optimization suggestions based on detected patterns.

Return your analysis as a structured markdown report following this format:

# 📊 Project Resource Analysis

## 🎯 Project Classification
- **Type**: [Web App/API/Desktop/CLI/etc.]
- **Complexity**: [Low/Medium/High/Critical]
- **Resource Profile**: [Light/Medium/Heavy/Extreme]

## 💾 Resource Estimates
- **Base RAM**: ~XXX MB
- **Peak RAM**: ~XXX MB (with heavy operations)
- **CPU Usage**: [Low/Medium/High/Critical]
- **Disk Usage**: ${repoSize.repoSizeMB} MB
- **Dependency Load**: ${dependencyAnalysis.riskLevel}

## 👥 Concurrent User Capacity
- **Server Specs**: ${specs.cpuCores} cores, ${specs.ramGB}GB RAM
- **Estimated Range**: XX-XXX concurrent users
- **Limiting Factors**: [List main bottlenecks]

## ⚠️ Risk Factors
[List specific concerns based on analysis]

## 🚀 Optimization Suggestions
[Provide specific recommendations]

## 📋 Technical Notes
- **Assumptions**: [List key assumptions made]
- **Limitations**: This is a static analysis - actual performance depends on code implementation, user behavior, and production environment

Generate only the markdown report with realistic estimates and clear limitations.`;

    const model = anthropic("claude-3-5-sonnet-20241022");
    const result = await generateText({
      model,
      messages: [{ role: "user", content: reportPrompt }],
    });

    return result.text?.trim() ?? "Unable to generate report.";
  },
});