const adminRoutes = require("./admin.route");

function route(app) {
  app.use("/admin", adminRoutes);
}

module.exports = route;
