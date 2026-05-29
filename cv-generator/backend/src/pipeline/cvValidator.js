export function validateCVData(extractedData) {
    const report = {
        timeline_inconsistencies: [],
        impossible_overlaps: [],
        duplicated_claims: [],
        validation_notes: []
    };

    if (!extractedData.experience) return report;

    // Simple heuristic to check for impossible date overlaps or timelines
    const currentYear = new Date().getFullYear();

    extractedData.experience.forEach((exp, index) => {
        if (exp.start_date && exp.end_date) {
            try {
                const startYear = parseInt(exp.start_date.substring(0, 4));
                const endYear = exp.end_date.toLowerCase() === 'present' ? currentYear : parseInt(exp.end_date.substring(0, 4));

                if (startYear > endYear) {
                    report.timeline_inconsistencies.push(`Role '${exp.role}' ends before it starts (${exp.start_date} to ${exp.end_date})`);
                }

                if (endYear > currentYear) {
                    report.timeline_inconsistencies.push(`Role '${exp.role}' ends in the future (${endYear})`);
                }
            } catch (e) {
                // Ignore parse errors
            }
        }

        // Find exact duplicates
        for (let i = index + 1; i < extractedData.experience.length; i++) {
             const other = extractedData.experience[i];
             if (exp.company === other.company && exp.role === other.role && exp.start_date === other.start_date) {
                 report.duplicated_claims.push(`Duplicate experience entry: ${exp.role} at ${exp.company}`);
             }
        }
    });

    return report;
}
