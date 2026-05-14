import express from 'express';
import db from '../db/database.js';
import { generateContent } from '../services/gemini.js';
import { JOB_MATCH_PROMPT } from '../utils/prompts.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { cv_id, cv_text, jd_text } = req.body;

        let cvContent = cv_text;

        if (cv_id) {
             const cv = db.prepare('SELECT * FROM cvs WHERE id = ?').get(cv_id);
             if (!cv) {
                  return res.status(404).json({ error: 'CV not found' });
             }
             cvContent = JSON.stringify(JSON.parse(cv.cv_data));
        }

        if (!cvContent || !jd_text) {
             return res.status(400).json({ error: 'CV and Job Description are required' });
        }

        const prompt = \`
        Tolong analisa kecocokan CV dan Job Description berikut:

        CV:
        \${cvContent}

        Job Description:
        \${jd_text}
        \`;

        const responseText = await generateContent(prompt, JOB_MATCH_PROMPT);
        const jsonMatch = responseText.match(/\\{.*\\}/s);
        if (jsonMatch) {
             const result = JSON.parse(jsonMatch[0]);
             return res.json({ match_result: result });
        }
        throw new Error("Gagal memparsing respons JSON dari Gemini");

    } catch (error) {
         console.error("Job Match Error:", error);
         res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
