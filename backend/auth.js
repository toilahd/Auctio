// Example auth server

import express from "express";
import { createJwt, decodeJwt } from "./utils/jwtUtil.js";
const app = express();
const PORT = process.env.AUTH_PORT || 4000;

app.use(express.json());

// Middleware
const getUserFromJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    const user = decodeJwt(token);
    if (user) {
      req.user = user;
      console.log("Authenticated user:", user);
      return next();
    }
  }
  req.user = null;
  next();
};


app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "user" && password === "pass") {
    const token = createJwt({ username }, { expiresIn: "5s" });
    res.json({
      token,
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

app.get("/auth/google/callback", (req, res) => {
  res.json({ message: "Google OAuth callback received" });
});

// Protected routes
app.get("/protected", getUserFromJwt, (req, res) => {
  if (req.user) {
    res.json({ message: "This is protected data.", user: req.user });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});
