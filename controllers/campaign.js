import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless";
import { Campaigns } from "../bbdd/campaign.js";


const sql = neon(process.env.POSTGRESQL);

export const getCampaignById = async (req, res, next) => {
  try {
    const { campaignId } = req.params;

    const { id: userId } = jwt.decode(req.headers.authtoken) ?? { id: undefined };

    const campaign = await sql`
      SELECT
        c.id,
        c.name,
        c.summary,
        c.short,
        to_char(c.next_session, 'YYYY-MM-DD') AS "nextSession",

        -- GM
        (
          SELECT jsonb_build_object(
            'id', m.id,
            'name', m.name,
            'character', jsonb_build_object(
              'id', ch.id,
              'name', ch.name,
              'color', ch.color
            )
          )
          FROM campaign_member cm
          JOIN member m ON m.id = cm.member_id
          LEFT JOIN character ch
            ON ch.member_id = m.id
           AND ch.campaign_id = c.id
          WHERE cm.campaign_id = c.id
            AND cm.role = 'GM'
          LIMIT 1
        ) AS "GM",

        -- MEMBERS
        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', m.id,
                'name', m.name,
                'role', cm.role,
                'character', jsonb_build_object(
                  'id', ch.id,
                  'name', ch.name,
                  'color', ch.color
                )
              )
            )
            FROM campaign_member cm
            JOIN member m ON m.id = cm.member_id
            LEFT JOIN character ch
              ON ch.member_id = m.id
             AND ch.campaign_id = c.id
            WHERE cm.campaign_id = c.id
          ),
          '[]'
        ) AS members,

        -- SESSIONS
        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', s.id,
                'number', s.number,
                'title', s.title,
                'date', s.session_date::date,
                'status', s.status
              )
              ORDER BY s.number DESC
            )
            FROM session s
            WHERE s.campaign_id = c.id AND (s.status = 'published' OR s.status = 'draft')
          ),
          '[]'
        ) AS sessions

      FROM campaign c
      WHERE c.id = ${campaignId};
    `;

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: campaign[0],
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: err,
      data: {}
    });
  }
};
export const getRecentCampaigns = async (req, res, next) => {
  try {
    const { n } = req.params;
    const number = Math.min(Number(n || 10), 10);

    const campaigns = await sql`
      SELECT
        id,
        name,
        short
      FROM campaign
      ORDER BY last_activity DESC NULLS LAST
      LIMIT ${number};
    `;

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: campaigns,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: err,
      data: {}
    });
  }
};

export const checkAnnotationPermission = async (req, res, next) => {
  try {
    const { userId } = req;
    const { campaignId } = req.params;

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
export const editCampaign = async (req, res, next) => {
  try {
    const { campaignId, name, short, summary, nextSession } = req.body;

    const result = await sql`
      UPDATE campaign
      SET
        name = ${name},
        short = ${short},
        summary = ${summary},
        next_session = ${nextSession},
        updated_at = now()
      WHERE id = ${campaignId}
      RETURNING
        id,
        name,
        short,
        summary,
        to_char(next_session, 'YYYY-MM-DD') AS "nextSession";
    `;

    if (result.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "Campaign not found",
        data: {},
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: result[0],
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