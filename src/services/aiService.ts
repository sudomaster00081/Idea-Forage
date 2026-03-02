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

export async function analyzeIdea(idea: string, config: AIConfig): Promise<AnalysisResult> {
  if (config.provider === 'offline') {
    return new Promise((resolve) => setTimeout(() => resolve(OFFLINE_RESPONSE), 1500));
  }

  if (config.provider === 'gemini') {
    return analyzeWithGemini(idea, config.apiKey, config.model);
  }

  if (config.provider === 'openai') {
    return analyzeWithOpenAI(idea, config.apiKey, config.model);
  }

  if (config.provider === 'anthropic') {
    return analyzeWithAnthropic(idea, config.apiKey, config.model);
  }

  if (config.provider === 'ollama') {
    return analyzeWithOllama(idea, config.baseUrl, config.model);
  }

  throw new Error(`Unsupported provider: ${config.provider}`);
}

async function analyzeWithOllama(idea: string, baseUrl: string = "http://localhost:11434", model: string = "llama3"): Promise<AnalysisResult> {
  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: getPrompt(idea),
      stream: false,
      format: "json"
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return JSON.parse(data.response);
}

async function analyzeWithGemini(idea: string, customKey?: string, modelName: string = "gemini-2.0-flash"): Promise<AnalysisResult> {
  const apiKey = customKey || process.env.GEMINI_API_KEY || "";
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: modelName,
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
      // Search grounding can sometimes cause 404 if not available for the specific model/region
      // tools: [{ googleSearch: {} }], 
    },
  });

  return JSON.parse(response.text || "{}");
}

async function analyzeWithOpenAI(idea: string, apiKey?: string, model: string = "gpt-4o"): Promise<AnalysisResult> {
  if (!apiKey) throw new Error("OpenAI API Key is required");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are a business analyst expert. Return only JSON."
        },
        {
          role: "user",
          content: getPrompt(idea)
        }
      ],
      response_format: { type: "json_object" }
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return JSON.parse(data.choices[0].message.content);
}

async function analyzeWithAnthropic(idea: string, apiKey?: string, model: string = "claude-3-5-sonnet-20240620"): Promise<AnalysisResult> {
  if (!apiKey) throw new Error("Anthropic API Key is required");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "dangerously-allow-browser": "true"
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: getPrompt(idea)
        }
      ]
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  
  const text = data.content[0].text;
  return JSON.parse(text);
}
