import express from "express";
import { checkAnnotationPermission, getCampaignById, getRecentCampaigns } from "../controllers/campaign.js";
import { authenticateToken } from "../middleware/auth.js";

export const router = express.Router();

router.get("/:campaignId", getCampaignById);
router.get("/last/:n", getRecentCampaigns);
router.get("/permission/:campaignId", authenticateToken, checkAnnotationPermission);

