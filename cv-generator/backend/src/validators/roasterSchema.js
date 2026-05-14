export function validateRoasterSchema(data) {
  if (!data || typeof data !== 'object') {
    throw new Error("Invalid schema");
  }
  return data;
}
