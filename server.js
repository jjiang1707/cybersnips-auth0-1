const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const { join } = require("path");

const app = express();

const port = process.env.SERVER_PORT || 3000;

app.use(morgan("dev"));

app.use(helmet.contentSecurityPolicy({
  directives: {
    "default-src": ["'self'"],
    "connect-src": ["'self'"]
  }
}));


app.use(helmet.xssFilter());

app.get('/', (req, res) => {
  res.set('X-XSS-Protection', '1; mode=block');
  res.send('Hello World!');
});

app.use(express.static(join(__dirname, "build")));

app.listen(port, () => console.log(`Server listening on port ${port}`));
