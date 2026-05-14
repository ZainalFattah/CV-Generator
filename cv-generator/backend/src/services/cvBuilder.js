import { generateContent } from './gemini.js';
import { CV_INTERVIEWER_PROMPT, VARIANT_GENERATOR_PROMPT } from '../utils/prompts.js';

export async function processChat(messages, cvData) {
    const prompt = `
    Ini adalah history chat kita sejauh ini:
    \${JSON.stringify(messages)}

    Dan ini adalah data CV yang telah diekstrak sebelumnya:
    \${JSON.stringify(cvData)}

    Silakan berikan respons sesuai dengan instruksi yang diberikan.`;

    try {
        const responseText = await generateContent(prompt, CV_INTERVIEWER_PROMPT);
        // Coba parse JSON dari respons
        const jsonMatch = responseText.match(/\\{.*\\}/s);
        if (jsonMatch) {
             const result = JSON.parse(jsonMatch[0]);
             return result;
        }
        throw new Error("Gagal memparsing respons JSON dari Gemini");
    } catch (error) {
        console.error("Error in processChat:", error);
        return {
             reply: "Maaf, sepertinya saya mengalami sedikit gangguan. Bisa diulang bagian terakhir?",
             cv_json: cvData
        };
    }
}

export async function generateVariant(cvData, variant) {
     const prompt = `
     Berikut adalah data CV:
     \${JSON.stringify(cvData)}

     Tolong optimalkan untuk variant: \${variant}
     `;

     try {
          const responseText = await generateContent(prompt, VARIANT_GENERATOR_PROMPT);
          const jsonMatch = responseText.match(/\\{.*\\}/s);
          if (jsonMatch) {
               return JSON.parse(jsonMatch[0]);
          }
          throw new Error("Gagal memparsing respons JSON dari Gemini");
     } catch(error) {
          console.error("Error in generateVariant:", error);
          throw error;
     }
}
