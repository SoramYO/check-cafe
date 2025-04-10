const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

// const swaggerDocument = YAML.load(path.join(__dirname, '../../docs/swagger.yaml'));
const swaggerDocument = YAML.load(
  path.join(__dirname, "../../docs/openapi.yaml")
);

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
