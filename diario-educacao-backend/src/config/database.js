
const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    ...(process.env.DB_SSL === "true" && {
        ssl: {
            rejectUnauthorized: false
        }
    })
});

pool.on("connect", () => {
    console.log("✅ Conectado ao PostgreSQL");
});

pool.on("error", (err) => {
    console.error("❌ Erro no PostgreSQL:", err);
});

module.exports = pool;

