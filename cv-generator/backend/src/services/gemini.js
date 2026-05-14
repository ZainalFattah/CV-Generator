import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("Gemini key loaded:", !!process.env.GEMINI_API_KEY);
console.log("Gemini key prefix:", process.env.GEMINI_API_KEY?.slice(0, 8));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

export async function generateContent(prompt, systemInstruction) {
  try {
    const chatSession = model.startChat({
      systemInstruction: {
        role: "system",
        parts: [
          {
            text: systemInstruction
          }
        ]
      }
    });

    const result = await chatSession.sendMessage(prompt);

    return result.response.text();

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
