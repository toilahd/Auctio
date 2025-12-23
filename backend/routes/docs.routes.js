import swaggerDoc from "./../swagger.json" with { type: 'json' };
import { apiReference } from '@scalar/express-api-reference';

import {Router} from "express"

const router = Router();

router.use(
  "/docs",
  apiReference({
    content: swaggerDoc,
    metaData: {
      title: "Auction API Documentation",
    }
  }),
);

export default router;
