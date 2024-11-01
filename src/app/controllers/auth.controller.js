const jwt = require("jsonwebtoken");
const db = require("../../config/db.config");
const Response = require("../../models/response");
const { JWT_SECRET_KEY, JWT_REFRESH_KEY } = require("../../config/auth.config");

const tokenTTL = "5s";
const refreshTokens = {};

// [POST] /admin/login
exports.login = async (req, res) => {
  const { email, password } = req?.body;
  // check user's info is exist in req
  if (!email || !password) {
    const errorResponse = new Response(false, 401, "Unauthorized access!");
    return res.status(errorResponse.code).json(errorResponse);
  }

  try {
    const isAuth = await checkPassword(email, password)
      .then((res) => res)
      .catch((err) => {
        console.log(err);
      });

    if (!isAuth) {
      return res.status(401).json({
        message: "You have entered an invalid username or password",
      });
    }

    // create payload
    const payload = {
      id: "admin",
    };

    const accessToken = jwt.sign(payload, JWT_SECRET_KEY, {
      expiresIn: tokenTTL,
    });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_KEY, {
      expiresIn: "20s",
    });

    refreshTokens[refreshToken] = {
      refreshToken,
      accessToken,
    };

    const response = new Response(true, 200, "Welcome admin!", {
      accessToken,
      refreshToken,
    });

    res.status(response.code).json(response);
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred during login",
    });
  }
};

// [POST] /admin/refreshToken
exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken && refreshToken in refreshTokens) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_KEY);

      const payload = {
        id: decoded?.id,
      };

      const newToken = jwt.sign(payload, JWT_SECRET_KEY, {
        expiresIn: tokenTTL,
      });

      return res.status(200).json({
        token: newToken,
      });
    } catch (error) {
      return res.status(403).json({
        message: "Refresh token expired or invalid. Please log in again.",
      });
    }
  } else {
    return res.status(404).json({
      message: "Invalid request!",
    });
  }
};

// checking password function [return true/false]
const checkPassword = async (email, password) => {
  try {
    const result = await db.pool.query(
      `SELECT password_hash FROM public."user" WHERE email = $1`,
      [email]
    );

    const pw = result.rows[0]?.password_hash;
    return pw === password;
  } catch (err) {
    console.error("Query user failed:", err);
    throw new Error("Query user failed!");
  }
};
