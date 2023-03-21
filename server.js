const express = require("express");
const helmet = require("helmet");
const { join } = require("path");

const app = express();

const port = process.env.SERVER_PORT || 3000;

// Add the contentSecurityPolicy middleware
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

app.use(helmet.xssFilter());


app.use(express.static(join(__dirname, "build")));

app.listen(port, () => console.log(`Server listening on port ${port}`));
