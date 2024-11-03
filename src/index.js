const cors = require("cors");
var morgan = require("morgan");
const route = require("./routes");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3050;

var corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

// setup the logger
app.use(morgan("combined"));

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

route(app);
