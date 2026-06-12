import express from "express";
import { Campaigns } from "../bbdd/campaign.js";
import { Characters } from "../bbdd/character.js";

export const router = express.Router();

router.get("/", async (req, res, next) => {
  try {

    const { userId, campaignId } = req.query;
    const campaign = Campaigns.find(({ id }) => id === campaignId);
    if (!campaign) {
      return res.status(404).json({
        status: 404,
        message: "Resource not found",
        data: {},
      });
    }
    const character = Characters.find(({ member, campaign }) => {
      return member === userId && campaign === campaignId;
    });
    if (!character) {
      return res.status(404).json({
        status: 404,
        message: "Resource not found",
        data: {},
      });
    }



    return res.status(200).json({
      status: 200,
      message: "Success",
      data: { id: character.id },
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 500,
      message: err,
      data: {}
    });
  }
});

