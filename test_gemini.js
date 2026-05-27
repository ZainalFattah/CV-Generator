import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'fake_key');
const model = genAI.getGenerativeModel({
  model: "gemini-3.5-flash",
  tools: [
    {
      googleSearch: {}
    }
  ]
});
console.log("Config OK");
