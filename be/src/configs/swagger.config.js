const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
const fs = require("fs");

// Check if openapi.yaml exists, if not create a basic one
const yamlPath = path.join(__dirname, "../../docs/openapi.yaml");
let swaggerDocument;

try {
  if (fs.existsSync(yamlPath)) {
    swaggerDocument = YAML.load(yamlPath);
  } else {
    // Basic swagger document if file doesn't exist
    swaggerDocument = {
      openapi: "3.0.0",
      info: {
        title: "CheckCafe API",
        version: "1.0.0",
        description: "API documentation for CheckCafe application"
      },
      servers: [],
      paths: {
        "/health": {
          get: {
            summary: "Health check",
            responses: {
              "200": {
                description: "API is healthy"
              }
            }
          }
        }
      }
    };
  }
} catch (error) {
  console.log("Warning: Could not load swagger documentation:", error.message);
  swaggerDocument = {
    openapi: "3.0.0",
    info: {
      title: "CheckCafe API",
      version: "1.0.0",
      description: "API documentation for CheckCafe application"
    },
    servers: [],
    paths: {}
  };
}

const addServers = (req) => {
  const doc = { ...swaggerDocument };
  const protocol = req.protocol;
  const host = req.get("host");

  doc.servers = [
    {
      url: `${protocol}://${host}/api/v1`,
      description:
        process.env.NODE_ENV === "production"
          ? "Production server"
          : "Development server",
    },
  ];

  return doc;
};

module.exports = {
  swaggerUi,
  swaggerSetup: (req, res) => {
    const doc = addServers(req);
    return swaggerUi.generateHTML(doc);
  },
};
