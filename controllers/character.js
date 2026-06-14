import { Campaigns } from "../bbdd/campaign.js";
import { Characters } from "../bbdd/character.js";

export const getCharacterById = async (req, res, next) => {
  try {

    const { characterId } = req.params;
    const character = Characters.find(({ id }) => id === characterId);

    const campaign = Campaigns.find(({ id }) => id === character?.campaign);


    if (!character || !campaign) {
      return res.status(404).json({
        status: 404,
        message: "Resource not found",
        data: {},
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: {
        name: character.name,
        member: character.member,
        campaign: {
          id: campaign.id,
          short: campaign.short
        }
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