import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const createJwt = (payload, options = { expiresIn: "1h" }) => {
  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

const decodeJwt = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

export { createJwt, decodeJwt };
