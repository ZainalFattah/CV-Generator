import { GoogleGenerativeAI } from "@google/generative-ai";
import { recruiterPrompt } from '../prompts/recruiterPrompt.js';
import { parseRecruiterResponse } from '../parsers/recruiterParser.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7,
  }
});

export async function processChat(messages, cvData) {
    const prompt = `
    Chat history:
    ${JSON.stringify(messages)}

    Current CV data:
    ${JSON.stringify(cvData)}
    `;

    try {
        const chatSession = model.startChat({
            systemInstruction: {
                role: "system",
                parts: [{ text: recruiterPrompt }]
            }
        });
        const result = await chatSession.sendMessage(prompt);
        const responseText = result.response.text();
        return parseRecruiterResponse(responseText);
    } catch (error) {
        console.error("Recruiter Agent Error:", error);
        return {
             reply: "I'm having a bit of trouble connecting right now. Can we try that again?",
             cv_json: cvData
        };
    }
}
