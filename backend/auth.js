// Example auth server

/*
Why jwt and refresh token in API to API communication?
- Stateless: API do not need to look up anything.
- Scalability: Easier to scale services without shared session store.
- Security: Short-lived tokens reduce risk if compromised.
- Decoupling: Services can validate tokens independently.

Flow to service to call another service:
- Service A gets JWT for user after authentication.
- Service A calls Service B, passing JWT in Authorization header.
- Service B validates JWT using shared secret/public key.
- If valid, Service B processes request on behalf of user.
- If expired, Service A can use refresh token to get new JWT.
*/

import express from "express";
import cors from "cors";
import cookie from "cookie-parser";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import { createJwt, decodeJwt } from "./utils/jwtUtil.js";
const app = express();
const PORT = process.env.AUTH_PORT || 4000;

const ACCESS_TOKEN_AGE = "10s";
const REFRESH_TOKEN_AGE = "30d";

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:4000",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookie());
app.use(express.urlencoded({ extended: true }));

// In memory DB
const users = [
  {
    id: 1,
    // should be replaced with 'name' because authenticated entity can be a service
    username: "service A",
    password: "pass",
    longName: "Service A - north dakota",
  },
  {
    id: 2,
    username: "service B",
    password: "wonderland",
    longName: "Service B - south dakota",
  },
];
const validRefreshTokens = new Set();

// Middleware
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

// Auth routes
app.get("/whoami", getUserFromJwt, (req, res) => {
  const user = req.user || null;
  res.json({ user });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (user && user.password === password) {
    const token = createJwt({ username }, { expiresIn: ACCESS_TOKEN_AGE });
    const refresh = createJwt({ username }, { expiresIn: REFRESH_TOKEN_AGE });
    validRefreshTokens.add(refresh);
    res
      .cookie("access", token, {
        httpOnly: true,
        // sameSite: "none",
        // secure: false,
      })
      .cookie("refresh", refresh, { httpOnly: true })
      .json({
        message: "Login successful",
        accessToken: token,
        refreshToken: refresh,
      });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

app.post("/logout", (req, res) => {
  const refreshToken = req.cookies ? req.cookies.refresh : null;
  if (refreshToken && validRefreshTokens.has(refreshToken)) {
    validRefreshTokens.delete(refreshToken);
  }
  res.clearCookie("access");
  res.clearCookie("refresh");
  res.json({ message: "Logged out successfully" });
});

app.post("/refresh", (req, res) => {
  const bodyRefreshToken = req.body.token;
  const refreshToken = req.cookies.refresh || bodyRefreshToken;
  if (refreshToken && validRefreshTokens.has(refreshToken)) {
    const { payload: user, error } = decodeJwt(refreshToken);
    if (user) {
      const newAccessToken = createJwt(
        { username: user.username },
        { expiresIn: ACCESS_TOKEN_AGE }
      );
      res
        .cookie("access", newAccessToken, {
          httpOnly: true,
          // sameSite: "none",
          // secure: false,
        })
        .json({
          message: "Access token refreshed",
          accessToken: newAccessToken,
        });
      return;
    }
  }
  console.log("Invalid refresh token attempt:", refreshToken);
  res.status(401).json({ message: "Invalid refresh token" });
});

// Serve a page with a single button
// <h1>Sign in</h1>
// <a class="button google" href="/login/federated/google">Sign in with Google</a>
app.get("/login/google", (req, res) => {
  res.send(`
    <h1>Sign in</h1>
    <a class="button google" href="/login/federated/google">Sign in with Google</a>
  `);
});

passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    (accessToken, refreshToken, profile, done) => {
      const userFromGoogle = {
        googleId: profile.id,
        email: profile.emails,
        name: profile.displayName,
      };

      // Must check if user exists in DB, create if not
      const realProfile = userFromGoogle;

      console.log(
        "Google profile authenticated:",
        realProfile,
        " from ",
        profile
      );

      return done(null, realProfile);
    }
  )
);
app.get(
  "/login/federated/google",
  passport.authenticate("google", {
    session: false,
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
  }),
  (req, res) => {
    console.log("Google OAuth callback user:", req);
    const user = req.user;

    res.redirect("/");
  }
);

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
