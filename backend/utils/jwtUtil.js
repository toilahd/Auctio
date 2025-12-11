import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const createJwt = (payload, options = { expiresIn: "5min" }) => {
  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

const decodeJwt = (token) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return { payload, error: null };
  } catch (err) {
    return { payload: null, error: err };
  }
};

export { createJwt, decodeJwt };
