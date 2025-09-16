import express from "express";
import { login } from "../controller/auth.controller.js";

const router = express.Router();

// POST /auth/login
router.post("/login", login);

export default router;
