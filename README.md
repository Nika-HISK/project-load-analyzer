#  Mastra GitHub Agent

A comprehensive AI-powered GitHub repository analysis tool built with Mastra framework that provides deep insights into project complexity, resource requirements, and server capacity planning.

##  Features

- **Repository Analysis**: Deep scan of GitHub repositories including file structure, dependencies, and codebase metrics
- **Project Heaviness Assessment**: Intelligent analysis of resource-intensive dependencies and complexity scoring
- **Resource Estimation**: Estimates RAM, CPU, and disk usage based on project characteristics
- **Concurrent User Capacity Planning**: Provides realistic user capacity ranges based on server specifications
- **Dependency Risk Assessment**: Categorizes and scores dependencies by resource impact (AI/ML, Browser Automation, etc.)
- **Infrastructure Detection**: Identifies Docker, Kubernetes, and other deployment configurations
- **Automated README Generation**: Creates comprehensive documentation for repositories
- **Multi-language Support**: Analyzes projects in TypeScript, JavaScript, Python, Java, Go, Rust, and C/C++

##  Architecture

### Core Components

```
src/
├── agents/
│   └── github-agent.ts          # Main agent orchestrator
├── tools/
│   ├── analyzeDependencies.ts   # Dependency analysis with weight scoring
│   ├── getFileContent.ts        # File content retrieval
│   ├── getFilePaths.ts          # Repository structure analysis
│   ├── getRepoSize.ts           # Repository size calculation
│   ├── getRepositoryCommits.ts  # Commit history analysis
│   ├── generateReadmeFromRepo.ts # README generation
│   └── project-heaviness-analyzer.ts # Main analysis engine
└── lib/
    └── utils.ts                 # GitHub API utilities
```

### Tool Breakdown

| Tool | Purpose | Input | Output |
|------|---------|--------|---------|
| `analyzeDependencies` | Scans package.json for heavy dependencies | Package.json content | Risk level, categories, weights |
| `getFileContent` | Retrieves file content from GitHub | Owner, repo, file path | File content or error |
| `getFilePaths` | Lists all files in repository | Owner, repo, branch | Array of file paths |
| `getRepoSize` | Calculates repository size | Owner, repo | Size in MB |
| `getRepositoryCommits` | Fetches commit history | Owner, repo | Commit details array |
| `generateReadmeFromRepo` | Creates README from repo analysis | Owner, repo | Markdown README |
| `projectHeavinessAnalyzer` | Main analysis engine | Owner, repo, server specs | Comprehensive analysis report |

##  Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- GitHub Personal Access Token
- Mastra framework

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Nika-HISK/deploy-calculator.git
cd deploy-calculator
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
Add your credentials to `.env`:
```env
GITHUB_TOKEN=your_github_personal_access_token
ANTHROPIC_API_KEY=your_anthropic_api_key
```
4. **Start the agent**
```bash
npm run start
```
5. **Interact with the Agent**
Once running, you can chat with the GitHub agent:
```bash
# Example conversation
You: "Tell me how heavy is this project {github link}"
Agent: [Analyzes repository heavyness and returns content]

You: "Tell me what kind of server specifications i need for this project {github link}"
Agent: [Generates comprehensive guide for your project]
```

##  Usage

### Basic Repository Analysis

```typescript
import { githubAgent } from './src/agents/github-agent';

// Analyze a repository
const analysis = await githubAgent.text({
  messages: [{
    role: 'user',
    content: 'Analyze the project heaviness for facebook/react with 4 CPU cores and 8GB RAM'
  }]
});

console.log(analysis);
```

### Project Heaviness Analysis

```typescript
import { projectHeavinessAnalyzer } from './src/tools/project-heaviness-analyzer';

const result = await projectHeavinessAnalyzer.execute({
  context: {
    owner: 'facebook',
    repo: 'react',
    serverSpecs: {
      cpuCores: 4,
      ramGB: 8
    }
  },
  runtimeContext: {}
});
```

##  Analysis Categories

### Dependency Risk Levels

| Risk Level | Weight Range | Description | Example Packages |
|------------|--------------|-------------|------------------|
| **LOW** | 0-5 | Minimal resource impact | Standard utilities |
| **MEDIUM** | 6-15 | Moderate resource usage | Build tools, frameworks |
| **HIGH** | 16-30 | Significant resource requirements | Database drivers, crypto |
| **CRITICAL** | 31+ | Extreme resource demands | AI/ML, browser automation |

### Heavy Dependency Categories

- ** AI/ML**: TensorFlow, OpenCV, MediaPipe
- ** Browser Automation**: Puppeteer, Playwright, Selenium
- ** Image Processing**: Sharp, Canvas, JIMP
- ** Video Processing**: FFmpeg, Node-FFmpeg
- ** Database**: MySQL2, PostgreSQL, MongoDB, Redis
- ** Build Tools**: Webpack, Vite, Rollup
- ** Frameworks**: Next.js, Nuxt, Electron
- ** Crypto**: bcrypt, Argon2
- ** File Processing**: PDF-parse, XLSX, Archiver
- ** Testing**: Jest, Cypress, Storybook

##  Accuracy & Limitations

### Accuracy Rating: **6/10**

####  Strengths
- **Dependency Detection**: Excellent at identifying resource-intensive packages
- **Relative Comparison**: Very good for comparing project complexity
- **Risk Assessment**: Effective at flagging potential issues
- **Initial Sizing**: Good ballpark estimates for development planning

####  Limitations
- **Runtime Behavior**: Cannot detect actual code execution patterns
- **Architecture Gaps**: Misses clustering, microservices, caching strategies
- **Production Reality**: Doesn't account for real-world traffic patterns
- **Database Impact**: Cannot analyze database query efficiency

####  Best Use Cases
- Initial project assessment
- Dependency auditing
- Development environment sizing
- Risk awareness and planning
- Relative project comparison

####  Not Recommended For
- Production capacity planning
- SLA commitments
- Critical system sizing
- Performance optimization decisions

## Configuration
### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key for Claude access | Yes |
| `GITHUB_TOKEN` | GitHub personal access token for API access | Yes |

### Agent Configuration

The GitHub agent is configured with:
- **Model**: Claude 3.5 Sonnet (claude-3-5-sonnet-20241022)
- **Memory**: LibSQL-based persistent storage
- **Tools**: File analysis, content fetching, commit tracking, README generation

### Heavy Dependencies Configuration

Add or modify heavy dependencies in `analyzeDependencies.ts`:

```typescript
const heavyPackagesList = {
  "your-package": { weight: 5, category: "Custom Category" },
  // ... other packages
};
```
##  API Keys Setup

### Anthropic API Key
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Generate an API key
4. Add it to your `.env` file

### GitHub Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with repository access permissions
3. Add it to your `.env` file

## API Reference

### GitHubAgent

Main agent class with integrated tools and memory.

```typescript
const githubAgent = new Agent({
  name: "Github Agent",
  instructions: "GitHub repository analysis assistant",
  model: anthropic("claude-3-5-sonnet-20241022"),
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db",
    }),
  }),
  tools: {
    getFilePaths,
    getFileContent,
    getRepositoryCommits,
    generateReadmeFromRepo,
    projectHeavinessAnalyzer,
    getRepoSize,
    analyzeDependencies
  },
});
```

### Tool Schemas

#### ProjectHeavinessAnalyzer

**Input:**
```typescript
{
  owner: string;           // Repository owner
  repo: string;            // Repository name
  serverSpecs?: {          // Optional server specifications
    cpuCores: number;      // Default: 2
    ramGB: number;         // Default: 4
  };
}
```

**Output:**
```typescript
string // Markdown report with resource analysis
```

#### AnalyzeDependencies

**Input:**
```typescript
{
  packageJson: string;     // Package.json content as string
}
```

**Output:**
```typescript
{
  heavyPackages: string[];              // List of heavy package names
  totalWeight: number;                  // Combined weight score
  categories: Record<string, number>;   // Weight by category
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  analysis: {
    hasBrowserAutomation: boolean;
    hasAI: boolean;
    hasImageProcessing: boolean;
    hasVideoProcessing: boolean;
    hasDatabase: boolean;
    totalDependencies: number;
  };
}
```

##  Example Outputs

### Project Analysis Report

```markdown
# 📊 Project Resource Analysis

## 🎯 Project Classification
- **Type**: Web Application
- **Complexity**: High
- **Resource Profile**: Heavy

## 💾 Resource Estimates
- **Base RAM**: ~200 MB
- **Peak RAM**: ~800 MB (with heavy operations)
- **CPU Usage**: High
- **Disk Usage**: 45.2 MB
- **Dependency Load**: HIGH

## 👥 Concurrent User Capacity
- **Server Specs**: 4 cores, 8GB RAM
- **Estimated Range**: 50-200 concurrent users
- **Limiting Factors**: Image processing, browser automation

## ⚠️ Risk Factors
- Heavy browser automation (Puppeteer)
- Image processing dependencies (Sharp)
- Multiple database connections

## 🚀 Optimization Suggestions
- Implement connection pooling
- Use image processing queues
- Consider microservices architecture
- Add caching layer
```

##  Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests if applicable**
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Add JSDoc comments for new functions
- Update tests for new features
