const crypto = require("crypto");
const db = require("../../config/db.config");
const Response = require("../../models/response");
const { generateID } = require("../../lib");

/* ------------------- Product API ------------------ */
// [GET] /admin/products
exports.getProducts = async (req, res) => {
  try {
    // [SQL]
    const result = await db.pool
      .query("select * from product")
      .then((res) => res.rows);
    res.status(200).json({
      products: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Get products failed!",
    });
  }
};

// [POST] /admin/product
exports.createProduct = async (req, res) => {
  try {
  } catch (error) {}
};

/* ------------------- Product API ------------------ */
// [GET] /admin/tags
exports.getProductTags = async (req, res) => {
  try {
    // Join product with product_tags and product_tag to get product information and associated tags
    const result = await db.pool.query("select * from product_tag");

    res.status(200).json({
      tags: result.rows,
    });
  } catch (error) {
    console.error(error); // Log the error for easier debugging
    res.status(500).json({
      message: "Get product tags failed!",
    });
  }
};

// [POST] /admin/tags
exports.createProductTags = async (req, res) => {
  const tagId = generateID("ptag");
  const { value, metadata = null } = req.body;

  if (!value) {
    return res.status(400).json({
      message: "Invalid product tag data!",
    });
  }

  try {
    await db.pool.query(
      `INSERT INTO public.product_tag(id, value, metadata) VALUES ($1, $2, $3);`,
      [tagId, value, metadata]
    );
    res.status(200).json({
      message: "Create product tags success!",
      data: {
        id: tagId,
        value: value,
        metadata: metadata,
      },
    });
  } catch (error) {
    console.error(error); // Log the error for easier debugging
    res.status(500).json({
      message: "Create product tags failed!",
    });
  }
};

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
