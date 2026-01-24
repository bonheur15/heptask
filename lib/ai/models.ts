export const AVAILABLE_MODELS = [
  {
    id: "gemini-2.5-flash-lite-preview-09-2025",
    name: "Gemini 2.5 Flash Lite Preview",
    description: "Most capable model for complex reasoning and large projects.",
    recommended: true,
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    description: "Fast and efficient for quick analysis and simple projects.",
    recommended: false,
  },
] as const;

export type AiModelId = (typeof AVAILABLE_MODELS)[number]["id"];
