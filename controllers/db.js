require("dotenv").config();
const mysql = require("mysql2");
function createDbConnection() {
  const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.SQL_PORT,
  });
  return connection;
}

module.exports = createDbConnection;
