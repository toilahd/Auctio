import { decodeJwt } from "./jwtUtil.js";

const getUserFromJwt = (req, res, next) => {
  console.log("All cookies:", req.cookies);
  const accessToken = req.cookies ? req.cookies.access : null;
  console.log("Access token from cookie:", accessToken);
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
  next();
};

export default getUserFromJwt;
