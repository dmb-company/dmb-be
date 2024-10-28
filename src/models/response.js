const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../config/auth.config");

class Response {
  constructor(status = false, code = 400, message = "", data = null) {
    this.status = status;
    this.code = code;
    this.message = message;
    this.data = data;
  }

  generateAccessJWT(payload = {}) {
    return jwt.sign(payload, JWT_SECRET_KEY, {
      expiresIn: "20m",
    });
  }
}

module.exports = Response;
