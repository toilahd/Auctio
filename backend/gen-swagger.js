import swaggerAuto from "swagger-autogen";
const swaggerAutogen = swaggerAuto();

const doc = {
  info: {
    title: "My API",
    description: "Description",
  },
  host: "localhost:4000",
};

const outputFile = "./swagger.json";
const routes = ["./auth.js"];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);
