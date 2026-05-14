const REQUIRED_FIELDS = {
    'personal.name':    { weight: 15, label: 'Nama lengkap' },
    'personal.email':   { weight: 10, label: 'Email' },
    'personal.phone':   { weight: 8,  label: 'Nomor telepon' },
    'personal.city':    { weight: 5,  label: 'Kota domisili' },
    'education':        { weight: 20, label: 'Pendidikan (minimal 1)' },
    'experience':       { weight: 20, label: 'Pengalaman kerja' },
    'skills.technical': { weight: 10, label: 'Hard skills' },
    'personal.summary': { weight: 7,  label: 'Ringkasan profil' },
};

const OPTIONAL_FIELDS = {
    'personal.linkedin':    { weight: 3, label: 'LinkedIn' },
    'personal.portfolio':   { weight: 3, label: 'Portfolio/GitHub' },
    'projects':             { weight: 5, label: 'Project (min 1)' },
    'certifications':       { weight: 3, label: 'Sertifikasi' },
    'skills.soft':          { weight: 2, label: 'Soft skills' },
    'organizations':        { weight: 2, label: 'Organisasi' },
};

function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function isFieldComplete(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
}

export function calculateCompleteness(cvJson) {
    let score = 0;
    const missing_fields = [];

    if (!cvJson) {
        return { score: 0, missing_fields: Object.keys(REQUIRED_FIELDS) };
    }

    for (const [path, info] of Object.entries(REQUIRED_FIELDS)) {
        const value = getNestedValue(cvJson, path);
        if (isFieldComplete(value)) {
            score += info.weight;
        } else {
            missing_fields.push(path);
        }
    }

    // Optional fields don't contribute to the missing_fields strictly,
    // but they can boost the score up to slightly over 100 or act as padding.
    // We'll normalize to 100 max.
    for (const [path, info] of Object.entries(OPTIONAL_FIELDS)) {
        const value = getNestedValue(cvJson, path);
        if (isFieldComplete(value)) {
            score += info.weight;
        }
    }

    return {
        score: Math.min(score, 100),
        missing_fields
    };
}
