// leaderboard.routes.js
import express from "express";
import { getLeaderboard } from "../controller/leaderboard.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/",verifyToken, getLeaderboard);

export default router;
