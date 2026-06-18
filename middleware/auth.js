import jwt from "jsonwebtoken";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.POSTGRESQL);

export function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    res.cookie("token", "Deleted", {
      expires: new Date(Date.now()),
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.status(401).json({ status: 401, data: null, message: 'Access token not provided' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      res.cookie("token", "Deleted", {
        expires: new Date(Date.now()),
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });
      return res.status(403).json({ status: 403, data: null, message: 'Invalid or expired access token' });
    }
    // Attach the user ID to the request object for use in subsequent handlers
    req.userId = payload.id;
    req.token = token;
    next();
  });
}

export async function isGMOfCampaign(req, res, next) {
  try {
    const { userId } = req;
    const { campaignId } = req.body;

    if (!campaignId) {
      return res.status(400).json({
        status: 400,
        message: "campaignId is required",
        data: {},
      });
    }

    const gmCheck = await sql`
      SELECT 1
      FROM campaign_member
      WHERE campaign_id = ${campaignId}
        AND member_id = ${userId}
        AND role = 'GM'
      LIMIT 1;
    `;

    if (gmCheck.length === 0) {
      return res.status(403).json({
        status: 403,
        message: "Only GM can perform this action",
        data: null
      });
    }

    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: err.message ?? err,
      data: {}
    });
  }
}

export async function isMemberOfCampaign(req, res, next) {
  try {
    const { userId } = req;
    let campaignId = req.body.campaign;

    // Si no viene el campaign en body, intenta obtenerlo del sessionId
    if (!campaignId && req.body.sessionId) {
      const sessionResult = await sql`
        SELECT campaign_id
        FROM session
        WHERE id = ${req.body.sessionId}
        LIMIT 1;
      `;

      if (!sessionResult[0]) {
        return res.status(404).json({
          status: 404,
          message: "Session not found",
          data: null
        });
      }

      campaignId = sessionResult[0].campaign_id;
    }

    if (!campaignId) {
      return res.status(400).json({
        status: 400,
        message: "campaignId or sessionId is required",
        data: {},
      });
    }

    const memberCheck = await sql`
      SELECT 1
      FROM campaign_member
      WHERE campaign_id = ${campaignId}
        AND member_id = ${userId}
      LIMIT 1;
    `;

    if (memberCheck.length === 0) {
      return res.status(403).json({
        status: 403,
        message: "Only campaign members can perform this action",
        data: null
      });
    }

    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: err.message ?? err,
      data: {}
    });
  }
}