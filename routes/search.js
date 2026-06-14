import express from "express";
import { search } from "../controllers/search.js";

export const router = express.Router();

router.get("/:query", search);

