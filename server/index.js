const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const bodyParser = require("body-parser");

const { notFound, errorHandler } = require("./middlewares");

const app = express();

require("dotenv").config();

app.use(helmet());
app.use(morgan("dev"));
app.use(bodyParser.json());

const imageCompare = require("./api/imagecompare");
const nodeAPI = require("./api/nodeapi");

app.use("/imgcompare/api/", imageCompare);
app.use("/nodeapi/api/", nodeAPI);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
