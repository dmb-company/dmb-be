const { generateID } = require("../../lib");
const db = require("../../config/db.config");

exports.createPriceRequest = async (req, res) => {
  const {
    customerName,
    customerPhone,
    customerEmail,
    product,
    detail = "",
  } = req.body;
  const id = generateID("pr");

  if (!customerName || !customerPhone || !product) {
    return res.status(400).json({
      message: "Customer name, phone, and product are required!",
    });
  }

  try {
    console.log(
      `INSERT INTO public.price_request (id, "customerName", "customerPhone", "customerEmail", product, detail, status) 
         VALUES ($1, $2, $3, $4, $5, $6, 'pending') 
         RETURNING *;`,
      [id, customerName, customerPhone, customerEmail, product, detail || ""]
    );

    const result = await db.pool.query(
      `INSERT INTO public.price_request (id, "customerName", "customerPhone", "customerEmail", product, detail, status)
         VALUES  ($1, $2, $3, $4, $5, $6, 'pending') 
       RETURNING *;`,
      [id, customerName, customerPhone, customerEmail, product, detail || ""]
    );

    res.status(201).json({
      message: "Price request created successfully!",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create price request.",
    });
  }
};

exports.getAllPriceRequests = async (req, res) => {
  try {
    const result = await db.pool.query(
      `SELECT * FROM public.price_request ORDER BY created_at DESC;`
    );
    res.status(200).json({
      requests: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch price requests.",
    });
  }
};

exports.updatePriceRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      message: "Status is required!",
    });
  }

  try {
    const result = await db.pool.query(
      `UPDATE public.price_request SET status = $1, updated_at = now() WHERE id = $2 RETURNING *;`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Price request not found!",
      });
    }

    res.status(200).json({
      message: "Price request updated successfully!",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update price request.",
    });
  }
};

exports.deletePriceRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.pool.query(
      `DELETE FROM public.price_request WHERE id = $1 RETURNING *;`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Price request not found!",
      });
    }

    res.status(200).json({
      message: "Price request deleted successfully!",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete price request.",
    });
  }
};
