import express from "express";
import { checkAnnotationPermission, editCampaign, getCampaignById, getRecentCampaigns } from "../controllers/campaign.js";
import { authenticateToken, isGMOfCampaign } from "../middleware/auth.js";

export const router = express.Router();

router.get("/:campaignId", getCampaignById);
router.get("/last/:n", getRecentCampaigns);
router.get("/permission/:campaignId", authenticateToken, checkAnnotationPermission);
router.put("/", authenticateToken, isGMOfCampaign, editCampaign);

