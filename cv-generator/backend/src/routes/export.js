import express from 'express';
import db from '../db/database.js';
import { generatePDF } from '../services/pdfGenerator.js';

const router = express.Router();

router.get('/pdf/:cv_id', async (req, res) => {
    try {
        const { cv_id } = req.params;
        const { template = 'modern' } = req.query;

        const cv = db.prepare('SELECT * FROM cvs WHERE id = ?').get(cv_id);
        if (!cv) {
             return res.status(404).json({ error: 'CV not found' });
        }

        const cvData = JSON.parse(cv.cv_data);
        const pdfBuffer = await generatePDF(cvData, template);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=CV_\${cvData.personal?.name?.replace(/\\s+/g, '_') || 'Generated'}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
         console.error("Export PDF Error:", error);
         res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
