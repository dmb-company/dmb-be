const db = require("../../config/db.config");
const Response = require("../../models/response");

// [GET] /admin/login
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

    const accessToken = new Response().generateAccessJWT(payload);
    const response = new Response(true, 200, "Welcome admin!", {
      user: req.user,
      accessToken: accessToken,
    });

    res.status(response.code).json(response);
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred during login",
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
