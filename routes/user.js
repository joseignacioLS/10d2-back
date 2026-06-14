import express from "express";

import { authenticateToken } from "../middleware/auth.js";
import { getUserData } from "../controllers/user.js";

export const router = express.Router();


router.get("/", authenticateToken, getUserData);



