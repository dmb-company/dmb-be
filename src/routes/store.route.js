const express = require("express");
const router = express.Router();
const storeController = require("../app/controllers/store.controller");

router.get("/", storeController.getStoreData);

module.exports = router;
