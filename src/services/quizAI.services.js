// services/quizAI.service.js
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { getUserPastSubmissions } from "../controller/pastsubmissionfilter.js";
dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateAIQuiz = async ({ userId,subject, gradeLevel, difficulty, totalQuestions }) => {
try{

  const pastSubmissions = await getUserPastSubmissions(userId, subject, 30);

    let pastHistoryText = "No previous submissions.";
    if (pastSubmissions.length > 0) {
      pastHistoryText = pastSubmissions.map((sub, idx) => {
        const questionsText = sub.responses.map(r => {
          const question = sub.quiz.questions.find(q => String(q._id) === String(r.questionId));
          if (!question) return "";
          return `Q: ${question.questionText}
Your Answer: ${r.userResponse}
Correct Answer: ${question.answer}
Difficulty: ${question.difficulty}`;
        }).join("\n");
        return `Submission #${idx + 1}:\n${questionsText}`;
      }).join("\n\n");
    }

    const prompt = `
You are an AI quiz generator.
Create ${totalQuestions} multiple-choice questions for ${subject}, grade ${gradeLevel}.
Each question must be valid JSON with:
- "questionText": string
- "options": exactly 4 possible answers (no "A","B","C","D")
- "answer": must be one of the options
- "difficulty": easy/medium/hard
- "subject": ${subject}
- "gradeLevel": ${gradeLevel}
- Do NOT include \`\`\`json or \`\`\`.

Use the user's past submissions to balance question difficulty adaptively:
${pastHistoryText}

Example format:
[
  {
    "questionText": "What is 2 + 2?",
    "options": ["3", "4", "5", "6"],
    "answer": "4",
    "difficulty": "easy",
    "subject": "Maths",
    "gradeLevel": 2
  },
  {
    "questionText": "What is 5 - 3?",
    "options": ["1", "2", "3", "4"],
    "answer": "2",
    "difficulty": "easy",
    "subject": "Maths",
    "gradeLevel": 2
  }
]

Return an array of questions ONLY as valid JSON.
`;

    const response = await client.chat.completions.create({
      model: process.env.GROQ_MODEL1,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
    });

    const text = response.choices[0].message.content.trim();
    
    let questions;
    try {
      questions = JSON.parse(text);

    } catch (err) {
      console.error("Error parsing AI response:", text);
      throw new Error("AI did not return valid JSON");
    }

    return questions;
  } catch (error) {
    console.error("AI Quiz Error:", error);
    throw new Error("Failed to generate adaptive quiz");
  }
};
