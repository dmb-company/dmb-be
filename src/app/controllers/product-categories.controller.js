const db = require("../../config/db.config");
const { generateID } = require("../../lib");

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
