import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.POSTGRESQL);
export const getUserData = async (req, res, next) => {
  try {
    const { userId } = req;

    const result = await sql`
      SELECT
        m.id,
        m.name AS username,

        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'id', c.id,
              'role', cm.role,
              'name', c.name
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS campaigns

      FROM member m

      LEFT JOIN campaign_member cm
        ON cm.member_id = m.id

      LEFT JOIN campaign c
        ON c.id = cm.campaign_id

      WHERE m.id = ${userId}

      GROUP BY m.id;
    `;

    const user = result[0];

    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "login error",
        data: {},
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: {
        id: user.id,
        username: user.username,
        campaigns: user.campaigns,
        subscriptions: [] // aún no modelado en DB
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