import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const techCache = new Map();

export async function evaluateTechnologies(technologies) {
    if (!technologies || technologies.length === 0) return {};

    const unknownTechs = technologies.filter(t => !techCache.has(t.toLowerCase()));

    if (unknownTechs.length > 0) {
        // Fetch info for unknown technologies using Gemini with search grounding
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            tools: [{ googleSearch: {} }] // Enable Google Search for dynamic grounding
        });

        const prompt = `
Please verify the following list of technologies. Are they real software tools, frameworks, languages, or concepts?
List: ${unknownTechs.join(', ')}

Return ONLY valid JSON in this format:
{
  "tech_evaluations": [
    {
      "name": "technology name",
      "is_real": true/false,
      "category": "framework/language/tool/etc",
      "description": "short description"
    }
  ]
}
`;

        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);

            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.tech_evaluations) {
                    parsed.tech_evaluations.forEach(evalData => {
                        techCache.set(evalData.name.toLowerCase(), evalData);
                    });
                }
            }
        } catch (error) {
            console.error("Tech Evaluator error:", error);
        }
    }

    const evaluationReport = {
        verified_technologies: [],
        unverified_technologies: [],
        tech_summaries: []
    };

    technologies.forEach(t => {
        const cached = techCache.get(t.toLowerCase());
        if (cached) {
            if (cached.is_real) {
                evaluationReport.verified_technologies.push(t);
                evaluationReport.tech_summaries.push(`${t} (${cached.category}): ${cached.description}`);
            } else {
                evaluationReport.unverified_technologies.push(t);
            }
        } else {
            // Assume real if evaluation failed to prevent false negatives
            evaluationReport.verified_technologies.push(t);
        }
    });

    return evaluationReport;
}
