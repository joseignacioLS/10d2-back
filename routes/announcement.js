import express from "express";
import { getAllAnnouncements } from "../controllers/announcement.js";

export const router = express.Router();

router.get("/", getAllAnnouncements);
