import express from "express";
import { getCharacterById } from "../controllers/character.js";

export const router = express.Router();

router.get("/:characterId", getCharacterById);

