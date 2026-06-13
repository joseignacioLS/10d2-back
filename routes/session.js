import express from "express";
import jwt from "jsonwebtoken";
import { Sessions } from "../bbdd/session.js";
import { Campaigns } from "../bbdd/campaign.js";
import { Characters } from "../bbdd/character.js";
import { Temporal } from "temporal-polyfill/impl";
import { authenticateToken } from "../middleware/auth.js";

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

router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const userId = jwt.decode(req.cookies.token).id;
    const { campaign: campaignId, title, summary, number, date } = req.body;

    const campaign = Campaigns.find(({ id }) => id === campaignId);

    const author = campaign.characters.find(characterId => {
      return Characters.find(({ id, member }) => characterId === id && member === userId);
    });

    if (!author) {
      return res.status(404).json({
        status: 404,
        message: "Author not found",
        data: null,
      });
    }

    const id = Temporal.Now.instant().toString() + campaignId + userId;

    campaign.sessions.unshift(id);
    campaign.lastActivity = Temporal.Now.plainDateISO().toString();

    const newSession = {
      id,
      campaign: campaignId,
      number,
      title,
      author,
      date: Temporal.PlainDate.from(date).toString(),
      summary: {
        text: summary,
        annotations: [],
        comments: []
      }
    };

    Sessions.unshift(newSession);

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: id,
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

