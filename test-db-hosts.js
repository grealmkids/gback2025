const mysql = require("mysql2/promise");

const hosts = [
  "mysql.grealm.org",
  "grealm.org",
  "db.grealm.org",
  "localhost",
  "192.64.117.126",
];

async function testConnections() {
  for (const host of hosts) {
    try {
      console.log(`Testing connection to: ${host}`);

      const connection = await mysql.createConnection({
        host: host,
        user: "greatmcj_admin",
        password: "5AMi,4K~2Nu~",
        database: "greatmcj_grealm",
        port: 3306,
        connectTimeout: 5000,
      });

      console.log(`✅ SUCCESS: Connected to ${host}`);
      await connection.end();
      break;
    } catch (error) {
      console.log(`❌ FAILED: ${host} - ${error.message}`);
    }
  }
}

testConnections();
