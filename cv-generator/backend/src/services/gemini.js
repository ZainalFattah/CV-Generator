import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateContent(prompt, systemInstruction) {
  try {
    const chatSession = model.startChat({
        systemInstruction: systemInstruction,
    });

    const result = await chatSession.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
