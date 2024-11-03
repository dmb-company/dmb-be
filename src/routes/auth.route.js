const express = require("express");
const router = express.Router();
const verifyToken = require("../app/middleware/auth");
const authController = require("../app/controllers/auth.controller");

router.get("/session", verifyToken, authController.getSession);

module.exports = router;
