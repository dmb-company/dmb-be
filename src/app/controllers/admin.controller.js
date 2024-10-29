const Response = require("../../models/response");

// [GET] /admin/login
exports.login = (req, res) => {
  const user = req.body.user;
  // check user's info is exist in req
  if (!user) return new Response(false, 401, "Unauthorized access!");

  // create payload
  const payload = {
    id: "admin",
  };

  const accessToken = new Response().generateAccessJWT(payload);
  const response = new Response(true, 200, "Welcome admin!", {
    user: req.user,
    accessToken: accessToken,
  });

  res.status(response.code).json(response);
};
