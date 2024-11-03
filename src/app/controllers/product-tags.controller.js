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

// [DELETE] /admin/tags
exports.deleteProductTag = async (req, res) => {
  const { tagId } = req.body;

  if (!tagId) {
    return res.status(400).json({
      message: "Tag ID is required!",
    });
  }

  try {
    // Delete the tag
    await db.pool.query(`DELETE FROM public.product_tag WHERE id = $1;`, [
      tagId,
    ]);

    res.status(200).json({
      message: "Delete product tag success!",
      data: {
        id: tagId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Delete product tag failed!",
    });
  }
};

// [PATCH] /admin/tags
exports.updateProductTag = async (req, res) => {
  const { tagId, ...updateFields } = req.body;

  if (!tagId) {
    return res.status(400).json({
      message: "Tag ID is required!",
    });
  }

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({
      message: "No fields provided to update!",
    });
  }

  try {
    const setClauses = [];
    const values = [];
    let index = 1;

    // Dynamically build the SET clause for each field in the request
    for (const [key, value] of Object.entries(updateFields)) {
      setClauses.push(`${key} = $${index}`);
      values.push(value);
      index++;
    }

    // Add the tag ID as the last parameter
    values.push(tagId);

    // Update only the specified fields
    await db.pool.query(
      `UPDATE public.product_tag SET ${setClauses.join(
        ", "
      )} WHERE id = $${index}`,
      values
    );

    res.status(200).json({
      message: "Update product tag success!",
      data: {
        id: tagId,
        ...updateFields,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Update product tag failed!",
    });
  }
};
