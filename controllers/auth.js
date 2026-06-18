import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";
import { auth } from "../bbdd/auth.js";
import { Members } from "../bbdd/member.js";

const sql = neon(process.env.POSTGRESQL);

export const login = async (req, res, next) => {
  try {
    const { user, password } = req.body;

    const result = await sql`
      SELECT
        a.password,
        m.id AS member_id,
        m.name
      FROM auth a
      JOIN member m ON m.id = a.member_id
      WHERE a.username = ${user}
      LIMIT 1;
    `;

    const authUser = result[0];

    if (!authUser || authUser.password !== password) {
      return res.status(401).json({
        status: 401,
        message: "login error",
        data: {},
      });
    }

    const token = jwt.sign(
      { id: authUser.member_id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      expires: new Date(Date.now() + 1000 * 60 * 60),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/"
    });

    return res.status(200).json({
      status: 200,
      message: "Success",
      data: {
        token
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

export const register = async (req, res, next) => {
  try {
    const { user, password } = req.body;

    const member = Members.find(({ name }) => name === user);
    if (member) {
      return res.status(404).json({
        status: 404,
        message: "register error",
        data: {},
      });
    }
    const id = "m" + Members.length;
    auth[id] = password;

    Members.push({
      id,
      name: user,
      campaigns: [],
      subscriptions: []
    });

    const token = jwt.sign({
      id: member.id
    }, process.env.JWT_SECRET,
      { expiresIn: "1h" });
    res.cookie("token", token, { expires: new Date(Date.now() + 1000 * 60 * 60), httpOnly: true });
    return res.status(200).json({
      status: 200,
      message: "",
      data: null
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

export const refresh = async (req, res, next) => {
  try {
    const { userId } = req;

    const token = jwt.sign({
      id: userId
    }, process.env.JWT_SECRET,
      { expiresIn: "1h" });
    res.cookie("token", token, {
      expires: new Date(Date.now() + 1000 * 60 * 60),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/"
    });
    return res.status(200).json({
      status: 200,
      message: "",
      data: token
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

export const logout = async (req, res, next) => {
  try {
    res.cookie("token", "Deleted", { expires: new Date(Date.now()), httpOnly: true });
    return res.status(200).json({
      status: 200,
      message: "",
      data: null
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