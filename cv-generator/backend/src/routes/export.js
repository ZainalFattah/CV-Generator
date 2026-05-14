import express from 'express';
import PDFDocument from 'pdfkit';

const router = express.Router();

router.post('/', async (req, res, next) => {
    try {
        const { cv_json } = req.body;

        if (!cv_json) {
            return res.status(400).json({ error: 'cv_json is required' });
        }

        let cvData = cv_json;
        if (typeof cvData === 'string') {
            try {
                cvData = JSON.parse(cvData);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid CV data format' });
            }
        }

        // Initialize PDF Document
        const doc = new PDFDocument({ margin: 50 });

        // Pipe its output to response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="cv-export.pdf"`);
        doc.pipe(res);

        // --- Render CV Data to PDF ---

        // 1. Personal Info
        if (cvData.personal) {
            doc.fontSize(24).text(cvData.personal.name || 'Untitled CV', { align: 'center' });
            doc.moveDown(0.5);

            const contactInfo = [
                cvData.personal.email,
                cvData.personal.phone,
                cvData.personal.city,
                cvData.personal.linkedin
            ].filter(Boolean).join(' | ');

            doc.fontSize(10).text(contactInfo, { align: 'center' });
            doc.moveDown(1);

            if (cvData.personal.summary) {
                doc.fontSize(12).text('Professional Summary', { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(10).text(cvData.personal.summary);
                doc.moveDown(1);
            }
        }

        // 2. Experience
        if (cvData.experience && cvData.experience.length > 0) {
            doc.fontSize(12).text('Experience', { underline: true });
            doc.moveDown(0.5);
            cvData.experience.forEach(exp => {
                doc.fontSize(11).font('Helvetica-Bold').text(`${exp.position || ''} at ${exp.company || ''}`);
                doc.fontSize(10).font('Helvetica').text(`${exp.start || ''} - ${exp.end || (exp.current ? 'Present' : '')}`);

                if (exp.responsibilities && exp.responsibilities.length > 0) {
                    doc.moveDown(0.2);
                    exp.responsibilities.forEach(resp => {
                        doc.text(`• ${resp}`, { indent: 15 });
                    });
                }
                if (exp.achievements && exp.achievements.length > 0) {
                     exp.achievements.forEach(ach => {
                        doc.text(`• ${ach}`, { indent: 15 });
                    });
                }
                doc.moveDown(0.5);
            });
            doc.moveDown(0.5);
        }

        // 3. Education
        if (cvData.education && cvData.education.length > 0) {
            doc.fontSize(12).font('Helvetica').text('Education', { underline: true });
            doc.moveDown(0.5);
            cvData.education.forEach(edu => {
                doc.fontSize(11).font('Helvetica-Bold').text(`${edu.institution || ''}`);
                doc.fontSize(10).font('Helvetica').text(`${edu.degree || ''} in ${edu.field || ''} | ${edu.year_start || ''} - ${edu.year_end || ''}`);
                if (edu.gpa) {
                     doc.text(`GPA: ${edu.gpa}`);
                }
                doc.moveDown(0.5);
            });
            doc.moveDown(0.5);
        }

        // 4. Skills
        if (cvData.skills) {
            doc.fontSize(12).font('Helvetica').text('Skills', { underline: true });
            doc.moveDown(0.5);
            if (cvData.skills.technical && cvData.skills.technical.length > 0) {
                 doc.fontSize(10).text(`Technical: ${cvData.skills.technical.join(', ')}`);
            }
            if (cvData.skills.soft && cvData.skills.soft.length > 0) {
                 doc.text(`Soft Skills: ${cvData.skills.soft.join(', ')}`);
            }
            if (cvData.skills.languages && cvData.skills.languages.length > 0) {
                 doc.text(`Languages: ${cvData.skills.languages.join(', ')}`);
            }
            doc.moveDown(1);
        }

        // 5. Projects
        if (cvData.projects && cvData.projects.length > 0) {
            doc.fontSize(12).text('Projects', { underline: true });
            doc.moveDown(0.5);
            cvData.projects.forEach(proj => {
                 doc.fontSize(11).font('Helvetica-Bold').text(proj.name || '');
                 doc.fontSize(10).font('Helvetica').text(proj.description || '');
                 if (proj.tech_stack && proj.tech_stack.length > 0) {
                     doc.text(`Stack: ${proj.tech_stack.join(', ')}`);
                 }
                 doc.moveDown(0.5);
            });
            doc.moveDown(0.5);
        }

        // Finalize PDF file
        doc.end();

    } catch (error) {
        console.error("Export Error:", error);
        next(error);
    }
});

export default router;
