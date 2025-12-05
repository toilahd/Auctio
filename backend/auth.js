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
import swaggerUi from "swagger-ui-express";
import swaggerDoc from "./swagger.json" with { type: 'json' };
import * as z from "zod";
import { createJwt, decodeJwt } from "./utils/jwtUtil.js";
const app = express();
const PORT = process.env.AUTH_PORT || 4000;

const ACCESS_TOKEN_AGE = "10min";
const REFRESH_TOKEN_AGE = "30d";

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
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
  {
    id: 3,
    username: "user",
    password: "pass",
    longName: "Usser Testington",
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
  /*
    #swagger.summary = 'Get current user'
    #swagger.description = 'Endpoint to get information about the currently authenticated user.'

    #swagger.responses[200] = {
      description: 'User information retrieved successfully.',
      schema: {
        user: {
          username: 'string',
          email: 'string',
          googleId: 'string'
        }
      }
    }

    #swagger.responses[401] = {
      description: 'Unauthorized access.',
      schema: { message: 'Unauthorized' }
    }
  */
  const user = req.user || null;
  res.json({ user });
});

app.post("/login", (req, res) => {
  /*
    #swagger.summary = 'User login'
    #swagger.description = 'Endpoint to login and receive access and refresh tokens.'

    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Login credentials.',
      required: true,
      schema: {
        $username: 'testuser',
        $password: 'mypassword'
      }
    }

    #swagger.responses[200] = {
      description: 'Login successful.',
      schema: {
        message: 'Login successful',
        accessToken: 'string',
        refreshToken: 'string'
      }
    }

    #swagger.responses[400] = {
      description: 'Validation error.',
      schema: {
        message: 'Invalid input',
        errors: [
          {
            origin: "string",
            code: "too_small",
            minimum: 3,
            inclusive: true,
            path: ["username"],
            message: "Too small: expected string to have >= 3 characters"
          }
        ]
      }
    }

    #swagger.responses[401] = {
      description: 'Invalid credentials.',
      schema: { message: 'Invalid credentials' }
    }
  */

  // Make validation schema
  const loginSchema = z.object({
    username: z.string().max(8).min(3),
    password: z.string().max(20).min(3),
  });
  // Validate input
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.log("Login validation error:", parseResult.error.message);
    return res.status(400).json({ message: "Invalid input", errors: JSON.parse(parseResult.error.message) });
  }

  const { username, password } = parseResult.data;
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
  /*
    #swagger.summary = 'Refresh access token'
    #swagger.description = 'Endpoint to refresh the access token using a valid refresh token.'

    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Refresh token.',
      required: false,
      schema: {
        token: 'string'
      }
    }

    #swagger.responses[200] = {
      description: 'Access token refreshed successfully.',
      schema: {
        message: 'Access token refreshed',
        accessToken: 'string'
      }
    }

    #swagger.responses[401] = {
      description: 'Invalid refresh token.',
      schema: { message: 'Invalid refresh token' }
    }
  */
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
        email: profile.emails[0].value,
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
    console.log("Google OAuth callback user:", req.user);
    const user = req.user;

    const payload = {
      username: user.name,
      email: user.email,
      googleId: user.googleId,
    };
    const token = createJwt(payload, { expiresIn: ACCESS_TOKEN_AGE });
    const refresh = createJwt(payload, { expiresIn: REFRESH_TOKEN_AGE });
    validRefreshTokens.add(refresh);

    res
      .cookie("access", token, {
        httpOnly: true,
        // sameSite: "none",
        // secure: false,
      })
      .cookie("refresh", refresh, { httpOnly: true })
      .redirect("/");
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
