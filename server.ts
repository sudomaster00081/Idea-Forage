import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function analyzeWithGemini(idea: string, customKey?: string, modelName?: string) {
  const apiKey = customKey || process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  if (!apiKey) throw new Error("Gemini API Key not found on server.");
  
  const selectedModel = modelName || "gemini-3-flash-preview";
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

async function analyzeWithOpenAI(idea: string, apiKey: string, model: string = "gpt-4o") {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are a business analyst expert. Return only JSON." },
        { role: "user", content: getPrompt(idea) }
      ],
      response_format: { type: "json_object" }
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return JSON.parse(data.choices[0].message.content);
}

async function analyzeWithAnthropic(idea: string, apiKey: string, model: string = "claude-3-5-sonnet-20240620") {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{ role: "user", content: getPrompt(idea) }]
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return JSON.parse(data.content[0].text);
}

async function analyzeWithOllama(idea: string, baseUrl: string = "http://localhost:11434", model: string = "llama3") {
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/analyze", async (req, res) => {
    const { idea, config } = req.body;
    try {
      let result;
      switch (config.provider) {
        case 'gemini':
          result = await analyzeWithGemini(idea, config.apiKey, config.model);
          break;
        case 'openai':
          if (!config.apiKey) throw new Error("OpenAI API Key is required");
          result = await analyzeWithOpenAI(idea, config.apiKey, config.model);
          break;
        case 'anthropic':
          if (!config.apiKey) throw new Error("Anthropic API Key is required");
          result = await analyzeWithAnthropic(idea, config.apiKey, config.model);
          break;
        case 'ollama':
          result = await analyzeWithOllama(idea, config.baseUrl, config.model);
          break;
        default:
          throw new Error(`Unsupported provider: ${config.provider}`);
      }
      res.json(result);
    } catch (error: any) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
