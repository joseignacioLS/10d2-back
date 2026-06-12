import express from "express";
import { Sessions } from "../bbdd/session.js";
import { Campaigns } from "../bbdd/campaign.js";
import { Characters } from "../bbdd/character.js";
import { Members } from "../bbdd/member.js";

export const router = express.Router();


router.get("/:token", async (req, res, next) => {
  try {

    const { token } = req.params;


    const member = Members.find(({ id }) => "m0" === id);
    if (!member) return res.status(404).json({
      status: 404,
      message: "login error",
      data: {},
    });


    const campaigns = member.campaigns.map((campaignId) => {
      return Campaigns.find(({ id }) => id === campaignId);
    }).filter(v => v !== undefined);

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: {
        id: "m0",
        username: member.name,
        campaigns,
        subscriptions: member.subscriptions
      }
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


router.post("/login", async (req, res, next) => {
  try {

    const { user, password } = req.body;


    if (password !== "bocadillo" || !Members.find(({ name }) => name === user)) {
      return res.status(404).json({
        status: 404,
        message: "login error",
        data: {},
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6ImQ2YTczOGEzOWUwZmNiMGFhZjU0NDlmYTUwNGQxMzJmIn0.eyJpZCI6Im0wIiwidXNlcm5hbWUiOiJXaXROaW1yb3MifQ.Qo - BgbcWoxdpoHP2RKa28OqQuadTbqievPyEgWs0Nml0l9XWqNw2Ba_glNxwIxWvVAPf9A_y25joUTuHCyGhLg",
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
