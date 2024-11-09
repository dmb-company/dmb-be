const db = require("../../config/db.config");
const { generateID } = require("../../lib");

// [POST] /admin/banners
exports.createBanner = async (req, res) => {
  const { image_pc, image_mobile, product_id } = req.body;
  const id = generateID("ban");

  try {
    const query = `
      INSERT INTO public.banner (id, image_pc, image_mobile, product_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *`;
    const values = [id, image_pc, image_mobile, product_id];

    const result = await db.pool.query(query, values);

    res.status(201).json({
      message: "Banner created successfully",
      banner: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({
      message: "Create banner failed!",
    });
  }
};

// [GET] /admin/banners
exports.getBanners = async (req, res) => {
  try {
    const result = await db.pool.query(
      "SELECT * FROM public.banner ORDER BY created_at DESC"
    );

    res.status(200).json({
      banners: result.rows,
    });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({
      message: "Get banners failed!",
    });
  }
};

// [DELETE] /admin/banners/:id
exports.deleteBanner = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.pool.query(
      "DELETE FROM public.banner WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Banner not found",
      });
    }

    res.status(200).json({
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({
      message: "Delete banner failed!",
    });
  }
};
