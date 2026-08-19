require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("./config/database");

async function criarAdmin() {
    try {
        const nome = "SecEducation";
        const usuario = "SecEducation";
        const senha = "MAETINGA@2026";

        const senhaCriptografada = await bcrypt.hash(senha, 12);

        await pool.query(
            `INSERT INTO usuarios (nome, usuario, senha, tipo, ativo)
             VALUES ($1, $2, $3, 'admin', true)`,
            [nome, usuario, senhaCriptografada]
        );

        console.log("✅ Administrador criado com sucesso!");
        console.log("Usuário:", usuario);

    } catch (erro) {
        console.error("❌ Erro ao criar administrador:", erro);
    } finally {
        await pool.end();
    }
}

criarAdmin();