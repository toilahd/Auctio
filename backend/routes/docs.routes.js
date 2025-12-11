import swaggerUi from "swagger-ui-express";
import swaggerDoc from "./../swagger.json" with { type: 'json' };

import {Router} from "express"

const router = Router();

router.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDoc)
);

export default router;
