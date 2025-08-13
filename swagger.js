// swagger.js
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My Express API",
      version: "1.0.0",
      description: "API documentation for my Express.js app",
    },
    servers: [
      {
        url: "http://localhost:3000", // change if you have different base URL
      },
    ],
  },
  apis: ["./routes/*.js"], // Scan your route files for docs
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
