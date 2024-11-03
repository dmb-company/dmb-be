const db = require("../../config/db.config");
const { generateID, convertToSlug } = require("../../lib");

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
  const proId = generateID("pro");
  let {
    title,
    handle = "",
    images = {
      data: [],
    },
    subtitle = "",
    description = "",
    thumbnail = "",
    originCountry = "",
    metadata = null,
    tagsId = {
      data: [],
    },
    categoriesId = {
      data: [],
    },
  } = req.body;

  if (handle === "") handle = convertToSlug(title);

  if (!title) {
    return res.status(400).json({
      message: "Invalid product data!",
    });
  }

  try {
    await db.pool.query(
      `INSERT INTO public.product(
	id, title, subtitle, description, handle, images, thumbnail, origin_country, metadata)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [
        proId,
        title,
        subtitle,
        description,
        handle,
        images,
        thumbnail,
        originCountry,
        metadata,
      ]
    );

    const tags = tagsId?.data;
    if (tags.length > 0) {
      const tagsValues = tags
        .map((tagId, index) => `($1, $${index + 2})`)
        .join(", ");

      const tagsParams = [proId, ...tags];

      await db.pool.query(
        `INSERT INTO public.product_tags (product_id, product_tag_id) VALUES ${tagsValues}`,
        tagsParams
      );
    }

    const categories = categoriesId?.data;
    if (categories.length > 0) {
      const categoriesValues = categories
        .map((categoryId, index) => `($1, $${index + 2})`)
        .join(", ");
      const categoriesParams = [proId, ...categories];

      await db.pool.query(
        `INSERT INTO public.product_category_product(
        product_id, product_category_id)
        VALUES ${categoriesValues}`,
        categoriesParams
      );
    }

    res.status(200).json({
      message: "Create product success!",
      data: {
        id: proId,
        title,
        subtitle,
        description,
        handle,
        images,
        thumbnail,
        originCountry,
        metadata,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Create product failed!",
    });
  }
};
