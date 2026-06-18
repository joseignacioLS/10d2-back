import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.POSTGRESQL);

export const getCharacterById = async (req, res, next) => {
  try {
    const { characterId } = req.params;

    const result = await sql`
      SELECT
        ch.name,
        ch.member_id AS member,
        jsonb_build_object(
          'id', c.id,
          'short', c.short
        ) AS campaign

      FROM character ch
      JOIN campaign c ON c.id = ch.campaign_id
      WHERE ch.id = ${characterId}
      LIMIT 1;
    `;

    const character = result[0];

    if (!character) {
      return res.status(404).json({
        status: 404,
        message: "Resource not found",
        data: {}
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: {
        name: character.name,
        member: character.member,
        campaign: character.campaign
      }
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: err.message ?? err,
      data: {}
    });
  }
};