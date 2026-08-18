const fs = require("fs");
const path = require("path");
const express = require("express");
const autenticarToken = require("./middleware/auth");
const cors = require("cors");
const pool = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const noticiasRoutes = require("./routes/noticiasRoutes");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// CONFIGURAÇÃO DO UPLOAD
// ===============================

const pastaUploads = path.join(
    __dirname,
    "..",
    "uploads",
    "noticias"
);

// Cria a pasta automaticamente caso não exista
fs.mkdirSync(pastaUploads, {
    recursive: true
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, pastaUploads);
    },

    filename: (req, file, cb) => {
        const nomeUnico = `${Date.now()}-${file.originalname}`;
        cb(null, nomeUnico);
    }
});

const upload = multer({
    storage: storage
});

// Permite acessar os arquivos enviados
app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "..", "uploads")
    )
);

// ===============================
// ROTAS DE AUTENTICAÇÃO
// ===============================

app.use("/api/auth", authRoutes);

// ===============================
// ROTAS DE NOTÍCIAS
// ===============================

app.use("/api/noticias", noticiasRoutes);

// ===============================
// ROTA ADMINISTRATIVA DE TESTE
// ===============================

app.get(
    "/api/admin/teste",
    autenticarToken,
    (req, res) => {
        res.json({
            mensagem: "Acesso autorizado à área administrativa.",
            usuario: req.usuario
        });
    }
);

// ===============================
// ROTA DE TESTE DO UPLOAD
// ===============================

app.post(
    "/api/upload/teste",
    autenticarToken,
    upload.single("imagem"),
    (req, res) => {

        if (!req.file) {
            return res.status(400).json({
                mensagem: "Nenhuma imagem foi enviada."
            });
        }

        res.json({
            mensagem: "Imagem enviada com sucesso.",
            arquivo: req.file.filename,
            caminho: req.file.path,
            url: `/uploads/noticias/${req.file.filename}`
        });
    }
);

// ===============================
// ROTA PRINCIPAL
// ===============================

app.get("/", (req, res) => {
    res.json({
        sistema: "Diário da Educação de Maetinga",
        status: "online"
    });
});

// ===============================
// TESTE DO POSTGRESQL
// ===============================

app.get("/api/teste-banco", async (req, res) => {

    try {

        const resultado = await pool.query(
            "SELECT NOW()"
        );

        res.json({
            banco: "PostgreSQL",
            conectado: true,
            horario: resultado.rows[0].now
        });

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            banco: "PostgreSQL",
            conectado: false,
            erro: erro.message
        });
    }
});

// ===============================
// INICIAR SERVIDOR
// ===============================

const PORT = process.env.PORT || 3000;
app.get("/api/criar-tabela-noticias", async (req, res) => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS noticias (
                id SERIAL PRIMARY KEY,
                titulo VARCHAR(255) NOT NULL,
                conteudo TEXT NOT NULL,
                imagem TEXT,
                video TEXT,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        res.json({
            sucesso: true,
            mensagem: "Tabela noticias criada com sucesso."
        });

    } catch (erro) {
        console.error("Erro ao criar tabela noticias:", erro);

        res.status(500).json({
            sucesso: false,
            erro: erro.message
        });
    }
});
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});