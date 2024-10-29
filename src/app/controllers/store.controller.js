const db = require("../../config/db.config");

// [GET] /store
exports.getStoreData = (req, res) => {
  db.pool.query("select * from store", (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Query store failed!",
      });
    }
    res.status(200).json({
      data: result,
    });
  });
};
