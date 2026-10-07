import { CreateMLCEngine, type MLCEngine } from "@mlc-ai/web-llm";

const GEMMA_MODEL = "gemma-2-2b-it-q4f16_1-MLC";
let engine: MLCEngine | null = null;

export type ProgressCallback = (percentage: number, text: string) => void;

export async function generateJournalEntry(
  userNotes: string,
  onProgress?: ProgressCallback
): Promise<string> {
  if (!engine) {
    engine = await CreateMLCEngine(GEMMA_MODEL, {
      initProgressCallback: (progress) => {
        if (onProgress) {
          const percentage = Math.round(progress.progress * 100);
          onProgress(percentage, progress.text);
        }
      }
    });
  }

  const systemStyle = `
    You are an intimate, reflective outdoor journal assistant.
    Your goal is to write a personal journal entry based strictly on the user's notes.
    
    TONE & STYLE RULES:
    1. Stay true to the emotional state expressed by the user. If they report inconveniences, cold, or tiredness, do NOT sugarcoat or force an artificial poetic spin.
    2. Keep an honest, grounded, human, and personal tone.
    3. Capture sensory details mentioned (sounds, smells, weather, physical feelings).
    4. Write in fluid, well-structured paragraphs.
  `;

  const completion = await engine.chat.completions.create({
    messages: [
      { role: "system", content: systemStyle },
      { role: "user", content: userNotes }
    ],
    temperature: 0.6,
  });

  return completion.choices[0]?.message?.content || "";
}