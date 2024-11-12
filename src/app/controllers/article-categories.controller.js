const db = require("../../config/db.config");
const { generateID } = require("../../lib");

// [GET] /article-categories - Get all article categories
exports.getAllArticleCategories = (req, res) => {
  db.pool.query("SELECT * FROM public.article_category", (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch article categories.",
      });
    }
    res.status(200).json({
      articleCategories: result.rows,
    });
  });
};

// [GET] /article-categories/:id - Get a single article category by ID
exports.getArticleCategoryById = (req, res) => {
  const { id } = req.params;
  db.pool.query(
    "SELECT * FROM public.article_category WHERE id = $1",
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to fetch article category.",
        });
      }
      if (result.rowCount === 0) {
        return res.status(404).json({
          message: "Article category not found.",
        });
      }
      res.status(200).json({
        data: result.rows[0],
      });
    }
  );
};

// [POST] /article-categories - Create a new article category
exports.createArticleCategory = (req, res) => {
  const id = generateID("acat");
  const { title, description, image, metadata } = req.body;
  const query = `
    INSERT INTO public.article_category (id, title, description, image, metadata, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING *`;
  const values = [id, title, description, image, metadata];

  db.pool.query(query, values, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to create article category.",
      });
    }
    res.status(201).json({
      message: "Article category created successfully.",
      data: result.rows[0],
    });
  });
};

// [PATCH] /admin/article-categories/:id
exports.updateArticleCategory = async (req, res) => {
  const { id } = req.params;
  const { title, description, image, metadata } = req.body;

  try {
    // If `metadata` is initially `null`, initialize it as an empty JSON object
    let metadataUpdate = "COALESCE(metadata, '{}'::jsonb)";
    const metadataValues = [];

    // If `metadata` is provided in the request, construct the `jsonb_set` chain
    if (metadata) {
      Object.keys(metadata).forEach((key, index) => {
        // Serialize each value in metadata to a JSON string
        const value = JSON.stringify(metadata[key]);

        // Build the jsonb_set chain dynamically for each metadata key
        metadataUpdate = `jsonb_set(${metadataUpdate}, '{${key}}', $${
          index + 2
        }::jsonb, true)`;

        // Store the serialized JSON value in metadataValues array
        metadataValues.push(value);
      });
    }

    // Generate the SQL query with dynamic metadata update
    const query = `
      UPDATE public.article_category
      SET
        title = COALESCE($1, title),
        description = COALESCE($${metadataValues.length + 2}, description),
        image = COALESCE($${metadataValues.length + 3}, image),
        metadata = ${metadataUpdate},
        updated_at = NOW()
      WHERE id = $${metadataValues.length + 4}
      RETURNING *`;

    const values = [
      title,
      ...metadataValues, // Spread serialized metadata values for dynamic placeholders
      description,
      image,
      id,
    ];

    const result = await db.pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Article category not found",
      });
    }

    res.status(200).json({
      message: "Article category updated successfully",
      articleCategory: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating article category:", error);
    res.status(500).json({
      message: "Update article category failed!",
    });
  }
};

// [DELETE] /article-categories/:id - Delete an article category
exports.deleteArticleCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Step 1: Set category_id to NULL for all articles with this category_id
    const updateQuery =
      "UPDATE public.article SET category_id = NULL WHERE category_id = $1";
    await db.pool.query(updateQuery, [id]);

    // Step 2: Delete the category
    const deleteQuery =
      "DELETE FROM public.article_category WHERE id = $1 RETURNING *";
    const deleteResult = await db.pool.query(deleteQuery, [id]);

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({
        message: "Article category not found.",
      });
    }

    res.status(200).json({
      message: "Article category deleted successfully.",
      data: deleteResult.rows[0],
    });
  } catch (err) {
    console.error("Error deleting article category:", err);
    res.status(500).json({
      message: "Failed to delete article category.",
    });
  }
};
