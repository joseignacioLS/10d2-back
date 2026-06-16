import jwt from "jsonwebtoken";

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