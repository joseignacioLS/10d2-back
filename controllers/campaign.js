import { Campaigns } from "../bbdd/campaign.js";
import { Characters } from "../bbdd/character.js";
import { Members } from "../bbdd/member.js";
import { Sessions } from "../bbdd/session.js";

import jwt from "jsonwebtoken";

export const getCampaignById = async (req, res, next) => {
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

    const members = campaign.members
      .map(({ memberId, chrId, role }) => {
        const character = Characters.find(({ id }) => chrId === id);
        if (!character) return null;
        const member = Members.find(({ id }) => memberId === id);
        if (!member) return null;
        return {
          id: chrId,
          name: member.name,
          character: {
            id: character.id,
            name: character.name,
            role
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
        members,
        sessions,
        nextSession: campaign.nextSession,
        GM: campaign.GM
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
};

export const getRecentCampaigns = async (req, res, next) => {
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
};



export const checkAnnotationPermission = async (req, res, next) => {
  try {

    const { campaignId } = req.params;
    const userId = jwt.decode(req.cookies.token).id;

    const campaign = Campaigns.find(({ id }) => campaignId === id);

    if (!campaign) {
      return res.status(404).json({
        status: 404,
        message: "Resource not found",
        data: null
      });
    }

    const canAnnotate = campaign.members.find(({ memberId }) => memberId === userId) !== undefined;

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: canAnnotate,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 500,
      message: err,
      data: {}
    });
  }
};