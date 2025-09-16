import {Groq} from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();
const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Generate Improvement/suggestions for quiz answers
export const generateAISuggestions = async (quiz, evaluatedResponses) => {
    try {
        // Collect wrong answers
        const wrongAnswers = evaluatedResponses
        .filter((r) => !r.isCorrect)
        .map((r) => {
            const question = quiz.questions.find((q) => q._id.equals(r.questionId));
            return `Q: ${question?.questionText}
    Your Answer: ${r.userResponse}
    Correct Answer: ${question?.answer}`;
        });

        if (wrongAnswers.length === 0) {
        return ["Great job! All answers are correct 🎉"];
        }

        const prompt = `
    You are an AI tutor.
    Here are the wrong answers from a quiz:

    ${wrongAnswers.join("\n\n")}

    Please give short, helpful hints (1–2 sentences each) to guide the student.
    `;
            
        const response = await client.chat.completions.create({
        model: process.env.GROQ_MODEL1, // fast free model
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        });
        
        const text = response.choices[0].message.content.trim();
               

        return text.split("\n").filter((line) => line.length > 0);
    } catch (error) {
        console.error("AI Suggestion Error:", error);
        return ["Could not generate suggestions at this time."];
    }
};

// Generate Hint
export const generateHint = async (questionText, answer) => {
    try {
        const prompt = `
    You are a quiz assistant.
    The student is struggling with this question:
    "${questionText}"

    Do NOT give the answer directly.
    Instead, give a single short hint (1–2 sentences) that helps the student think.
        `;

        const response = await client.chat.completions.create({
        model: process.env.GROQ_MODEL1,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error("AI hint error:", error.message);
        return "Could not generate a hint right now.";
    }
};

export const evaluateWithAI = async (quiz, responses) => {
  try {
    const prompt = `
You are an AI quiz evaluator. 
IMPORTANT RULES:
1. Student responses are ALWAYS given in A/B/C/D format.
2. Mapping of options:
   - A = options[0]
   - B = options[1]
   - C = options[2]
   - D = options[3]
3. Do NOT output option text in the results. Always return only A/B/C/D in "userResponse".
4. To check correctness:
   - Convert student's A/B/C/D to option text internally.
   - Compare that text with the correct answer.
   - If they match → isCorrect = true.
   - Else → isCorrect = false.
5. Scoring:
   - Each question contributes equally: quiz.maxScore / quiz.totalQuestions.
   - Final "score" is the sum of marks for correct answers.
6. Output must be STRICT JSON only. No explanations, no markdown.
- Do NOT include \`\`\`json or \`\`\`.

Quiz Metadata:
- Max Score: ${quiz.maxScore}
- Total Questions: ${quiz.totalQuestions}
Quiz Questions:
${quiz.questions.map(q => `
QID: ${q._id}
Q: ${q.questionText}

Options: 
A) ${q.options[0]}
B) ${q.options[1]}
C) ${q.options[2]}
D) ${q.options[3]}
Correct Answer: ${q.answer}
`).join("\n")}

Student Responses:
${responses.map(r => `
QID: ${r.questionId}
Student Answer: ${r.userResponse}
`).join("\n")}


Output Format Example (must match exactly):

{
  "evaluatedResponses": [
    { "questionId": "12345", "userResponse": "A", "isCorrect": true },
    { "questionId": "67890", "userResponse": "C", "isCorrect": false }
  ],
  "score": 5
}
    `;
   
    const response = await client.chat.completions.create({
      model: process.env.GROQ_MODEL2,
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 800
    });
    
    return JSON.parse(response.choices[0].message.content.trim());

  } catch (err) {
    console.error("AI Eval Error:", err);

    // for Manual checking when AI not working 
    let score = 0;
    const letterToIndex = { A: 0, B: 1, C: 2, D: 3 };
    const evaluatedResponses = quiz.questions.map((q) => {
      const userResponse = responses.find(r => String(r.questionId) === String(q._id));

  let isCorrect = false;
  if (userResponse && letterToIndex[userResponse.userResponse] !== undefined) {
    const chosenOption = q.options[letterToIndex[userResponse.userResponse]];
    isCorrect = chosenOption === q.answer;
  }
      if (isCorrect) score++;
      return {
        questionId: q._id,
        userResponse: userResponse ? userResponse.userResponse : null,
        isCorrect
      };
    });

    const scaledScore = Math.round((score / quiz.totalQuestions) * quiz.maxScore);
    return { evaluatedResponses, score: scaledScore };
  }
};
