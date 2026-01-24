export const AVAILABLE_MODELS = [
  {
    id: "gemini-2.5-flash-lite-preview-09-2025",
    name: "Gemini 2.5 Flash Lite Preview",
    description: "Ultra-fast and efficient next-generation model.",
    recommended: true,
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    description: "Fast and efficient for quick analysis and simple projects.",
    recommended: false,
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    description: "Complex reasoning and deep project analysis.",
    recommended: false,
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    description: "Fast and stable performance.",
    recommended: false,
  },
] as const;

export type AiModelId = (typeof AVAILABLE_MODELS)[number]["id"];