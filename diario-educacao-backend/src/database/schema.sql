-- ==========================================
-- USUÁRIOS
-- ==========================================

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(30) NOT NULL DEFAULT 'admin',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- NOTÍCIAS
-- ==========================================

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


-- ==========================================
-- GARANTIR COLUNA DE VÍDEO
-- ==========================================

ALTER TABLE noticias
ADD COLUMN IF NOT EXISTS video TEXT;


-- ==========================================
-- ÍNDICES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_noticias_criado_em
ON noticias(criado_em DESC);

