import express from "express";
import { Announcements } from "../bbdd/announcement.js";

export const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    return res.status(200).json({
      status: 200,
      message: "Success",
      data: Announcements,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 500,
      message: err,
      data: {}
    });
  }
});
