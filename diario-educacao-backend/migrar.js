const { Pool } = require("pg");

const pool = new Pool({
    host: "dpg-da259715efls73ct5fog-a.oregon-postgres.render.com",
    user: "diario_admin",
    password: "g8xeW6F9ZkAH4bnDpxzFL2haRQkumDXF",
    database: "diario_educacao",
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

const sqlSchema = `
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(30) NOT NULL DEFAULT 'admin',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS noticias (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    conteudo TEXT NOT NULL,
    imagem TEXT,
    video TEXT,
    autor_id INTEGER,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_noticias_autor
        FOREIGN KEY (autor_id)
        REFERENCES usuarios(id)
        ON DELETE SET NULL
);

ALTER TABLE noticias ADD COLUMN IF NOT EXISTS video TEXT;

CREATE INDEX IF NOT EXISTS idx_noticias_criado_em ON noticias(criado_em DESC);
`;

async function rodarMigracao() {
    try {
        console.log("⏳ Conectando e criando tabelas no Render...");
        await pool.query(sqlSchema);
        console.log("✅ Tabelas criadas com sucesso!");
        process.exit(0);
    } catch (erro) {
        console.error("❌ Erro ao criar tabelas:", erro);
        process.exit(1);
    }
}

rodarMigracao();