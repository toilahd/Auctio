import { Router } from "express";
import { whoAmI, login, signup, logout, refreshToken } from "../controllers/auth.controllers.js";
import getUserFromJwt from "../utils/getUserFromJwtMiddleware.js";

const router = Router();

router.get("/whoami", getUserFromJwt, whoAmI);

router.post("/login", login);

router.post("/signup", signup);

router.post("/logout", getUserFromJwt, logout);

router.post("/refresh-token", refreshToken);

export default router;
