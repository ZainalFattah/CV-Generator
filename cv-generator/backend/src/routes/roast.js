import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import { processRoast } from '../services/roasterAgent.js';

const router = express.Router();

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/', upload.single('file'), async (req, res, next) => {
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
      return res.status(400).json({ error: 'Please provide a PDF file or CV text' });
    }

    const result = await processRoast(cvText);

    return res.json({ roast_result: result });

  } catch (error) {
    next(error);
  }
});

export default router;
