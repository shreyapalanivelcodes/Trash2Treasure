const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ use .env secret
    req.user = decoded; // entire JWT payload
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token is not valid" });
  }
};
