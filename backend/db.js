const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  uri: process.env.DB_URI.split('?')[0].replace('/defaultdb', '/aiven') + "?ssl={\"rejectUnauthorized\":false}",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
