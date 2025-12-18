import swaggerAuto from "swagger-autogen";
import dotenv from "dotenv";

dotenv.config();

const swaggerAutogen = swaggerAuto();

const port = process.env.PORT || 3000;

const doc = {
  info: {
    title: "Auctio API",
    description: "API documentation for the Auctio application",
  },
  host: `localhost:${port}`,
};

const outputFile = "./swagger.json";
const routes = ["./app.js"];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);
