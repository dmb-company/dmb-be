const Pool = require("pg").Pool;
export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "dmb",
  password: "12345",
  port: 5432,
});

const Response = require("./models/response");
