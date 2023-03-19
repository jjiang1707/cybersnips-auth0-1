const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const authConfig = require("./src/auth_config.json");
const jsonwebtoken = require("jsonwebtoken");



const app = express();

const port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;

if (
  !authConfig.domain ||
  !authConfig.audience ||
  authConfig.audience === "test"
) {
  console.log(
    "Exiting: Please make sure that auth_config.json is in place and populated with valid domain and audience values"
  );

  process.exit();
}

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,  // prevents tampering the of jwks_uri parameter in token to spoof the signature
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});


const checkRole = (role) => (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  const decodedToken = jsonwebtoken.decode(token);
  const customClaims = decodedToken['http://localhost:3000/claims'];
  const roles = customClaims['http://localhost:3000/roles'];
  console.log('Roles:', roles); 

  if (Array.isArray(roles) && roles.includes(role)) {
    next();
  } else {
    res.status(403).send('Access denied');
  }
};



app.get("/api/external", checkJwt, checkRole('admin'), (req, res) => {
  res.send({
    name: "Top Secret",
    description: "Cybersnips is a youtube channel",
  });
});

app.listen(port, () => console.log(`API Server listening on port ${port}`));

