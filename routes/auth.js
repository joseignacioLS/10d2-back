import express from "express";

import jwt from "jsonwebtoken";
import { login, logout, refresh, register } from "../controllers/auth.js";

export const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/refresh", refresh);
router.post("/logout", logout);