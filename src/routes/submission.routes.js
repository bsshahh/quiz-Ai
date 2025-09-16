import express from "express";
import { submitQuiz, getHistory, oldSubmissions } from "../controller/submission.controller.js";
import {verifyToken} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/submit", verifyToken, submitQuiz);
router.get("/history", verifyToken, getHistory);
router.post("/retry", verifyToken, submitQuiz);
router.get("/oldsubmissions",verifyToken,oldSubmissions);

export default router;
