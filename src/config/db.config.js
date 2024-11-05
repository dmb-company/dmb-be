const Pool = require("pg").Pool;
require("dotenv").config({ path: "./.env" });

const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = {
  pool,
};
