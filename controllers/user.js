import { Campaigns } from "../bbdd/campaign.js";
import { Members } from "../bbdd/member.js";

import jwt from "jsonwebtoken";


export const getUserData = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    const userId = jwt.decode(token).id;


    const member = Members.find(({ id }) => userId === id);
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
        id: userId,
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
};