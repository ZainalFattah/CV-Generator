import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import { generateContent } from '../services/gemini.js';
import { CV_ROASTER_PROMPT } from '../utils/prompts.js';

const router = express.Router();

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', upload.single('file'), async (req, res) => {
    try {
        let cvText = '';
        if (req.file) {
            try {
                const dataBuffer = fs.readFileSync(req.file.path);
                const data = await pdfParse(dataBuffer);
                cvText = data.text;
            } finally {
                fs.unlink(req.file.path, () => {}); // Cleanup
            }
        } else if (req.body.cv_text) {
             cvText = req.body.cv_text;
        } else {
             return res.status(400).json({ error: 'Please provide a PDF file or CV text' });
        }

        const prompt = \`
        Tolong roast CV berikut:

        \${cvText}
        \`;

        const responseText = await generateContent(prompt, CV_ROASTER_PROMPT);
        const jsonMatch = responseText.match(/\\{.*\\}/s);
        if (jsonMatch) {
             const result = JSON.parse(jsonMatch[0]);
             return res.json({ roast_result: result });
        }
        throw new Error("Gagal memparsing respons JSON dari Gemini");
    } catch (error) {
        console.error("Roast CV Error:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
