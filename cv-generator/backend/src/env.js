import dotenv from 'dotenv';

dotenv.config();

// Environment validation
if (!process.env.GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY is missing.");
    process.exit(1);
}
