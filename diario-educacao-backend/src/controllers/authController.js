const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

async function login(req, res) {
    try {
        const { usuario, senha } = req.body;

        if (!usuario || !senha) {
            return res.status(400).json({
                mensagem: "Usuário e senha são obrigatórios."
            });
        }

        const resultado = await pool.query(
            `SELECT id, nome, usuario, senha, tipo, ativo
             FROM usuarios
             WHERE usuario = $1`,
            [usuario]
        );

        if (resultado.rows.length === 0) {
            return res.status(401).json({
                mensagem: "Usuário ou senha inválidos."
            });
        }

        const admin = resultado.rows[0];

        if (!admin.ativo) {
            return res.status(403).json({
                mensagem: "Usuário desativado."
            });
        }

        const senhaValida = await bcrypt.compare(
            senha,
            admin.senha
        );

        if (!senhaValida) {
            return res.status(401).json({
                mensagem: "Usuário ou senha inválidos."
            });
        }

        const token = jwt.sign(
            {
                id: admin.id,
                usuario: admin.usuario,
                tipo: admin.tipo
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "8h"
            }
        );

        res.json({
            mensagem: "Login realizado com sucesso.",
            token,
            usuario: {
                id: admin.id,
                nome: admin.nome,
                usuario: admin.usuario,
                tipo: admin.tipo
            }
        });

    } catch (erro) {
        console.error("Erro no login:", erro);

        res.status(500).json({
            mensagem: "Erro interno do servidor."
        });
    }
}

module.exports = {
    login
};