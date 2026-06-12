import express from "express";
import { Sessions } from "../bbdd/session.js";
import { Campaigns } from "../bbdd/campaign.js";
import { Characters } from "../bbdd/character.js";

export const router = express.Router();

router.get("/:sessionId", async (req, res, next) => {
  try {

    const { sessionId } = req.params;
    const session = Sessions.find(({ id }) => id === sessionId);

    const campaign = Campaigns.find(({ id }) => id === session?.campaign);
    const author = Characters.find(({ id }) => id === session?.author);


    if (!session || !campaign || !author) {
      return res.status(404).json({
        status: 404,
        message: "Resource not found",
        data: {},
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: { ...session, campaign, author },
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

router.get("/last/:n", async (req, res, next) => {
  try {

    const { n } = req.params;
    const number = Math.min(Number(n), 10);
    const sessions = Sessions.toSorted(
      (a, b) => {
        return a.date < b.date ? 1 : -1;
      }
    ).slice(0, number)
      .map(s => {
        return {
          id: s.id,
          title: s.title,
          campaign: Campaigns.find(({ id }) => id === s.campaign)?.short ?? "-",
          number: s.number
        };
      });


    return res.status(200).json({
      status: 200,
      message: "Success",
      data: sessions,
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

