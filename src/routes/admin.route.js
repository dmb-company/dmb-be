const express = require("express");
const router = express.Router();
const verifyToken = require("../app/middleware/auth");
const adminController = require("../app/controllers/admin.controller");

router.get("/dashboard", verifyToken, adminController.getAdminData);

module.exports = router;
