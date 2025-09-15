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

    const database = client.db("test");
    const questionsCollection = database.collection("questions");

    // --- ניהול אינדקסים ---
    try {
      // מוחק את כל האינדקסים הקיימים
      await questionsCollection.dropIndexes();
      console.log("🗑️ Dropped all existing indexes");
    } catch (e) {
      console.log("ℹ️ No indexes to drop or error ignoring:", e.message);
    }

    // יצירת אינדקסים חדשים
    await questionsCollection.createIndex({ programmingLanguage: 1 });
    await questionsCollection.createIndex({ difficulty: 1 });
    await questionsCollection.createIndex({ tags: 1 });
    // אינדקס מורכב על שפה + רמת קושי
    await questionsCollection.createIndex({ programmingLanguage: 1, difficulty: 1 });
    console.log("✅ Indexes ensured (programmingLanguage, difficulty, tags, compound)");

    // --- קריאת הקובץ JSON ---
    const filePath = path.join(process.cwd(), "server", "data", "questions", "questions.json");
    const questionsData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // המרה למערך אחד עם שדה programmingLanguage קטן
    const questionsArray = Object.entries(questionsData).flatMap(([language, questions]) =>
      questions.map(q => ({ ...q, programmingLanguage: language.toLowerCase() }))
    );

    // קבלת כל השאלות הקיימות
    const existingQuestions = await questionsCollection.find({}, { projection: { name: 1, programmingLanguage: 1 } }).toArray();

    // סינון שאלות חדשות בלבד
    const newQuestions = questionsArray.filter(q => {
      return !existingQuestions.some(eq => eq.name === q.title && eq.programmingLanguage === q.programmingLanguage);
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
        programmingLanguage: q.programmingLanguage,
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
