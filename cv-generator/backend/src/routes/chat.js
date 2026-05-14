import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { processChat } from '../services/cvBuilder.js';
import { calculateCompleteness } from '../services/completeness.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        let { session_id, message } = req.body;
        let session;

        if (!session_id) {
            session_id = uuidv4();
            session = {
                id: session_id,
                created_at: Date.now(),
                updated_at: Date.now(),
                messages: JSON.stringify([]),
                cv_json: null,
                completeness_score: 0,
                is_complete: 0
            };
            db.prepare(`
                INSERT INTO sessions (id, created_at, updated_at, messages, completeness_score, is_complete)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(session.id, session.created_at, session.updated_at, session.messages, session.completeness_score, session.is_complete);
        } else {
            session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(session_id);
            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }
        }

        const messages = JSON.parse(session.messages || '[]');
        messages.push({ role: 'user', content: message });

        const cvData = session.cv_json ? JSON.parse(session.cv_json) : null;

        const aiResult = await processChat(messages, cvData);
        const { reply, cv_json: newCvJson } = aiResult;

        messages.push({ role: 'ai', content: reply });

        const completeness = calculateCompleteness(newCvJson);

        db.prepare(`
            UPDATE sessions
            SET updated_at = ?, messages = ?, cv_json = ?, completeness_score = ?, is_complete = ?
            WHERE id = ?
        `).run(
            Date.now(),
            JSON.stringify(messages),
            JSON.stringify(newCvJson),
            completeness.score,
            completeness.score >= 70 ? 1 : 0,
            session_id
        );

        res.json({
            session_id,
            reply,
            cv_json: newCvJson,
            completeness_score: completeness.score,
            is_ready_to_generate: completeness.score >= 70,
            missing_fields: completeness.missing_fields
        });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
