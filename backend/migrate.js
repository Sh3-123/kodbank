const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  try {
    const connection = await mysql.createConnection(process.env.DB_URI.split('?')[0] + "?ssl={\"rejectUnauthorized\":false}");

    await connection.query('CREATE DATABASE IF NOT EXISTS aiven');
    await connection.query('USE aiven');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS koduser (
        uid INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        balance DECIMAL(15, 2) DEFAULT 100000.00,
        phone VARCHAR(50),
        role VARCHAR(50) DEFAULT 'customer'
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS usertoken (
        tid INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(1000) NOT NULL,
        uid INT NOT NULL,
        expiry DATETIME NOT NULL,
        FOREIGN KEY (uid) REFERENCES koduser(uid) ON DELETE CASCADE
      )
    `);

    console.log('Migration successful');
    connection.end();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
