const crypto = require("crypto");

exports.generateID = (head) => {
  return head + "_" + crypto.randomBytes(16).toString("hex");
};
