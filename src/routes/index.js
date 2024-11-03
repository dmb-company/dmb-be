const authRoute = require("./auth.route");
const adminRoutes = require("./admin.route");
const storeRoutes = require("./store.route");

function route(app) {
  app.use("/auth", authRoute);
  app.use("/admin", adminRoutes);
  app.use("/store", storeRoutes);
  app.get("/test", (req, res) => {
    res.json({
      message: "Test route.",
    });
  });
}

module.exports = route;
