const db = require("../../config/db.config");
const { generateID } = require("../../lib");

// [POST] /admin/articles
exports.createArticle = async (req, res) => {
  const id = generateID("art");
  const { title, description, content, image, metadata, category_id } =
    req.body;

  try {
    const query = `
      INSERT INTO public.article (id, title, description, content, image, metadata, category_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, NOW(), NOW())
      RETURNING *`;

    const values = [
      id,
      title,
      description,
      content,
      image,
      metadata || {},
      category_id,
    ];

    const result = await db.pool.query(query, values);

    res.status(201).json({
      message: "Article created successfully",
      article: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({
      message: "Failed to create article",
    });
  }
};

exports.getArticles = async (req, res) => {
  try {
    // Extract filter and pagination parameters from the query string
    const { title, category_id, date, limit, offset } = req.query;

    // Initialize query with the main part and filtering logic
    let query = `
      SELECT 
        a.*, 
        -- Category details for each article
        COALESCE(
          json_agg(
            CASE WHEN ac.id IS NOT NULL THEN
              jsonb_build_object(
                'id', ac.id,
                'title', ac.title,
                'description', ac.description,
                'image', ac.image,
                'metadata', ac.metadata
              )
            END
          ) FILTER (WHERE ac.id IS NOT NULL), '[]'
        ) AS categories
      FROM public.article a
      LEFT JOIN public.article_category ac ON a.category_id = ac.id
    `;

    // Array to hold query conditions
    const conditions = [];
    const values = [];

    // Add filters to the conditions array if parameters are provided
    if (title) {
      conditions.push(`a.title ILIKE $${conditions.length + 1}`);
      values.push(`%${title}%`);
    }

    if (category_id) {
      conditions.push(`a.category_id = $${conditions.length + 1}`);
      values.push(category_id);
    }

    if (date) {
      conditions.push(`a.date = $${conditions.length + 1}`);
      values.push(date);
    }

    // If there are any conditions, add them to the WHERE clause
    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(" AND ");
    }

    // Group by article ID to prevent duplication of results
    query += ` GROUP BY a.id`;

    // Add ORDER BY clause to sort by created_at in descending order
    query += ` ORDER BY a.created_at DESC`;

    // Add LIMIT and OFFSET if they are provided
    if (limit) {
      values.push(limit);
      query += ` LIMIT $${values.length}`;
    }

    if (offset) {
      values.push(offset);
      query += ` OFFSET $${values.length}`;
    }

    const result = await db.pool.query(query, values);

    res.status(200).json({
      articles: result.rows,
    });
  } catch (error) {
    console.error("Error fetching articles with category information:", error);
    res.status(500).json({
      message: "Failed to retrieve articles",
    });
  }
};

exports.getOneArticle = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT 
        a.*, 
        -- Category details for the specific article
        COALESCE(
          json_agg(
            CASE WHEN ac.id IS NOT NULL THEN
              jsonb_build_object(
                'id', ac.id,
                'title', ac.title,
                'description', ac.description,
                'image', ac.image,
                'metadata', ac.metadata
              )
            END
          ) FILTER (WHERE ac.id IS NOT NULL), '[]'
        ) AS categories
      FROM public.article a
      LEFT JOIN public.article_category ac ON a.category_id = ac.id
      WHERE a.id = $1
      GROUP BY a.id
    `;

    const result = await db.pool.query(query, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching article with category information:", error);
    res.status(500).json({
      message: "Failed to retrieve article",
    });
  }
};

// [PATCH] /admin/articles/:id
exports.updateArticle = async (req, res) => {
  const { id } = req.params;
  const { title, description, content, image, metadata, category_id } =
    req.body;

  try {
    let metadataUpdate = "COALESCE(metadata, '{}'::jsonb)";
    const metadataValues = [];

    if (metadata) {
      Object.keys(metadata).forEach((key, index) => {
        const value = JSON.stringify(metadata[key]);
        metadataUpdate = `jsonb_set(${metadataUpdate}, '{${key}}', $${
          index + 2
        }::jsonb, true)`;
        metadataValues.push(value);
      });
    }

    const query = `
      UPDATE public.article
      SET
        title = COALESCE($1, title),
        description = COALESCE($${metadataValues.length + 2}, description),
        content = COALESCE($${metadataValues.length + 3}, content),
        image = COALESCE($${metadataValues.length + 4}, image),
        metadata = ${metadataUpdate},
        category_id = COALESCE($${metadataValues.length + 5}, category_id),
        updated_at = NOW()
      WHERE id = $${metadataValues.length + 6}
      RETURNING *`;

    const values = [
      title,
      ...metadataValues,
      description,
      content,
      image,
      category_id,
      id,
    ];

    const result = await db.pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    res.status(200).json({
      message: "Article updated successfully",
      article: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).json({
      message: "Failed to update article",
    });
  }
};

// [DELETE] /admin/articles/:id
exports.deleteArticle = async (req, res) => {
  const { id } = req.params;

  try {
    const query = "DELETE FROM public.article WHERE id = $1 RETURNING *";
    const result = await db.pool.query(query, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    res.status(200).json({
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({
      message: "Failed to delete article",
    });
  }
};
