
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.POSTGRESQL);
export const getSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const result = await sql`
  SELECT
    s.id,
    s.title,
    s.number,
    to_char(s.session_date, 'YYYY-MM-DD') AS "date",
    s.summary,

    jsonb_build_object(
      'id', c.id,
      'short', c.short
    ) AS campaign,

    jsonb_build_object(
      'id', ch.id,
      'name', ch.name
    ) AS author,

    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', a.id,
          'position', jsonb_build_object('x', a.position_x, 'y', a.position_y),
          'text', a.text,
          'character', jsonb_build_object(
            'id', ac.id,
            'name', ac.name
          )
        )
      ) FILTER (WHERE a.id IS NOT NULL),
      '[]'
    ) AS annotations

  FROM session s
  JOIN campaign c ON c.id = s.campaign_id
  JOIN character ch ON ch.id = s.author_id
  LEFT JOIN session_annotation a ON a.session_id = s.id
  LEFT JOIN character ac ON ac.id = a.character_id
  WHERE s.id = ${sessionId}
  GROUP BY s.id, c.id, ch.id;
`;

    if (!result[0]) {
      return res.status(404).json({ status: 404, message: "Not found", data: {} });
    }

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: result[0]
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: 500, message: err.message });
  }
};
export const getRecentSessions = async (req, res) => {
  try {
    const number = Math.min(Number(req.params.n || 10), 10);

    const sessions = await sql`
      SELECT
        s.id,
        s.title,
        s.number,
        c.short AS campaign,
        to_char(s.session_date, 'YYYY-MM-DD') AS "session_date"
      FROM session s
      JOIN campaign c ON c.id = s.campaign_id
      ORDER BY s.session_date DESC
      LIMIT ${number};
    `;

    return res.json({
      status: 200,
      message: "Success",
      data: sessions
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: 500, message: err.message });
  }
}; export const createSession = async (req, res) => {
  try {
    const { userId } = req;
    const { campaign: campaignId, title, summary, number, date } = req.body;

    // encontrar personaje del usuario en esa campaña
    const author = await sql`
      SELECT ch.id
      FROM character ch
      WHERE ch.member_id = ${userId}
        AND ch.campaign_id = ${campaignId}
      LIMIT 1;
    `;

    if (!author[0]) {
      return res.status(404).json({
        status: 404,
        message: "Author not found",
        data: null
      });
    }

    const result = await sql`
      INSERT INTO session (
        campaign_id,
        number,
        title,
        author,
        session_date,
        summary
      )
      VALUES (
        ${campaignId},
        ${number},
        ${title},
        ${author[0].id},
        ${date},
        ${summary}
      )
      RETURNING id;
    `;

    return res.json({
      status: 200,
      message: "Success",
      data: result[0].id
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: 500, message: err.message });
  }
};
export const annotateSession = async (req, res) => {
  try {
    const { userId } = req;
    const { sessionId, position, text } = req.body;

    const character = await sql`
      SELECT ch.id
      FROM character ch
      JOIN session s ON s.id = ${sessionId}
      WHERE ch.member_id = ${userId}
        AND ch.campaign_id = s.campaign_id
      LIMIT 1;
    `;

    if (!character[0]) {
      return res.status(404).json({
        status: 404,
        message: "Resource not found",
        data: null
      });
    }

    const result = await sql`
      INSERT INTO session_annotation (
        session_id,
        character_id,
        position_x,
        position_y,
        text
      )
      VALUES (
        ${sessionId},
        ${character[0].id},
        ${position[1]},
        ${position[0]},
        ${text}
      )
      RETURNING id;
    `;

    return res.json({
      status: 200,
      message: "Success",
      data: result[0].id
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: 500, message: err.message });
  }
};