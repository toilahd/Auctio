import { decodeJwt } from "./jwtUtil.js";

/**
 * Middleware to extract user information from JWT in cookies or Authorization header.
 * If a valid token is found, attaches the user info to req.user.
 * If no valid token is found, sets req.user to null and req.tokenError with the error message.
 */
const getUserFromJwt = (req, res, next) => {
  const accessToken = req.cookies ? req.cookies.access : null;
  let authHeader = req.headers.authorization;
  if (accessToken && !authHeader) {
    authHeader = `Bearer ${accessToken}`;
  }
  let tokenError = "no token provided";
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    const { payload: user, error } = decodeJwt(token);
    if (user) {
      req.user = user;
      console.log("Authenticated user:", user);
      return next();
    }
    error && (tokenError = error.message);
    console.log("JWT decode error:", error);
  }
  req.user = null;
  req.tokenError = tokenError || error;

  if (req.user !== null) {
    next();
  } else {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: " + req.tokenError,
    });
  }
};

export default getUserFromJwt;
