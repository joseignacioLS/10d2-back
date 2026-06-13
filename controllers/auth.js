import jwt from "jsonwebtoken";
import { Members } from "../bbdd/member.js";
import { auth } from "../bbdd/auth.js";

export const login = async (req, res, next) => {
  try {
    const { user, password } = req.body;

    const member = Members.find(({ name }) => name === user);
    if (!member || auth[member.id] !== password) {
      return res.status(404).json({
        status: 404,
        message: "login error",
        data: {},
      });
    }

    const token = jwt.sign({
      id: member.id
    }, process.env.JWT_SECRET,
      { expiresIn: "1h" });
    res.cookie("token", token, { expires: new Date(Date.now() + 1000 * 60 * 60), httpOnly: true });
    return res.status(200).json({
      status: 200,
      message: "",
      data: "wi"
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
    const receivedToken = req.cookies.token;
    if (!receivedToken) {
      return res.status(401).json({ status: 401, data: null, message: 'Access token not provided' });
    }
    jwt.verify(receivedToken, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        return res.status(403).json({ status: 403, data: null, message: 'Invalid or expired access token' });
      }
      // Attach the user ID to the request object for use in subsequent handlers
      req.userId = payload.id;
    });

    const token = jwt.sign({
      id: jwt.decode(receivedToken).id
    }, process.env.JWT_SECRET,
      { expiresIn: "1h" });
    res.cookie("token", token, { expires: new Date(Date.now() + 1000 * 60 * 60), httpOnly: true });
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