const express = require("express");
const controller = require("../controllers/search");
const router = express.Router();

router.post("/search", controller.search);

module.exports = router;
