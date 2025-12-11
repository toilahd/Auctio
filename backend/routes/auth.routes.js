import { Router } from "express";
import { whoAmI, login } from "../controllers/auth.controllers.js";

const router = Router();

router.get("/whoami", whoAmI);

router.post("/login", login);

export default router;
