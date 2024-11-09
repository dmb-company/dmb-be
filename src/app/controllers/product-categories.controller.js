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

// [GET] /admin/categories/:id
exports.getOneProductCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.pool
      .query(`select * from product_category where id = $1`, [id])
      .then((res) => res.rows[0]);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Get product category failed!",
    });
  }
};

// [POST] /admin/categories
exports.createProductCategory = async (req, res) => {
  const categoryId = generateID("pcat");
  const { name, handle, description = "", metadata = null } = req.body;

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

// [DELETE] /admin/categories
exports.deleteProductCategory = async (req, res) => {
  const { categoryId } = req.body;

  if (!categoryId) {
    return res.status(400).json({
      message: "Category ID is required!",
    });
  }

  try {
    // Delete the category
    await db.pool.query(`DELETE FROM public.product_category WHERE id = $1;`, [
      categoryId,
    ]);

    res.status(200).json({
      message: "Delete product category success!",
      data: {
        id: categoryId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Delete product category failed!",
    });
  }
};

// [PATCH] /admin/categories
exports.updateProductCategory = async (req, res) => {
  const { categoryId, ...updateFields } = req.body;

  if (!categoryId) {
    return res.status(400).json({
      message: "Category ID is required!",
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

    // Add the category ID as the last parameter
    values.push(categoryId);

    // Update only the specified fields
    await db.pool.query(
      `UPDATE public.product_category SET ${setClauses.join(
        ", "
      )} WHERE id = $${index}`,
      values
    );

    res.status(200).json({
      message: "Update product category success!",
      data: {
        id: categoryId,
        ...updateFields,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Update product category failed!",
    });
  }
};
