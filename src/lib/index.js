const crypto = require("crypto");

exports.generateID = (head) => {
  return head + "_" + crypto.randomBytes(16).toString("hex");
};

exports.convertToSlug = (title) => {
  return title
    .toLowerCase() // Convert to lowercase
    .normalize("NFD") // Normalize string to decompose accents
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/đ/g, "d") // Replace "đ" with "d"
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .trim() // Remove whitespace from start and end
    .replace(/\s+/g, "-"); // Replace spaces with hyphens
};
