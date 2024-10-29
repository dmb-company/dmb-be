const adminRoutes = require("./admin.route");
const storeRoutes = require("./store.route");
const db = require("../config/db.config");

function route(app) {
  app.use("/admin", adminRoutes);
  app.use("/store", storeRoutes);
  app.get("/test", (req, res) => {
    res.json({
      message: "Test route.",
    });
  });
}

module.exports = route;
