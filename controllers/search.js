import { Campaigns } from "../bbdd/campaign.js";
import { Sessions } from "../bbdd/session.js";

export const search = async (req, res, next) => {
  try {

    const { query } = req.params;
    const fetchSessions = Sessions.filter(({ title }) =>
      new RegExp(query.toLowerCase()).test(title.toLowerCase()));

    const fetchCampaigns = Campaigns.filter(({ name }) =>
      new RegExp(query.toLowerCase()).test(name.toLowerCase()),
    );

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: { sessions: fetchSessions, campaigns: fetchCampaigns },
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