
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.POSTGRESQL);
export const search = async (req, res, next) => {
  try {
    const { query } = req.params;
    const q = `%${query}%`;

    const campaigns = await sql`
      SELECT
        id,
        name,
        short
      FROM campaign
      WHERE name ILIKE ${q}
      LIMIT 10;
    `;

    const sessions = await sql`
      SELECT
        id,
        title,
        number,
        to_char(session_date, 'YYYY-MM-DD') AS date
      FROM session
      WHERE title ILIKE ${q}
      ORDER BY session_date DESC
      LIMIT 10;
    `;

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: {
        sessions,
        campaigns
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