const Response = require("../../models/response");

// [GET] /admin
exports.getAdminData = (req, res) => {
  // check user info is in req
  if (!req.user) {
    return new Response(false, 401, "Unauthorized access");
  }

  // create payload
  const payload = {
    id: "test",
  };

  // Generate a new access JWT
  const accessToken = new Response().generateAccessJWT(payload);

  const response = new Response(true, 200, "Welcome admin!", {
    user: req.user,
    accessToken: accessToken,
  });

  res.status(response.code).json(response);
};
