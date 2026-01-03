import { GoogleGenAI, Type } from "@google/genai";
import { ImageAnalysis } from "../types";

export const analyzeImage = async (base64Image: string): Promise<ImageAnalysis> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze the visual style, mood, and content of this image to suggest musical parameters for a generative MIDI track.
    I need a BPM (tempo), a Musical Key (root note and scale type), a creative title for the track, and a short description of the mood.
    
    Valid scales: 'chromatic', 'major', 'minor', 'pentatonic_major', 'pentatonic_minor', 'blues'.
    Valid roots: 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
             inlineData: {
               mimeType: 'image/png',
               data: base64Image
             }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedBpm: { type: Type.NUMBER, description: "Tempo between 60 and 180" },
            suggestedScale: { type: Type.STRING, description: "Scale type from the allowed list" },
            suggestedRoot: { type: Type.STRING, description: "Root note from the allowed list" },
            title: { type: Type.STRING, description: "A creative title for the generated track" },
            moodDescription: { type: Type.STRING, description: "A short poetic description of the visual mood" }
          },
          required: ["suggestedBpm", "suggestedScale", "suggestedRoot", "title", "moodDescription"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as ImageAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback defaults
    return {
      suggestedBpm: 120,
      suggestedScale: 'minor',
      suggestedRoot: 'C',
      title: 'Untitled Scan',
      moodDescription: 'Analysis failed, using defaults.'
    };
  }
};