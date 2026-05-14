import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import fs from 'fs';

import { generateContent } from '../services/gemini.js';
import { CV_ROASTER_PROMPT } from '../utils/prompts.js';

const router = express.Router();

const uploadDir = 'uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

router.post('/', upload.single('file'), async (req, res) => {

  try {

    let cvText = '';

    if (req.file) {

      try {

        const buffer = fs.readFileSync(req.file.path);
        const pdf = await pdfParse(buffer);

        cvText = pdf.text;

      } finally {

        fs.unlink(req.file.path, () => {});

      }

    } else if (req.body.cv_text) {

      cvText = req.body.cv_text;

    } else {

      return res.status(400).json({
        error: 'Please provide a PDF file or CV text'
      });

    }

    const prompt =
      "Tolong roast CV berikut:\n\n" +
      cvText;

    const responseText = await generateContent(
      prompt,
      CV_ROASTER_PROMPT
    );

    console.log("Raw Gemini response:");
    console.log(responseText);

    // Ambil JSON object pertama
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("JSON object tidak ditemukan");
    }

    const result = JSON.parse(
      jsonMatch[0]
    );

    return res.json({
      roast_result: result
    });

  } catch (error) {

    console.error("Roast CV Error:", error);

    return res.status(500).json({
      error: 'Internal server error'
    });

  }

});

export default router;
