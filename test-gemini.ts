import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return console.log("No API key");
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTest = [
    "gemini-2.0-flash", 
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-pro-latest"
  ];
  
  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Test");
      console.log(`✅ Success with ${modelName}! Response length: ${result.response.text().length}`);
      return; // Stop on first success
    } catch (e: any) {
      console.log(`❌ Failed with ${modelName}: ${e.status} - ${e.message.substring(0, 100)}...`);
    }
  }
}

test();
