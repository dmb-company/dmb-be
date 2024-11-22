const db = require("../../config/db.config");

// [GET] /store
exports.getStoreData = (req, res) => {
  db.pool.query("select * from store", (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Query store failed!",
      });
    }
    res.status(200).json({
      data: result.rows,
    });
  });
};

// [PATCH] /admin/store/:id
exports.updateStore = async (req, res) => {
  const id = "store_dmbroot";
  const { name, metadata } = req.body;

  try {
    let metadataUpdate = "COALESCE(metadata, '{}'::jsonb)"; // Initialize metadata if null
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
      UPDATE public.store
      SET
        name = COALESCE($1, name),
        metadata = ${metadataUpdate},
        updated_at = NOW()
      WHERE id = $${metadataValues.length + 2}
      RETURNING *`;

    console.log(query);

    const values = [
      name,
      ...metadataValues, // Spread serialized metadata values for dynamic placeholders
      id,
    ];

    const result = await db.pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    res.status(200).json({
      message: "Store updated successfully",
      store: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating store:", error);
    res.status(500).json({
      message: "Update store failed!",
    });
  }
};
