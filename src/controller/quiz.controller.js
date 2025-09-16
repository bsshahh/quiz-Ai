import Quiz from "../model/Quiz.model.js";
import { generateHint } from "../services/ai.services.js";
import { generateAIQuiz } from "../services/quizAI.services.js";
import redis from "../config/redisClient.config.js";

export const createAIQuiz = async (req, res) => {
  try {
    const { subject, gradeLevel, difficulty, totalQuestions, title } = req.body;
    const userId = req.user.id;

    const questions = await generateAIQuiz({
      userId,
      subject,
      gradeLevel,
      difficulty,
      totalQuestions,
    });

    const quiz = new Quiz({
      title: `AI Generated Quiz for ${subject}`,
      subject,
      gradeLevel,
      difficulty,
      totalQuestions,
      maxScore: totalQuestions,
      questions,
      createdBy: req.user.id,
    });

    await quiz.save();

    await redis.del("quizzes:all");

    const sanitizedQuiz = quiz.toObject();
    sanitizedQuiz.questions = sanitizedQuiz.questions.map((q) => {
      const { answer, ...rest } = q;
      return rest;
    });

    res.status(201).json({
      message: "AI-generated quiz created successfully",
      quiz: sanitizedQuiz,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create AI-generated quiz",
      error: error.message,
    });
  }
};

// GET /quizzes
export const getQuizzes = async (req, res) => {
  try {
    const filters = {};

    if (req.query.gradeLevel) filters.gradeLevel = req.query.gradeLevel;
    if (req.query.subject) filters.subject = req.query.subject;
    if (req.query.difficulty) filters.difficulty = req.query.difficulty;

    const cacheKey = "quizzes:all:" + JSON.stringify(filters);

    //Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const quizzes = await Quiz.find(filters)
      .sort({ createdAt: -1 })
      .select("-questions.answer");

    await redis.setex(cacheKey, 300, JSON.stringify(quizzes));

    res.json(quizzes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /quizzes/:id
export const getQuizById = async (req, res) => {
  try {
    const cacheKey = `quiz:${req.params.id}`;

    //Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const quiz = await Quiz.findById(req.params.id).select("-questions.answer");
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    const sanitizedQuiz = quiz.toObject();
    sanitizedQuiz.questions = sanitizedQuiz.questions.map((q) => {
      const { answer, ...rest } = q;
      return rest;
    });

    await redis.setex(cacheKey, 600, JSON.stringify(sanitizedQuiz));

    res.json(sanitizedQuiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getHint = async (req, res) => {
  try {
    const { quizId, questionId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const question = quiz.questions.id(questionId);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    const hint = await generateHint(question.questionText, question.answer);

    res.json({
      questionId,
      hint,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error generating hint", error: err.message });
  }
};
