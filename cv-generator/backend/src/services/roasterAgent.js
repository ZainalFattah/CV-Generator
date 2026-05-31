import { GoogleGenerativeAI } from "@google/generative-ai";
import { roasterPrompt } from '../prompts/roasterPrompt.js';
import { parseRoasterResponse } from '../parsers/roasterParser.js';
import { extractCVData } from '../pipeline/cvExtractor.js';
import { validateCVData } from '../pipeline/cvValidator.js';
import { evaluateTechnologies } from '../pipeline/techEvaluator.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.3,
    responseMimeType: "application/json",
  }
});

const FALLBACK_ROAST = {
  overall_score: 50,
  grade: "C",
  verdict: "Sistem mengalami kendala saat melakukan parsing penuh pada CV, namun terlihat ada ruang untuk perbaikan.",
  ats_score: 40,
  technical_depth_score: 50,
  credibility_score: 50,
  confidence_level: "low",
  validation_status: "failed",
  evidence_source: "fallback",
  reasoning_trace: "Parsing atau API gagal berulang kali.",
  recruiter_impression: "Format mungkin kurang optimal atau terjadi kesalahan sistem.",
  executive_summary: "Kandidat terlihat memiliki niat baik untuk evaluasi, namun karena kendala format/sistem, evaluasi mendalam tidak dapat dilakukan.",
  roast_points: [
    {
      section: "General",
      severity: "medium",
      issue: "Format tidak terbaca jelas atau sistem mengalami timeout.",
      impact: "Sistem ATS mungkin juga akan kesulitan membaca CV ini.",
      fix: "Gunakan format teks standar dan sederhana."
    }
  ],
  strengths: ["Inisiatif untuk evaluasi CV"],
  priority_fixes: ["Sederhanakan format CV agar lebih ATS-friendly"],
  swot_analysis: {
    strengths: ["Terbuka terhadap feedback"],
    weaknesses: ["Struktur CV menghambat parsing otomatis"],
    opportunities: ["Menggunakan template standar akan meningkatkan ATS score secara instan"],
    threats: ["Penolakan otomatis oleh sistem ATS enterprise"]
  },
  career_fit: {
    best_roles: ["Unknown"],
    recommended_focus: "Fokus pada perbaikan format sebelum apply.",
    market_readiness: "Perlu revisi format"
  },
  improved_summary: "Profesional yang sedang mempersiapkan diri untuk re-formatting dokumen."
};

export async function processRoast(cvText) {
    console.log("Starting multi-layer AI evaluation pipeline...");

    // STEP 1: Parse and Extract
    console.log("Step 1: Extracting data...");
    const extractedData = await extractCVData(cvText);

    // STEP 2: Validate Data
    console.log("Step 2: Validating data...");
    const validationReport = validateCVData(extractedData);

    // STEP 3: Technology Knowledge System
    console.log("Step 3: Evaluating technologies...");
    const techReport = await evaluateTechnologies(extractedData.technologies || []);

    const contextData = {
        current_year: new Date().getFullYear(),
        validation_report: validationReport,
        technology_evaluation: techReport
    };

    const prompt = `
Analisis CV Berikut dengan konteks tambahan dari pipeline evaluasi sistem kami.

Konteks Pipeline Sistem:
Tahun Saat Ini: ${contextData.current_year}
Laporan Validasi Timeline: ${JSON.stringify(contextData.validation_report)}
Laporan Teknologi: ${JSON.stringify(contextData.technology_evaluation)}

Data CV Mentah:
${cvText}
`;

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            console.log(`Final Step: Generative Evaluation (Attempt ${attempts + 1})...`);
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
