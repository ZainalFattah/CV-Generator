import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { generateVariant } from '../services/cvBuilder.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
    try {
        const { session_id, variant = 'general' } = req.body;

        if (!session_id) {
             return res.status(400).json({ error: 'session_id is required' });
        }

        const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(session_id);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        let cvData = session.cv_json ? JSON.parse(session.cv_json) : null;
        if (!cvData) {
             return res.status(400).json({ error: 'No CV data in session' });
        }

        if (variant !== 'general') {
             cvData = await generateVariant(cvData, variant);
        }

        const cv_id = uuidv4();
        db.prepare(`
            INSERT INTO cvs (id, session_id, variant, cv_data, created_at)
            VALUES (?, ?, ?, ?, ?)
        `).run(cv_id, session_id, variant, JSON.stringify(cvData), Date.now());

        res.json({
            cv_id,
            cv_data: cvData,
            variant
        });

    } catch (error) {
        console.error("Generate CV Error:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:id', (req, res) => {
    try {
        const cv = db.prepare('SELECT * FROM cvs WHERE id = ?').get(req.params.id);
        if (!cv) {
             return res.status(404).json({ error: 'CV not found' });
        }
        res.json({
             id: cv.id,
             session_id: cv.session_id,
             variant: cv.variant,
             cv_data: JSON.parse(cv.cv_data),
             created_at: cv.created_at
        });
    } catch (error) {
         console.error("Get CV Error:", error);
         res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
