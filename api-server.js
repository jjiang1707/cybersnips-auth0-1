const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const authConfig = require("./src/auth_config.json");
const jsonwebtoken = require("jsonwebtoken");


// Initialise express server

const app = express();

const port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = authConfig.appOrigin || `http://localhost:${appPort}`;

// Ensure that auth0 configuration is present

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

// Use helmet for setting CSP headers

app.use(helmet());

// Set CORS to only allows access to APIs from same origin

app.use(cors({ origin: appOrigin }));

//Global CSP directives

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'none'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'"],
    connectSrc: ["'self'"],
    imgSrc: ["'self'"],
    fontSrc: ["'self'"],
    frameSrc: ["'self'"],
    objectSrc: ["'self'"],
    mediaSrc: ["'self'"]
    
  }
}));

// Global X-XXS Protection Header 

app.use(helmet.xssFilter());

app.use((req, res, next) => {
  res.set('X-XSS-Protection', '1; mode=block');
  next();
});


// Validate the JWT and signature against public key on jwskUri

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

// Check role of user matches the required role for accessin the api

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


// Get /api/external endpoint which is only permitted for users with admin role

app.get("/api/external", checkJwt, checkRole('admin'), (req, res) => {
  res.send({
    name: "Top Secret",
    description: "Cybersnips is a youtube channel",
  });
});

app.listen(port, () => console.log(`API Server listening on port ${port}`));

