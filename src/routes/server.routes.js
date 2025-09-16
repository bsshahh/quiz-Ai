import express from "express";

import authRoutes from "./auth.routes.js";
import quizRoutes from "./quiz.routes.js";
import submissionRoutes from "./submission.routes.js";
import leaderboardRoutes from "./leaderboard.routes.js"
// import hintRoutes from "./hint.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/quizzes", quizRoutes);
router.use("/submissions", submissionRoutes);
router.use("/leaderboard",leaderboardRoutes);
// router.use("/hints", hintRoutes);

export default router;
