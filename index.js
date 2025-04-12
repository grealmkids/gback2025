require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "G-REALM API Documentation",
      version: "1.0.0",
      description: "API documentation for G-REALM backend",
      contact: {
        name: "G-REALM Support",
        email: "support@grealm.org",
        url: "https://grealm.org",
      },
      servers: [
        {
          url: "http://localhost:5000/api",
          description: "Local Development Server",
        },
      ],
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
console.log(
  "Swagger documentation available at http://localhost:5000/api-docs"
);

// Update CORS configuration to allow all origins temporarily
app.use(cors());

// Alternatively, if you want to restrict origins, ensure the allowedOrigins array is properly configured
// const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : [];
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//   })
// );

app.use(express.json());

// Placeholder for routes
app.use("/api", require("./routes"));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
