const db = require("../../config/db.config");
const { generateID } = require("../../lib");

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
