const express = require("express");
const swaggerUi = require("swagger-ui-express");
const openApiDocumentation = require("./rephrasify.json");

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost"; // You can modify this to your desired host
const protocol = process.env.PROTOCOL || "http"; // You can modify this to your desired protocol

const dynamicSwaggerDefinitions = {
  openapi: "3.0.3",
  info: {
    title: "Rephrasify API Documentation",
    version: "1.0.0",
    description: "API documentation generated with Swagger",
  },
  servers: [
    {
      url: `${protocol}://${host}:${port}`,
      description: "API gateway URL",
    },
  ],
};

// Merge the servers from dynamicSwaggerDefinitions with the servers from openApiDocumentation
openApiDocumentation.servers = dynamicSwaggerDefinitions.servers;

app.use(
  "/doc",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocumentation, { explorer: true })
);

app.listen(port, () => {
  console.log(`Server is running on ${protocol}://${host}:${port}`);
});
