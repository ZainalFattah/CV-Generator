import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function extractCVData(cvText) {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
        }
    });

    const prompt = `
Extract structured data from the following CV text.
Return ONLY valid JSON with the following structure:
{
  "skills": ["skill1", "skill2"],
  "technologies": ["tech1", "tech2"],
  "experience": [
    {
      "role": "Role Name",
      "company": "Company Name",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM or Present"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "technologies": ["tech1", "tech2"]
    }
  ],
  "education": [],
  "certifications": [],
  "github_links": []
}

Do not make up any data. Extract exactly what is in the text.
CV Text:
${cvText}
`;

    let attempts = 0;
    while (attempts < 3) {
        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (error) {
            console.error("Extractor error:", error);
        }
        attempts++;
    }

    // Fallback to empty structure
    return {
        skills: [],
        technologies: [],
        experience: [],
        projects: [],
        education: [],
        certifications: [],
        github_links: []
    };
}
