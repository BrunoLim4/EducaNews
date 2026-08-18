
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const pool = require("../config/database");
const autenticarToken = require("../middleware/auth");

const router = express.Router();


// =========================================================
// PASTAS DE UPLOAD
// =========================================================

const pastaUploads = path.join(__dirname, "..", "..", "uploads");

const pastaNoticias = path.join(
    pastaUploads,
    "noticias"
);

const pastaVideos = path.join(
    pastaUploads,
    "videos"
);


// Cria as pastas automaticamente
fs.mkdirSync(pastaNoticias, {
    recursive: true
});

fs.mkdirSync(pastaVideos, {
    recursive: true
});


// =========================================================
// CONFIGURAÇÃO DO MULTER
// =========================================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        if (file.mimetype.startsWith("video/")) {

            cb(null, pastaVideos);

        } else if (file.mimetype.startsWith("image/")) {

            cb(null, pastaNoticias);

        } else {

            cb(
                new Error("Tipo de arquivo não permitido."),
                null
            );

        }

    },


    filename: (req, file, cb) => {

        /*
         * Remove caracteres problemáticos do nome original.
         * Isso evita problemas com acentos dentro do Docker/Linux.
         */

        const extensao =
            path.extname(file.originalname)
                .toLowerCase();

        const nomeBase =
            path.basename(
                file.originalname,
                extensao
            )
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9-_]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");


        const nomeFinal =
            `${Date.now()}-${nomeBase}${extensao}`;


        cb(null, nomeFinal);

    }

});


// =========================================================
// FILTRO DE ARQUIVOS
// =========================================================

function filtroArquivo(req, file, cb) {

    if (
        file.mimetype.startsWith("image/") ||
        file.mimetype.startsWith("video/")
    ) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Envie somente imagens ou vídeos."
            ),
            false
        );

    }

}


// =========================================================
// UPLOAD
// =========================================================

const upload = multer({

    storage: storage,

    fileFilter: filtroArquivo,

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
            // ARQUIVOS
            // -----------------------------------------

            let imagem = null;
            let video = null;


            if (
                req.files &&
                req.files.imagem &&
                req.files.imagem.length > 0
            ) {

                imagem =
                    `/uploads/noticias/${req.files.imagem[0].filename}`;

            }


            if (
                req.files &&
                req.files.video &&
                req.files.video.length > 0
            ) {

                video =
                    `/uploads/videos/${req.files.video[0].filename}`;

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

            console.error(
                "===================================="
            );

            console.error(
                "ERRO AO PUBLICAR NOTÍCIA:"
            );

            console.error(erro);

            console.error(
                "===================================="
            );


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


            let imagem =
                atual.rows[0].imagem;

            let video =
                atual.rows[0].video;


            // -----------------------------------------
            // NOVA IMAGEM
            // -----------------------------------------

            if (
                req.files &&
                req.files.imagem &&
                req.files.imagem.length > 0
            ) {

                imagem =
                    `/uploads/noticias/${req.files.imagem[0].filename}`;

            }


            // -----------------------------------------
            // NOVO VÍDEO
            // -----------------------------------------

            if (
                req.files &&
                req.files.video &&
                req.files.video.length > 0
            ) {

                video =
                    `/uploads/videos/${req.files.video[0].filename}`;

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
// EXCLUIR NOTÍCIA
// =========================================================

router.delete(
    "/:id",
    autenticarToken,
    async (req, res) => {

        try {

            const { id } = req.params;


            // -----------------------------------------
            // BUSCAR ARQUIVOS
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
            // EXCLUIR DO BANCO
            // -----------------------------------------

            await pool.query(
                `
                DELETE FROM noticias
                WHERE id = $1
                `,
                [id]
            );


            // -----------------------------------------
            // EXCLUIR IMAGEM
            // -----------------------------------------

            if (imagem) {

                const caminhoImagem =
                    path.join(
                        __dirname,
                        "..",
                        "..",
                        imagem.replace(
                            "/uploads/",
                            "uploads/"
                        )
                    );


                if (fs.existsSync(caminhoImagem)) {

                    fs.unlinkSync(
                        caminhoImagem
                    );

                }

            }


            // -----------------------------------------
            // EXCLUIR VÍDEO
            // -----------------------------------------

            if (video) {

                const caminhoVideo =
                    path.join(
                        __dirname,
                        "..",
                        "..",
                        video.replace(
                            "/uploads/",
                            "uploads/"
                        )
                    );


                if (fs.existsSync(caminhoVideo)) {

                    fs.unlinkSync(
                        caminhoVideo
                    );

                }

            }


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
