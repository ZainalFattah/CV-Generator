import { GoogleGenerativeAI } from "@google/generative-ai";
import { roasterPrompt } from '../prompts/roasterPrompt.js';
import { parseRoasterResponse } from '../parsers/roasterParser.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.3,
    responseMimeType: "application/json",
  }
});

const FALLBACK_ROAST = {
  overall_score: 50,
  grade: "C",
  verdict: "Could not fully parse CV, but it needs improvement.",
  ats_score: 40,
  technical_depth_score: 50,
  credibility_score: 50,
  recruiter_impression: "Format is unclear or parsing failed.",
  executive_summary: "A professional seeking to improve their CV format, but the automated review experienced difficulties parsing the content.",
  roast_points: [
    {
      section: "General",
      severity: "warning",
      issue: "Format is unclear or our systems struggled to read it.",
      impact: "ATS systems might reject the CV before a human sees it.",
      fix: "Ensure your CV is well-structured text without complex formatting."
    }
  ],
  strengths: ["Tried to get it roasted"],
  priority_fixes: ["Simplify CV format for better ATS parsing"],
  swot_analysis: {
    strengths: ["Willingness to improve"],
    weaknesses: ["CV structure hinders automated parsing"],
    opportunities: ["Using standard templates could significantly improve ATS scores"],
    threats: ["Automated rejection by enterprise ATS systems"]
  },
  career_fit: {
    best_roles: ["Unknown"],
    recommended_focus: "Focus on re-formatting your CV to standard ATS guidelines before applying.",
    market_readiness: "Needs format revision"
  },
  improved_summary: "A professional seeking to improve their CV format."
};

export async function processRoast(cvText) {
    const prompt = `Roast this CV:\n\n${cvText}`;

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            const chatSession = model.startChat({
                systemInstruction: {
                    role: "system",
                    parts: [{ text: roasterPrompt }]
                }
            });
            const result = await chatSession.sendMessage(prompt);
            const responseText = result.response.text();
            return parseRoasterResponse(responseText);
        } catch (error) {
            console.error(`Roaster Agent Error (Attempt ${attempts + 1}):`, error);
            attempts++;
        }
    }

    console.warn("Roaster Agent falling back to safe JSON after 3 failures.");
    return FALLBACK_ROAST;
}
