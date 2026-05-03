import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function update() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.log("No MONGODB_URI found");
      return;
    }
    
    await mongoose.connect(MONGODB_URI);
    const { Project } = await import("./src/lib/db/models/project.model.js");
    
    await Project.updateMany({}, {
      $set: { "settings.aiModel": "gemini-2.5-flash" }
    });
    
    console.log("✅ Updated all projects to use gemini-2.5-flash!");
    await mongoose.disconnect();
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

update();
