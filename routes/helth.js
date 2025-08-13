var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
  res.json({
    apihelth: "Ok",
  });
});

module.exports = router;
