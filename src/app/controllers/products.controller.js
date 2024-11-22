const db = require("../../config/db.config");
const { generateID, convertToSlug } = require("../../lib");
const productTagController = require("./product-tags.controller");

/* ------------------- Product API ------------------ */
// [GET] /admin/products
exports.getProducts = async (req, res) => {
  try {
    const { filter, limit = 10, offset = 0, categoryIds, tagIds } = req.query;

    let filterClause = "";
    const queryParams = [];

    // Filter by product name if `filter` is provided
    if (filter) {
      filterClause += `WHERE p.title ILIKE $${queryParams.length + 1} `;
      queryParams.push(`%${filter}%`);
    }

    // Filter by category IDs
    if (categoryIds) {
      const categoryIdsArray = categoryIds.split(",").map((id) => id.trim()); // Handle category IDs as strings
      if (filterClause) {
        filterClause += `AND pc.id = ANY($${queryParams.length + 1}) `;
      } else {
        filterClause += `WHERE pc.id = ANY($${queryParams.length + 1}) `;
      }
      queryParams.push(categoryIdsArray);
    }

    // Filter by tag IDs
    if (tagIds) {
      const tagIdsArray = tagIds.split(",").map((id) => id.trim()); // Handle tag IDs as strings
      if (filterClause) {
        filterClause += `AND pt.id = ANY($${queryParams.length + 1}) `;
      } else {
        filterClause += `WHERE pt.id = ANY($${queryParams.length + 1}) `;
      }
      queryParams.push(tagIdsArray);
    }

    // Add pagination parameters for limit and offset
    queryParams.push(limit, offset);

    // Update the query to include DISTINCT in json_agg for unique tags and categories
    const productsQuery = `
      SELECT 
        p.*, 
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pt.id,
              'value', pt.value,
              'created_at', pt.created_at,
              'updated_at', pt.updated_at,
              'metadata', pt.metadata
            )
          ) FILTER (WHERE pt.id IS NOT NULL), '[]'
        ) AS tags,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pc.id,
              'name', pc.name,
              'handle', pc.handle,
              'description', pc.description,
              'created_at', pc.created_at,
              'updated_at', pc.updated_at,
              'metadata', pc.metadata
            )
          ) FILTER (WHERE pc.id IS NOT NULL), '[]'
        ) AS categories
      FROM 
        public.product p
      LEFT JOIN 
        public.product_tags pt_rel ON p.id = pt_rel.product_id
      LEFT JOIN 
        public.product_tag pt ON pt_rel.product_tag_id = pt.id
      LEFT JOIN 
        public.product_category_product pc_rel ON p.id = pc_rel.product_id
      LEFT JOIN 
        public.product_category pc ON pc_rel.product_category_id = pc.id
      ${filterClause}
      GROUP BY 
        p.id
      ORDER BY 
        p.created_at DESC
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length};
    `;

    const products = await db.pool
      .query(productsQuery, queryParams)
      .then((res) => res.rows);

    res.status(200).json({
      products: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      message: "Get products failed!",
      error: error.message || "Unknown error",
    });
  }
};

// [GET] /admin/product/:id
exports.getOneProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Query to get the product details along with unique tags and categories
    const productQuery = `
      SELECT 
        p.*, 
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pt.id,
              'value', pt.value,
              'created_at', pt.created_at,
              'updated_at', pt.updated_at,
              'metadata', pt.metadata
            )
          ) FILTER (WHERE pt.id IS NOT NULL), '[]'
        ) AS tags,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pc.id,
              'name', pc.name,
              'handle', pc.handle,
              'description', pc.description,
              'created_at', pc.created_at,
              'updated_at', pc.updated_at,
              'metadata', pc.metadata
            )
          ) FILTER (WHERE pc.id IS NOT NULL), '[]'
        ) AS categories
      FROM 
        public.product p
      LEFT JOIN 
        public.product_tags pt_rel ON p.id = pt_rel.product_id
      LEFT JOIN 
        public.product_tag pt ON pt_rel.product_tag_id = pt.id
      LEFT JOIN 
        public.product_category_product pc_rel ON p.id = pc_rel.product_id
      LEFT JOIN 
        public.product_category pc ON pc_rel.product_category_id = pc.id
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
    isBestSeller = false,
    images = {
      images: [],
    },
    subtitle = "",
    description = "",
    thumbnail = "",
    originCountry = "",
    metadata = null,
    tags,
    categories,
  } = req.body;

  if (!title) {
    return res.status(400).json({
      message: "Invalid product data!",
    });
  }
  if (handle === "") handle = convertToSlug(title);

  const tagsId = [];

  // handle create new product tag
  if (tags) {
    tags.forEach(async (tag) => {
      // if tag dont have id -> create new tag
      if (tag && !tag.id) {
        await productTagController
          .createProductTagFunction(tag.value)
          .then((tagId) => {
            // console.log(res);
            if (tagId) {
              tagsId.push(tagId);
            }
          });
      } else if (tag) {
        tagsId.push(tag.id);
      }
    });
  }

  try {
    await db.pool.query(
      `INSERT INTO public.product(
	id, title, subtitle, description, isBestSeller, handle, images, thumbnail, origin_country, metadata)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
      [
        proId,
        title,
        subtitle,
        description,
        isBestSeller,
        handle,
        images,
        thumbnail,
        originCountry,
        metadata,
      ]
    );

    const tags = tagsId;
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

    if (categories?.length > 0) {
      const categoriesId = categories.map((category) => category?.id);
      const categoriesValues = categories
        .map((categoryId, index) => `($1, $${index + 2})`)
        .join(", ");
      const categoriesParams = [proId, ...categoriesId];

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

// [GET] /store/best-seller
exports.getBestSellerProducts = async (req, res) => {
  // Extract `limit` from query parameters, defaulting to 8
  const limit = parseInt(req.query.limit, 10) || 8;

  try {
    // Query to get best seller products ordered by creation date with a limit
    const bestSellerQuery = `
      SELECT * 
      FROM public.product
      WHERE isBestSeller = true
      ORDER BY created_at DESC
      LIMIT $1;
    `;

    // Execute the query with the limit parameter
    const bestSellerProducts = await db.pool
      .query(bestSellerQuery, [limit])
      .then((result) => result.rows);

    // Respond with the fetched products
    res.status(200).json({
      products: bestSellerProducts,
    });
  } catch (error) {
    console.error("Error fetching best seller products:", error); // Log the error for debugging
    res.status(500).json({
      message: "Failed to fetch best seller products!",
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

exports.updateProductFields = async (req, res) => {
  const { id: productId } = req.params;
  const { tags, categories, metadata, ...updateFields } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required!" });
  }

  if (
    Object.keys(updateFields).length === 0 &&
    !tags &&
    !categories &&
    !metadata
  ) {
    return res.status(400).json({ message: "No fields provided to update!" });
  }

  try {
    const setClauses = [];
    const values = [];
    let index = 1;

    // Build SET clause for standard fields
    for (const [key, value] of Object.entries(updateFields)) {
      setClauses.push(`${key} = $${index}`);
      values.push(value);
      index++;
    }

    // Handle metadata updates
    let metadataUpdate = null;
    const metadataValues = [];
    if (metadata) {
      metadataUpdate = "COALESCE(metadata, '{}'::jsonb)";
      Object.keys(metadata).forEach((key) => {
        metadataUpdate = `jsonb_set(${metadataUpdate}, '{${key}}', $${index}, true)`;
        metadataValues.push(JSON.stringify(metadata[key]));
        index++;
      });
    }

    // Construct the final query
    const fullSetClause = [
      ...setClauses,
      metadataUpdate ? `metadata = ${metadataUpdate}` : null,
    ]
      .filter(Boolean) // Remove null or undefined
      .join(", ");

    if (fullSetClause) {
      const query = `
        UPDATE public.product
        SET ${fullSetClause}
        WHERE id = $${index};
      `;
      await db.pool.query(query, [...values, ...metadataValues, productId]);
    }

    // Update tags
    if (tags) {
      await db.pool.query(
        `DELETE FROM public.product_tags WHERE product_id = $1`,
        [productId]
      );
      if (tags.length > 0) {
        const tagsValues = tags.map((_, i) => `($1, $${i + 2})`).join(", ");
        const tagsParams = [productId, ...tags.map((tag) => tag.id)];
        await db.pool.query(
          `INSERT INTO public.product_tags (product_id, product_tag_id) VALUES ${tagsValues}`,
          tagsParams
        );
      }
    }

    // Update categories
    if (categories) {
      await db.pool.query(
        `DELETE FROM public.product_category_product WHERE product_id = $1`,
        [productId]
      );
      if (categories.length > 0) {
        const categoriesValues = categories
          .map((_, i) => `($1, $${i + 2})`)
          .join(", ");
        const categoriesParams = [
          productId,
          ...categories.map((category) => category.id),
        ];
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
        tags: tags || [],
        categories: categories || [],
        metadata: metadata || {},
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update product failed!" });
  }
};
