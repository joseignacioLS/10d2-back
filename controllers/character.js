import { Campaigns } from "../bbdd/campaign.js";
import { Characters } from "../bbdd/character.js";
import { Members } from "../bbdd/member.js";

export const getCharacterById = async (req, res, next) => {
  try {

    const { charaterId } = req.params;
    const character = Characters.find(({ id }) => id === characterId);

    const campaign = Campaigns.find(({ id }) => id === character?.campaign);
    const member = Members.find(({ id }) => id === character?.member);


    if (!character || !campaign || !member) {
      return res.status(404).json({
        status: 404,
        message: "Resource not found",
        data: {},
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: { ...character, campaign, member },
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