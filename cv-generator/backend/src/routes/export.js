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
        const doc = new PDFDocument({
            margin: 45, // 40-50px equivalent
            autoFirstPage: true
        });

        // Setup common text options for line height 1.4-1.6
        const textOptions = { lineGap: 4 };

        // Pipe its output to response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="cv-export.pdf"`);
        doc.pipe(res);

        // Helper to draw section titles
        const drawSectionTitle = (title) => {
            doc.moveDown(1.5);
            doc.font('Helvetica-Bold').fontSize(13).text(title.toUpperCase(), { ...textOptions, align: 'left' });
            // Add a small underline for section titles
            const x = doc.x;
            const y = doc.y;
            doc.moveTo(x, y - 2).lineTo(x + doc.page.width - doc.page.margins.left - doc.page.margins.right, y - 2).lineWidth(0.5).stroke();
            doc.moveDown(0.5);
        };

        // --- Render CV Data to PDF ---

        // 1. HEADER (Personal Info)
        if (cvData.personal) {
            doc.font('Helvetica-Bold').fontSize(26).text(cvData.personal.name || 'Untitled CV', { align: 'center', lineGap: 6 });

            const contactInfo = [
                cvData.personal.email,
                cvData.personal.phone,
                cvData.personal.city,
                cvData.personal.linkedin,
                cvData.personal.portfolio
            ].filter(Boolean).join('  |  ');

            doc.font('Helvetica').fontSize(10).text(contactInfo, { align: 'center', ...textOptions });
            doc.moveDown(0.5);

            if (cvData.personal.summary) {
                drawSectionTitle('Professional Summary');
                doc.font('Helvetica').fontSize(10).text(cvData.personal.summary, { ...textOptions, align: 'justify' });
            }
        }

        // 2. EXPERIENCE
        if (cvData.experience && cvData.experience.length > 0) {
            drawSectionTitle('Experience');

            cvData.experience.forEach((exp, index) => {
                // Position and Company/Date on the same visual block
                doc.font('Helvetica-Bold').fontSize(11).text(exp.position || '', { continued: true });
                doc.font('Helvetica').fontSize(11).text(exp.company ? `  |  ${exp.company}` : '', { continued: true });

                // Align date to the right if possible, or just append
                const dateStr = `${exp.start || ''} - ${exp.end || (exp.current ? 'Present' : '')}`;
                doc.font('Helvetica').fontSize(10).text(`    ${dateStr}`, { align: 'right', ...textOptions });
                doc.moveDown(0.2);

                const renderBullets = (items) => {
                    if (items && items.length > 0) {
                        items.forEach(item => {
                            doc.font('Helvetica').fontSize(10).text(`•  ${item}`, {
                                indent: 15,
                                ...textOptions,
                                align: 'justify'
                            });
                        });
                    }
                };

                renderBullets(exp.responsibilities);
                renderBullets(exp.achievements);

                if (index < cvData.experience.length - 1) {
                    doc.moveDown(0.8);
                }
            });
        }

        // 3. EDUCATION
        if (cvData.education && cvData.education.length > 0) {
            drawSectionTitle('Education');

            cvData.education.forEach((edu, index) => {
                doc.font('Helvetica-Bold').fontSize(11).text(edu.institution || '', { continued: true });
                const dateStr = `${edu.year_start || ''} - ${edu.year_end || ''}`;
                doc.font('Helvetica').fontSize(10).text(`    ${dateStr}`, { align: 'right', ...textOptions });

                doc.font('Helvetica').fontSize(10).text(`${edu.degree || ''} in ${edu.field || ''}`, { ...textOptions });

                if (edu.gpa) {
                     doc.font('Helvetica').fontSize(10).text(`GPA: ${edu.gpa}`, { ...textOptions });
                }

                if (edu.achievements && edu.achievements.length > 0) {
                    doc.moveDown(0.2);
                    edu.achievements.forEach(ach => {
                        doc.font('Helvetica').fontSize(10).text(`•  ${ach}`, { indent: 15, ...textOptions });
                    });
                }

                if (index < cvData.education.length - 1) {
                    doc.moveDown(0.8);
                }
            });
        }

        // 4. PROJECTS
        if (cvData.projects && cvData.projects.length > 0) {
            drawSectionTitle('Projects');

            cvData.projects.forEach((proj, index) => {
                 doc.font('Helvetica-Bold').fontSize(11).text(proj.name || '', { continued: true });
                 if (proj.url) {
                     doc.font('Helvetica').fontSize(10).fillColor('blue').text(`    ${proj.url}`, { link: proj.url, underline: true, align: 'right', ...textOptions });
                     doc.fillColor('black'); // Reset
                 } else {
                     doc.text(' ', { align: 'right', ...textOptions }); // Just to close continued
                 }
                 doc.moveDown(0.2);

                 if (proj.description) {
                    doc.font('Helvetica').fontSize(10).text(proj.description, { ...textOptions, align: 'justify' });
                 }

                 if (proj.tech_stack && proj.tech_stack.length > 0) {
                     doc.font('Helvetica-Bold').fontSize(10).text(`Tech Stack: `, { continued: true, ...textOptions });
                     doc.font('Helvetica').fontSize(10).text(proj.tech_stack.join(', '));
                 }

                 if (proj.impact) {
                    doc.font('Helvetica-Bold').fontSize(10).text(`Impact: `, { continued: true, ...textOptions });
                    doc.font('Helvetica').fontSize(10).text(proj.impact);
                 }

                 if (index < cvData.projects.length - 1) {
                    doc.moveDown(0.8);
                 }
            });
        }

        // 5. SKILLS
        if (cvData.skills && (cvData.skills.technical?.length || cvData.skills.soft?.length || cvData.skills.languages?.length)) {
            drawSectionTitle('Skills');

            if (cvData.skills.technical && cvData.skills.technical.length > 0) {
                 doc.font('Helvetica-Bold').fontSize(10).text(`Technical: `, { continued: true, ...textOptions });
                 doc.font('Helvetica').fontSize(10).text(cvData.skills.technical.join(', '));
            }
            if (cvData.skills.soft && cvData.skills.soft.length > 0) {
                 doc.font('Helvetica-Bold').fontSize(10).text(`Soft Skills: `, { continued: true, ...textOptions });
                 doc.font('Helvetica').fontSize(10).text(cvData.skills.soft.join(', '));
            }
            if (cvData.skills.languages && cvData.skills.languages.length > 0) {
                 doc.font('Helvetica-Bold').fontSize(10).text(`Languages: `, { continued: true, ...textOptions });
                 doc.font('Helvetica').fontSize(10).text(cvData.skills.languages.join(', '));
            }
        }

        // 6. CERTIFICATIONS
        if (cvData.certifications && cvData.certifications.length > 0) {
            drawSectionTitle('Certifications');
            cvData.certifications.forEach(cert => {
                doc.font('Helvetica-Bold').fontSize(10).text(cert.name || '', { continued: true });
                const certInfo = [cert.issuer, cert.year].filter(Boolean).join(' | ');
                doc.font('Helvetica').fontSize(10).text(certInfo ? `   -   ${certInfo}` : '', { ...textOptions });
            });
        }

        // 7. AWARDS
        if (cvData.awards && cvData.awards.length > 0) {
            drawSectionTitle('Awards');
            cvData.awards.forEach(award => {
                doc.font('Helvetica-Bold').fontSize(10).text(award.name || '', { continued: true });
                const awardInfo = [award.issuer, award.year].filter(Boolean).join(' | ');
                doc.font('Helvetica').fontSize(10).text(awardInfo ? `   -   ${awardInfo}` : '', { ...textOptions });
            });
        }

        // 8. ORGANIZATIONS
        if (cvData.organizations && cvData.organizations.length > 0) {
            drawSectionTitle('Organizations');
            cvData.organizations.forEach(org => {
                doc.font('Helvetica-Bold').fontSize(10).text(org.role || '', { continued: true });
                const orgInfo = [org.name, org.period].filter(Boolean).join(' | ');
                doc.font('Helvetica').fontSize(10).text(orgInfo ? `   -   ${orgInfo}` : '', { ...textOptions });
            });
        }

        // Finalize PDF file
        doc.end();

    } catch (error) {
        console.error("Export Error:", error);
        next(error);
    }
});

export default router;
