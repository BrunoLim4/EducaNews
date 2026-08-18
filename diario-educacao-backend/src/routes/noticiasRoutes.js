const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const pool = require("../config/database");
const autenticarToken = require("../middleware/auth");

const router = express.Router();

// =========================================================
// CONFIGURAÇÃO DO CLOUDINARY
// =========================================================

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "educanews", // Nome da pasta que será criada lá no Cloudinary
        resource_type: "auto", // Mágica: "auto" permite que ele aceite tanto imagem quanto vídeo
        allowed_formats: ["jpg", "jpeg", "png", "webp", "mp4", "webm", "mov"]
    }
});


// =========================================================
// UPLOAD
// =========================================================

const upload = multer({
    storage: storage,
    limits: {
        /*
         * 500 MB para permitir vídeos maiores.
         */
        fileSize: 500 * 1024 * 1024
    }
});


// =========================================================
// LISTAR NOTÍCIAS
// =========================================================

router.get("/", async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                id,
                titulo,
                conteudo,
                imagem,
                video,
                criado_em
            FROM noticias
            ORDER BY criado_em DESC
        `);

        res.json({
            noticias: resultado.rows
        });

    } catch (erro) {
        console.error(
            "Erro ao listar notícias:",
            erro
        );

        res.status(500).json({
            mensagem:
                "Erro ao carregar notícias."
        });
    }
});


// =========================================================
// BUSCAR UMA NOTÍCIA
// =========================================================

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            `
            SELECT
                id,
                titulo,
                conteudo,
                imagem,
                video,
                criado_em
            FROM noticias
            WHERE id = $1
            `,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensagem:
                    "Notícia não encontrada."
            });
        }

        res.json({
            noticia:
                resultado.rows[0]
        });

    } catch (erro) {
        console.error(
            "Erro ao buscar notícia:",
            erro
        );

        res.status(500).json({
            mensagem:
                "Erro ao buscar notícia."
        });
    }
});


// =========================================================
// CRIAR NOTÍCIA
// =========================================================

router.post(
    "/",
    autenticarToken,
    upload.fields([
        {
            name: "imagem",
            maxCount: 1
        },
        {
            name: "video",
            maxCount: 1
        }
    ]),
    async (req, res) => {
        try {
            const {
                titulo,
                conteudo
            } = req.body;

            // -----------------------------------------
            // VALIDAÇÕES
            // -----------------------------------------

            if (!titulo || !titulo.trim()) {
                return res.status(400).json({
                    mensagem:
                        "O título é obrigatório."
                });
            }

            if (!conteudo || !conteudo.trim()) {
                return res.status(400).json({
                    mensagem:
                        "O conteúdo é obrigatório."
                });
            }

            // -----------------------------------------
            // ARQUIVOS (URL do Cloudinary)
            // -----------------------------------------

            let imagem = null;
            let video = null;

            // O Cloudinary devolve a URL pronta na propriedade .path
            if (
                req.files &&
                req.files.imagem &&
                req.files.imagem.length > 0
            ) {
                imagem = req.files.imagem[0].path;
            }

            if (
                req.files &&
                req.files.video &&
                req.files.video.length > 0
            ) {
                video = req.files.video[0].path;
            }

            // -----------------------------------------
            // SALVAR NO BANCO
            // -----------------------------------------

            const resultado = await pool.query(
                `
                INSERT INTO noticias
                (
                    titulo,
                    conteudo,
                    imagem,
                    video
                )
                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4
                )
                RETURNING
                    id,
                    titulo,
                    conteudo,
                    imagem,
                    video,
                    criado_em
                `,
                [
                    titulo.trim(),
                    conteudo.trim(),
                    imagem,
                    video
                ]
            );

            res.status(201).json({
                mensagem:
                    "Notícia publicada com sucesso.",
                noticia:
                    resultado.rows[0]
            });

        } catch (erro) {
            console.error("====================================");
            console.error("ERRO AO PUBLICAR NOTÍCIA:");
            console.error(erro);
            console.error("====================================");

            res.status(500).json({
                mensagem:
                    "Erro ao publicar notícia.",
                erro:
                    process.env.NODE_ENV === "development"
                        ? erro.message
                        : undefined
            });
        }
    }
);


// =========================================================
// EDITAR NOTÍCIA
// =========================================================

router.put(
    "/:id",
    autenticarToken,
    upload.fields([
        {
            name: "imagem",
            maxCount: 1
        },
        {
            name: "video",
            maxCount: 1
        }
    ]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const {
                titulo,
                conteudo
            } = req.body;

            if (!titulo || !titulo.trim()) {
                return res.status(400).json({
                    mensagem:
                        "O título é obrigatório."
                });
            }

            if (!conteudo || !conteudo.trim()) {
                return res.status(400).json({
                    mensagem:
                        "O conteúdo é obrigatório."
                });
            }

            // -----------------------------------------
            // BUSCAR NOTÍCIA ATUAL
            // -----------------------------------------

            const atual =
                await pool.query(
                    `
                    SELECT
                        imagem,
                        video
                    FROM noticias
                    WHERE id = $1
                    `,
                    [id]
                );

            if (atual.rows.length === 0) {
                return res.status(404).json({
                    mensagem:
                        "Notícia não encontrada."
                });
            }

            let imagem = atual.rows[0].imagem;
            let video = atual.rows[0].video;

            // -----------------------------------------
            // NOVOS ARQUIVOS (Se enviados)
            // -----------------------------------------

            if (
                req.files &&
                req.files.imagem &&
                req.files.imagem.length > 0
            ) {
                imagem = req.files.imagem[0].path;
            }

            if (
                req.files &&
                req.files.video &&
                req.files.video.length > 0
            ) {
                video = req.files.video[0].path;
            }

            // -----------------------------------------
            // ATUALIZAR
            // -----------------------------------------

            const resultado =
                await pool.query(
                    `
                    UPDATE noticias
                    SET
                        titulo = $1,
                        conteudo = $2,
                        imagem = $3,
                        video = $4
                    WHERE id = $5
                    RETURNING
                        id,
                        titulo,
                        conteudo,
                        imagem,
                        video,
                        criado_em
                    `,
                    [
                        titulo.trim(),
                        conteudo.trim(),
                        imagem,
                        video,
                        id
                    ]
                );

            res.json({
                mensagem:
                    "Notícia atualizada com sucesso.",
                noticia:
                    resultado.rows[0]
            });

        } catch (erro) {
            console.error(
                "Erro ao atualizar notícia:",
                erro
            );

            res.status(500).json({
                mensagem:
                    "Erro ao atualizar notícia.",
                erro:
                    process.env.NODE_ENV === "development"
                        ? erro.message
                        : undefined
            });
        }
    }
);


// =========================================================
// EXCLUIR NOTÍCIA E MÍDIAS DO CLOUDINARY
// =========================================================

// Função para extrair o ID Público da imagem direto da URL gerada pelo Cloudinary
const extrairPublicId = (url) => {
    const partes = url.split("/");
    const arquivoComExtensao = partes.pop(); // arquivo.jpg
    const pasta = partes.pop(); // educanews
    const nomeArquivo = arquivoComExtensao.split(".")[0]; // arquivo
    return `${pasta}/${nomeArquivo}`;
};

router.delete(
    "/:id",
    autenticarToken,
    async (req, res) => {
        try {
            const { id } = req.params;

            // -----------------------------------------
            // BUSCAR ARQUIVOS NO BANCO
            // -----------------------------------------

            const noticia =
                await pool.query(
                    `
                    SELECT
                        imagem,
                        video
                    FROM noticias
                    WHERE id = $1
                    `,
                    [id]
                );

            if (noticia.rows.length === 0) {
                return res.status(404).json({
                    mensagem:
                        "Notícia não encontrada."
                });
            }

            const {
                imagem,
                video
            } = noticia.rows[0];


            // -----------------------------------------
            // EXCLUIR IMAGEM DO CLOUDINARY
            // -----------------------------------------

            if (imagem && imagem.includes("cloudinary")) {
                const publicId = extrairPublicId(imagem);
                await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
            }

            // -----------------------------------------
            // EXCLUIR VÍDEO DO CLOUDINARY
            // -----------------------------------------

            if (video && video.includes("cloudinary")) {
                const publicId = extrairPublicId(video);
                await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
            }

            // -----------------------------------------
            // EXCLUIR DO BANCO
            // -----------------------------------------

            await pool.query(
                `
                DELETE FROM noticias
                WHERE id = $1
                `,
                [id]
            );

            res.json({
                mensagem:
                    "Notícia excluída com sucesso."
            });

        } catch (erro) {
            console.error(
                "Erro ao excluir notícia:",
                erro
            );

            res.status(500).json({
                mensagem:
                    "Erro ao excluir notícia."
            });
        }
    }
);


// =========================================================
// TRATAMENTO DE ERRO DO MULTER
// =========================================================

router.use(
    (erro, req, res, next) => {
        console.error(
            "Erro no upload:",
            erro
        );

        if (
            erro instanceof multer.MulterError
        ) {
            if (
                erro.code === "LIMIT_FILE_SIZE"
            ) {
                return res.status(400).json({
                    mensagem:
                        "O arquivo é muito grande. O limite é de 500 MB."
                });
            }

            return res.status(400).json({
                mensagem:
                    `Erro no upload: ${erro.message}`
            });
        }

        if (erro) {
            return res.status(400).json({
                mensagem:
                    erro.message ||
                    "Erro ao enviar arquivo."
            });
        }

        next();
    }
);


module.exports = router;