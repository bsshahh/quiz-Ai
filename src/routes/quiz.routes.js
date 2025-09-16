import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import {  getQuizzes, getQuizById, getHint, createAIQuiz } from "../controller/quiz.controller.js";

const router = express.Router();

router.post("/generate", verifyToken, createAIQuiz);
router.get("/", verifyToken, getQuizzes);           
router.get("/:id", verifyToken, getQuizById);      
router.get("/:quizId/questions/:questionId/hint", verifyToken, getHint);


export default router;
