import express from "express";
import { login, logout, refresh, register } from "../controllers/auth.js";
import { authenticateToken } from "../middleware/auth.js";

export const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/refresh", authenticateToken, refresh);
router.post("/logout", logout);