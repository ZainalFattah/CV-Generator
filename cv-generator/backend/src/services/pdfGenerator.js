import PDFDocument from 'pdfkit';

export function generatePDF(cvData, template = 'modern') {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            if (template === 'modern') {
                renderModernTemplate(doc, cvData);
            } else {
                renderClassicTemplate(doc, cvData);
            }

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

function renderModernTemplate(doc, cvData) {
    const { personal, education, experience, projects, skills } = cvData;

    // Personal Info
    if (personal) {
        doc.fontSize(24).font('Helvetica-Bold').text(personal.name || 'Nama Tidak Diketahui', { align: 'center' });
        doc.fontSize(10).font('Helvetica').text(\`\${personal.email || ''} | \${personal.phone || ''} | \${personal.city || ''}\`, { align: 'center' });
        if (personal.linkedin || personal.portfolio) {
             doc.text(\`\${personal.linkedin || ''} | \${personal.portfolio || ''}\`, { align: 'center' });
        }
        doc.moveDown();
        if (personal.summary) {
             doc.fontSize(11).font('Helvetica').text(personal.summary);
             doc.moveDown();
        }
    }

    doc.lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // Experience
    if (experience && experience.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('EXPERIENCE');
        doc.moveDown(0.5);
        experience.forEach(exp => {
            doc.fontSize(12).font('Helvetica-Bold').text(exp.position || '');
            doc.fontSize(10).font('Helvetica-Oblique').text(\`\${exp.company || ''} | \${exp.start || ''} - \${exp.end || (exp.current ? 'Present' : '')}\`);

            if (exp.responsibilities && exp.responsibilities.length > 0) {
                 exp.responsibilities.forEach(res => {
                     doc.fontSize(10).font('Helvetica').text(\`• \${res}\`, { indent: 15 });
                 });
            }
            if (exp.achievements && exp.achievements.length > 0) {
                 exp.achievements.forEach(ach => {
                     doc.fontSize(10).font('Helvetica-Bold').text(\`• \${ach}\`, { indent: 15 });
                 });
            }
            doc.moveDown(0.5);
        });
    }

    // Education
    if (education && education.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('EDUCATION');
        doc.moveDown(0.5);
        education.forEach(edu => {
             doc.fontSize(12).font('Helvetica-Bold').text(edu.institution || '');
             doc.fontSize(10).font('Helvetica-Oblique').text(\`\${edu.degree || ''} in \${edu.field || ''} | \${edu.year_start || ''} - \${edu.year_end || ''}\`);
             if (edu.gpa) {
                 doc.fontSize(10).font('Helvetica').text(\`GPA: \${edu.gpa}\`);
             }
             doc.moveDown(0.5);
        });
    }

    // Skills
    if (skills) {
        doc.fontSize(14).font('Helvetica-Bold').text('SKILLS');
        doc.moveDown(0.5);
        if (skills.technical && skills.technical.length > 0) {
            doc.fontSize(10).font('Helvetica-Bold').text(\`Technical: \`, { continued: true }).font('Helvetica').text(skills.technical.join(', '));
        }
        if (skills.soft && skills.soft.length > 0) {
            doc.fontSize(10).font('Helvetica-Bold').text(\`Soft: \`, { continued: true }).font('Helvetica').text(skills.soft.join(', '));
        }
        if (skills.languages && skills.languages.length > 0) {
            doc.fontSize(10).font('Helvetica-Bold').text(\`Languages: \`, { continued: true }).font('Helvetica').text(skills.languages.join(', '));
        }
        doc.moveDown(0.5);
    }
}

function renderClassicTemplate(doc, cvData) {
    // Similar to modern but maybe different fonts/layout
    renderModernTemplate(doc, cvData);
}
