const db = require("../../config/db.config");
const { generateID, convertToSlug } = require("../../lib");

/* ------------------- Product API ------------------ */
// [GET] /admin/products
// [GET] /admin/products
exports.getProducts = async (req, res) => {
  try {
    // Fetch products along with their associated tags and categories
    const productsQuery = `
      SELECT 
        p.*, 
        ARRAY_AGG(pt.product_tag_id) AS tags,
        ARRAY_AGG(pc.product_category_id) AS categories
      FROM 
        public.product p
      LEFT JOIN 
        public.product_tags pt ON p.id = pt.product_id
      LEFT JOIN 
        public.product_category_product pc ON p.id = pc.product_id
      GROUP BY 
        p.id;
    `;

    const products = await db.pool.query(productsQuery).then((res) => res.rows);

    res.status(200).json({
      products: products.map((product) => ({
        ...product,
        tags: product.tags.filter((tag) => tag !== null), // Filter out null values
        categories: product.categories.filter((category) => category !== null), // Filter out null values
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Get products failed!",
    });
  }
};

// [GET] /admin/product/:id
exports.getOneProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Query to get the product details along with its tags and categories
    const productQuery = `
      SELECT 
        p.*, 
        ARRAY_AGG(DISTINCT pt.product_tag_id) AS tags,
        ARRAY_AGG(DISTINCT pc.product_category_id) AS categories
      FROM 
        public.product p
      LEFT JOIN 
        public.product_tags pt ON p.id = pt.product_id
      LEFT JOIN 
        public.product_category_product pc ON p.id = pc.product_id
      WHERE 
        p.id = $1
      GROUP BY 
        p.id;
    `;

    const product = await db.pool
      .query(productQuery, [id])
      .then((res) => res.rows[0]);

    // Check if the product exists
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      ...product,
      tags: product.tags.filter((tag) => tag !== null), // Remove null values
      categories: product.categories.filter((category) => category !== null), // Remove null values
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Get product failed!",
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

// [DELETE] /admin/products
exports.deleteProduct = async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({
      message: "Product ID is required!",
    });
  }

  try {
    // Delete related tags
    await db.pool.query(
      `DELETE FROM public.product_tags WHERE product_id = $1;`,
      [productId]
    );

    // Delete related categories
    await db.pool.query(
      `DELETE FROM public.product_category_product WHERE product_id = $1;`,
      [productId]
    );

    // Delete the product
    await db.pool.query(`DELETE FROM public.product WHERE id = $1;`, [
      productId,
    ]);

    res.status(200).json({
      message: "Delete product success!",
      data: {
        id: productId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Delete product failed!",
    });
  }
};

// [PATCH] /admin/product
exports.updateProductFields = async (req, res) => {
  const { productId, ...updateFields } = req.body;

  if (!productId) {
    return res.status(400).json({
      message: "Product ID is required!",
    });
  }

  // Check if there are fields to update
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
      if (key === "tagsId" || key === "categoriesId") continue; // Skip tags and categories for now

      setClauses.push(`${key} = $${index}`);
      values.push(value);
      index++;
    }

    // Add the product ID as the last parameter
    values.push(productId);

    // Only proceed with an update if there are valid fields to update
    if (setClauses.length > 0) {
      await db.pool.query(
        `UPDATE public.product SET ${setClauses.join(
          ", "
        )} WHERE id = $${index}`,
        values
      );
    }

    // Update tags if provided
    if (updateFields.tagsId?.data) {
      await db.pool.query(
        `DELETE FROM public.product_tags WHERE product_id = $1;`,
        [productId]
      );
      if (updateFields.tagsId.data.length > 0) {
        const tagsValues = updateFields.tagsId.data
          .map((tagId, i) => `($1, $${i + 2})`)
          .join(", ");
        const tagsParams = [productId, ...updateFields.tagsId.data];
        await db.pool.query(
          `INSERT INTO public.product_tags (product_id, product_tag_id) VALUES ${tagsValues}`,
          tagsParams
        );
      }
    }

    // Update categories if provided
    if (updateFields.categoriesId?.data) {
      await db.pool.query(
        `DELETE FROM public.product_category_product WHERE product_id = $1;`,
        [productId]
      );
      if (updateFields.categoriesId.data.length > 0) {
        const categoriesValues = updateFields.categoriesId.data
          .map((categoryId, i) => `($1, $${i + 2})`)
          .join(", ");
        const categoriesParams = [productId, ...updateFields.categoriesId.data];
        await db.pool.query(
          `INSERT INTO public.product_category_product (product_id, product_category_id) VALUES ${categoriesValues}`,
          categoriesParams
        );
      }
    }

    res.status(200).json({
      message: "Update product success!",
      data: {
        id: productId,
        ...updateFields,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Update product failed!",
    });
  }
};
