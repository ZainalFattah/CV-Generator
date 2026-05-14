import { validateRecruiterSchema } from '../validators/recruiterSchema.js';

export function parseRecruiterResponse(responseText) {
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in response");
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return validateRecruiterSchema(parsed);
  } catch (error) {
    console.error("Recruiter Parser Error:", error);
    throw error;
  }
}
