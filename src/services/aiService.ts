import { GoogleGenAI, Type } from "@google/genai";

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

const getPrompt = (idea: string) => `Analyze the following business idea: "${idea}".
Provide a comprehensive analysis including:
1. Market Demand (current trends, target audience size)
2. Competitor Landscape (key players, their strengths/weaknesses)
3. Tech Feasibility (complexity, required stack, risks)
4. Cost Estimation (initial investment, operational costs)
5. Monetization Strategy (revenue models, pricing)
6. MVP Roadmap (core features for launch, 3-month plan)
7. SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats)
8. Confidence Score (0-100) based on feasibility and market potential.
9. A "Multi-Agent Debate" summary: Simulate a debate between a "Skeptical Investor" and a "Visionary Founder" about this idea.

Return the response in JSON format with the following keys:
marketDemand, competitorLandscape, techFeasibility, costEstimation, monetizationStrategy, mvpRoadmap, swot (object with strengths, weaknesses, opportunities, threats arrays), confidenceScore (number), debateSummary.`;

async function analyzeWithGemini(idea: string, customKey?: string, modelName?: string): Promise<AnalysisResult> {
  // Use GEMINI_API_KEY for free tier or API_KEY for paid tier
  const apiKey = customKey || process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  if (!apiKey) throw new Error("Gemini API Key not found. Please ensure it is set in your environment.");
  
  // Use the most stable alias to avoid 404 errors
  const DEFAULT_MODEL = "gemini-flash-latest";
  const selectedModel = (modelName && modelName.trim() !== "") ? modelName : DEFAULT_MODEL;
  
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: selectedModel,
    contents: [{ parts: [{ text: getPrompt(idea) }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          marketDemand: { type: Type.STRING },
          competitorLandscape: { type: Type.STRING },
          techFeasibility: { type: Type.STRING },
          costEstimation: { type: Type.STRING },
          monetizationStrategy: { type: Type.STRING },
          mvpRoadmap: { type: Type.STRING },
          swot: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
              threats: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["strengths", "weaknesses", "opportunities", "threats"],
          },
          confidenceScore: { type: Type.NUMBER },
          debateSummary: { type: Type.STRING },
        },
        required: [
          "marketDemand",
          "competitorLandscape",
          "techFeasibility",
          "costEstimation",
          "monetizationStrategy",
          "mvpRoadmap",
          "swot",
          "confidenceScore",
          "debateSummary",
        ],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function analyzeIdea(idea: string, config: AIConfig): Promise<AnalysisResult> {
  if (config.provider === 'offline') {
    return new Promise((resolve) => setTimeout(() => resolve(OFFLINE_RESPONSE), 1500));
  }

  // Gemini is handled on the frontend as per platform guidelines
  if (config.provider === 'gemini') {
    return analyzeWithGemini(idea, config.apiKey, config.model);
  }

  // Other providers are handled on the backend for security
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
