import { GoogleGenerativeAI } from "@google/generative-ai";
import { AiModelId } from "./models";
import { PROJECT_INTERVIEW_PROMPT, PROJECT_PLAN_PROMPT } from "./prompts";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function askGemini(modelId: AiModelId, systemPrompt: string, userPrompt: string) {
  const model = genAI.getGenerativeModel({ 
    model: modelId,
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const chatSession = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [{ text: "Understood. I will provide structured JSON responses based on your instructions." }],
      },
    ],
  });

  const result = await chatSession.sendMessage(userPrompt);
  const response = result.response.text();
  
  try {
    return JSON.parse(response);
  } catch (error) {
    console.error("Failed to parse Gemini response:", response);
    throw new Error("Invalid AI response format");
  }
}

export async function generateProjectQuestions(modelId: AiModelId, idea: string) {
  return askGemini(modelId, PROJECT_INTERVIEW_PROMPT, `Project Idea: ${idea}`);
}

export async function generateProjectPlanDetails(
  modelId: AiModelId,
  idea: string,
  answers: Record<string, string>,
  mode: "fast" | "advanced",
) {
  const userContext = `
    Project Idea: ${idea}
    Process Mode: ${mode}
    User Answers to Interview: ${JSON.stringify(answers)}
  `;
  return askGemini(modelId, PROJECT_PLAN_PROMPT, userContext);
}
