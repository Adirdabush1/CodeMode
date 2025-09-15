import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// --- הגדרות ---
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const database = client.db("codeModeDB");
    const questionsCollection = database.collection("questions");

    // קריאת הקובץ JSON
    const filePath = path.join(process.cwd(), "server", "data", "questions", "questions.json");
    const questionsData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // המרה למערך אחד עם שדה language
    // המרה למערך אחד עם שדה language קטן
    const questionsArray = Object.entries(questionsData).flatMap(([language, questions]) =>
      questions.map(q => ({ ...q, language: language.toLowerCase() }))
    );


    // קבלת כל השאלות הקיימות
    const existingQuestions = await questionsCollection.find({}, { projection: { name: 1, language: 1 } }).toArray();

    // סינון שאלות חדשות בלבד
    const newQuestions = questionsArray.filter(q => {
      return !existingQuestions.some(eq => eq.name === q.title && eq.language === q.language);
    });

    if (newQuestions.length === 0) {
      console.log("ℹ️ No new questions to insert");
      return;
    }

    // הכנסת שאלות חדשות
    const result = await questionsCollection.insertMany(
      newQuestions.map(q => ({
        name: q.title,
        description: q.description,
        difficulty: q.difficulty,
        tags: q.tags,
        examples: q.examples,
        language: q.language,
      }))
    );

    console.log(`✅ Inserted ${result.insertedCount} new questions`);
  } catch (err) {
    console.error("❌ Error seeding questions:", err);
  } finally {
    await client.close();
  }
}

run();
