import express from "express";
import { Campaigns } from "../bbdd/campaign.js";
import { Characters } from "../bbdd/character.js";
import { Members } from "../bbdd/member.js";
import { Sessions } from "../bbdd/session.js";

export const router = express.Router();

router.get("/:campaignId", async (req, res, next) => {
  try {

    const { campaignId } = req.params;
    const campaign = Campaigns.find(({ id }) => id === campaignId);

    if (!campaignId) {
      return res.status(404).json({
        status: 404,
        message: "Resource not found",
        data: {},
      });
    }


    const characters = campaign.characters
      .map((characterId) => {
        const character = Characters.find(({ id }) => characterId === id);
        if (!character) return null;
        const member = Members.find(({ id }) => character.member === id);
        if (!member) return null;
        return {
          id: character.id,
          name: character.name,
          member: {
            id: character.member,
            name: member.name
          }
        };
      })
      .filter((v) => v !== null);


    const sessions = campaign.sessions.map((sessionId) => {
      const session = Sessions.find(({ id }) => sessionId === id);
      if (!session) return null;
      return {
        id: session.id,
        number: session.number,
        title: session.title,
        date: session.date
      };
    }).filter(v => v !== null);


    return res.status(200).json({
      status: 200,
      message: "Success",
      data: {
        name: campaign.name,
        summary: campaign.summary,
        characters,
        sessions,
        nextSession: campaign.nextSession
      },
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
    const campaigns = Campaigns.toSorted(
      (a, b) => {
        return a.lastActivity < b.lastActivity ? 1 : -1;
      }
    ).slice(0, number)
      .map(s => {
        return {
          id: s.id,
          name: s.name,
          short: s.short
        };
      });


    return res.status(200).json({
      status: 200,
      message: "Success",
      data: campaigns,
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


