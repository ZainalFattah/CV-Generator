export function validateRecruiterSchema(data) {
  if (!data || typeof data !== 'object') {
    return { reply: "I'm sorry, I couldn't process that.", cv_json: null };
  }
  return data;
}
