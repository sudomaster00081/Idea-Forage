export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'ollama' | 'offline';

export interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
  baseUrl?: string; // For Ollama or custom endpoints
}

export interface AnalysisResult {
  marketDemand: string;
  competitorLandscape: string;
  techFeasibility: string;
  costEstimation: string;
  monetizationStrategy: string;
  mvpRoadmap: string;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  confidenceScore: number;
  debateSummary: string;
}

const OFFLINE_RESPONSE: AnalysisResult = {
  marketDemand: "Offline Mode: Market demand analysis requires an active AI connection for real-time data. However, based on general patterns, this idea shows potential in niche markets.",
  competitorLandscape: "Offline Mode: Competitor research is limited. Suggest looking into established players in the tech and retail sectors.",
  techFeasibility: "Offline Mode: Feasibility appears high for a standard web/mobile stack (React, Node.js, PostgreSQL).",
  costEstimation: "Offline Mode: Estimated initial burn: $5k-$15k for MVP development and basic marketing.",
  monetizationStrategy: "Offline Mode: Recommended: Tiered Subscription (SaaS) or Transaction-based fees.",
  mvpRoadmap: "Offline Mode: Month 1: Design & Prototype. Month 2: Core Feature Dev. Month 3: Beta Launch.",
  swot: {
    strengths: ["Low overhead", "Clear value proposition"],
    weaknesses: ["High competition", "Dependency on third-party APIs"],
    opportunities: ["Market expansion", "Strategic partnerships"],
    threats: ["Regulatory changes", "Rapid tech shifts"]
  },
  confidenceScore: 75,
  debateSummary: "Offline Mode: Debate simulation requires active reasoning. The Skeptical Investor would likely question the CAC/LTV ratio, while the Visionary Founder would focus on the long-term disruption potential."
};

export async function analyzeIdea(idea: string, config: AIConfig): Promise<AnalysisResult> {
  if (config.provider === 'offline') {
    return new Promise((resolve) => setTimeout(() => resolve(OFFLINE_RESPONSE), 1500));
  }

  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idea, config }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to analyze idea");
  }

  return response.json();
}
