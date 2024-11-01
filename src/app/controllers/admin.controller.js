const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../../config/db.config");
const { generateID } = require("../../lib");
const Response = require("../../models/response");
const { JWT_SECRET_KEY, JWT_REFRESH_KEY } = require("../../config/auth.config");

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

/* ------------------- Tags API ------------------ */
// [GET] /admin/tags
exports.getProductTags = async (req, res) => {
  try {
    const result = await db.pool.query("select * from product_tag");

    res.status(200).json({
      tags: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Get product tags failed!",
    });
  }
};

// [POST] /admin/tags
exports.createProductTag = async (req, res) => {
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
      message: "Create product tag success!",
      data: {
        id: tagId,
        value: value,
        metadata: metadata,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Create product tag failed!",
    });
  }
};

/* ------------------- Category API ------------------ */
// [GET] /admin/categories
exports.getProductCategory = async (req, res) => {
  try {
    const result = await db.pool.query("select * from product_category");

    res.status(200).json({
      categories: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Get product categories failed!",
    });
  }
};

// [POST] /admin/categories
exports.createProductCategory = async (req, res) => {
  const categoryId = generateID("pcat");
  const { name, handle, description, metadata = null } = req.body;

  if (!name) {
    return res.status(400).json({
      message: "Invalid product category data!",
    });
  }

  try {
    await db.pool.query(
      `INSERT INTO public.product_category(id, name, handle, description, metadata) VALUES ($1, $2, $3, $4, $5);`,
      [categoryId, name, handle, description, metadata]
    );
    res.status(200).json({
      message: "Create product category success!",
      data: {
        id: categoryId,
        name: name,
        handle: handle,
        description: description,
        metadata: metadata,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Create product tag failed!",
    });
  }
};
