import { Router } from "express";
import passport from "passport";
import cors from "cors";
import GoogleStrategy from "passport-google-oauth20";
import {
  whoAmI,
  login,
  signup,
  logout,
  refreshToken,
  googleOAuthCallback,
} from "../controllers/auth.controllers.js";
import getUserFromJwt from "../utils/getUserFromJwtMiddleware.js";
import UserModel from "../models/User.js";

const router = Router();

router.use(cors());

router.get("/whoami", getUserFromJwt, whoAmI);

router.post("/login", login);

router.post("/signup", signup);

router.post("/logout", getUserFromJwt, logout);

router.post("/refresh-token", refreshToken);

passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      const userFromGoogle = {
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
      };

      // Must check if user exists in DB, create if not
      var realProfile;
      const randomHashedPassword = await bcrypt.hash(
        Math.random().toString(36).slice(-8),
        10
      );
      const storedUser = await UserModel.findByEmail(userFromGoogle.email);
      if (storedUser === null) {
        realProfile = await UserModel.create({
          email: userFromGoogle.email,
          password: randomHashedPassword,
          fullName: userFromGoogle.name,
          address: "",
          role: "BIDDER", // Default role
        });
      } else {
        realProfile = storedUser;
      }

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

router.get(
  "/login/federated/google",
  passport.authenticate("google", {
    session: false,
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
  }),
  googleOAuthCallback
);

export default router;
