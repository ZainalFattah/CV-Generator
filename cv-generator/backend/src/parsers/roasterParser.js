import { validateRoasterSchema } from '../validators/roasterSchema.js';

export function parseRoasterResponse(responseText) {
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in response");
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return validateRoasterSchema(parsed);
  } catch (error) {
    console.error("Roaster Parser Error:", error);
    throw error;
  }
}
