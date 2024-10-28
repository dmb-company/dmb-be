const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../config/auth.config");
const adminRoutes = require("./admin.route");

function route(app) {
  app.use("/admin", adminRoutes);
  const token = jwt.sign({ id: "123", role: "admin" }, JWT_SECRET_KEY, {
    expiresIn: "1h",
  });
  console.log(token);
}

module.exports = route;
