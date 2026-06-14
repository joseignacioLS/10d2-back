import express from "express";
import { getCampaignById, getRecentCampaigns } from "../controllers/campaign.js";

export const router = express.Router();

router.get("/:campaignId", getCampaignById);
router.get("/last/:n", getRecentCampaigns);


