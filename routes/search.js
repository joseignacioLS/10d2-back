import express from "express";
import { Sessions } from "../bbdd/session.js";
import { Campaigns } from "../bbdd/campaign.js";
import { Characters } from "../bbdd/character.js";
import { authenticateToken } from "../middleware/auth.js";

export const router = express.Router();

router.get("/:query", async (req, res, next) => {
  try {

    const { query } = req.params;
    const sessions = Sessions.filter(({ title }) =>
      new RegExp(query.toLowerCase()).test(title.toLowerCase()));

    const campaigns = Campaigns.filter(({ name }) =>
      new RegExp(query.toLowerCase()).test(name.toLowerCase()),
    );

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: { sessions, campaigns },
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

