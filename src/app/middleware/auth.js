const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../../config/auth.config");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized!",
    });
  }

  jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token has expired" });
      }
      return res.status(403).json({ message: "Invalid token!" });
    }
    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;
