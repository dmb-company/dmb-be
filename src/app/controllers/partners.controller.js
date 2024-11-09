const db = require("../../config/db.config");
const { generateID } = require("../../lib");

// [GET] /admin/partners
exports.getPartners = async (req, res) => {
  try {
    const result = await db.pool.query(
      "SELECT * FROM public.partner ORDER BY created_at DESC"
    );

    res.status(200).json({
      partners: result.rows,
    });
  } catch (error) {
    console.error("Error fetching partners:", error);
    res.status(500).json({
      message: "Get partners failed!",
    });
  }
};

// [DELETE] /admin/partners/:id
exports.deletePartner = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.pool.query(
      "DELETE FROM public.partner WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Partner not found",
      });
    }

    res.status(200).json({
      message: "Partner deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting partner:", error);
    res.status(500).json({
      message: "Delete partner failed!",
    });
  }
};

// [POST] /admin/partners
exports.createPartner = async (req, res) => {
  const { name, image_url } = req.body;
  const id = generateID("partner");

  try {
    const query = `
      INSERT INTO public.partner (id, name, image_url, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *`;
    const values = [id, name, image_url];

    const result = await db.pool.query(query, values);

    res.status(201).json({
      message: "Partner created successfully",
      partner: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating partner:", error);
    res.status(500).json({
      message: "Create partner failed!",
    });
  }
};
