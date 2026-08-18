
import { useEffect, useState } from "react";

import {
    LogOut,
    Plus,
    Newspaper,
    ImagePlus,
    Video,
    X,
    Pencil,
    Trash2,
    Play,
    CalendarDays,
    FileText,
    LayoutDashboard,
    CheckCircle2,
    AlertCircle,
    Upload,
    Eye
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminPainel() {

    const navigate = useNavigate();

    const [noticias, setNoticias] = useState([]);

    const [titulo, setTitulo] = useState("");
    const [conteudo, setConteudo] = useState("");

    const [imagem, setImagem] = useState(null);
    const [video, setVideo] = useState(null);

    const [previewImagem, setPreviewImagem] = useState(null);
    const [previewVideo, setPreviewVideo] = useState(null);

    const [editando, setEditando] = useState(null);

    const [publicando, setPublicando] = useState(false);

    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");

    const token = localStorage.getItem("token");


    useEffect(() => {

        if (!token) {
            navigate("/secretaria");
            return;
        }

        carregarNoticias();

    }, []);


    async function carregarNoticias() {

        try {

            const resposta = await api.get("/noticias");

            setNoticias(
                resposta.data.noticias || []
            );

        } catch (erro) {

            console.error(
                "Erro ao carregar notícias:",
                erro
            );

        }

    }


    function sair() {

        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        navigate("/secretaria");

    }


    function selecionarImagem(e) {

        const arquivo = e.target.files[0];

        if (!arquivo) {
            return;
        }

        if (!arquivo.type.startsWith("image/")) {

            setMensagem(
                "Selecione um arquivo de imagem válido."
            );

            setTipoMensagem("erro");

            return;

        }

        setImagem(arquivo);

        setPreviewImagem(
            URL.createObjectURL(arquivo)
        );

        setMensagem("");

    }


    function selecionarVideo(e) {

        const arquivo = e.target.files[0];

        if (!arquivo) {
            return;
        }

        if (!arquivo.type.startsWith("video/")) {

            setMensagem(
                "Selecione um arquivo de vídeo válido."
            );

            setTipoMensagem("erro");

            return;

        }

        setVideo(arquivo);

        setPreviewVideo(
            URL.createObjectURL(arquivo)
        );

        setMensagem("");

    }


    function removerImagem() {

        setImagem(null);
        setPreviewImagem(null);

        const input =
            document.getElementById("imagem");

        if (input) {
            input.value = "";
        }

    }


    function removerVideo() {

        setVideo(null);
        setPreviewVideo(null);

        const input =
            document.getElementById("video");

        if (input) {
            input.value = "";
        }

    }


    function limparFormulario() {

        setTitulo("");
        setConteudo("");

        setImagem(null);
        setVideo(null);

        setPreviewImagem(null);
        setPreviewVideo(null);

        setEditando(null);

        setMensagem("");
        setTipoMensagem("");

        const inputImagem =
            document.getElementById("imagem");

        const inputVideo =
            document.getElementById("video");

        if (inputImagem) {
            inputImagem.value = "";
        }

        if (inputVideo) {
            inputVideo.value = "";
        }

    }


    function iniciarEdicao(noticia) {

        setEditando(noticia);

        setTitulo(
            noticia.titulo || ""
        );

        setConteudo(
            noticia.conteudo || ""
        );

        setImagem(null);
        setVideo(null);

        if (noticia.imagem) {

            setPreviewImagem(
                `http://localhost:3000${noticia.imagem}`
            );

        } else {

            setPreviewImagem(null);

        }

        if (noticia.video) {

            setPreviewVideo(
                `http://localhost:3000${noticia.video}`
            );

        } else {

            setPreviewVideo(null);

        }

        setMensagem("");
        setTipoMensagem("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    async function salvarNoticia(e) {

        e.preventDefault();

        setMensagem("");
        setTipoMensagem("");

        if (!titulo.trim()) {

            setMensagem(
                "Digite um título."
            );

            setTipoMensagem("erro");

            return;

        }

        if (!conteudo.trim()) {

            setMensagem(
                "Digite o conteúdo."
            );

            setTipoMensagem("erro");

            return;

        }

        try {

            setPublicando(true);

            const formulario =
                new FormData();

            formulario.append(
                "titulo",
                titulo
            );

            formulario.append(
                "conteudo",
                conteudo
            );

            if (imagem) {

                formulario.append(
                    "imagem",
                    imagem
                );

            }

            if (video) {

                formulario.append(
                    "video",
                    video
                );

            }

            if (editando) {

                await api.put(
                    `/noticias/${editando.id}`,
                    formulario,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                setMensagem(
                    "Notícia atualizada com sucesso!"
                );

            } else {

                await api.post(
                    "/noticias",
                    formulario,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                setMensagem(
                    "Notícia publicada com sucesso!"
                );

            }

            setTipoMensagem("sucesso");

            limparFormulario();

            carregarNoticias();

        } catch (erro) {

            console.error(
                "Erro:",
                erro
            );

            if (
                erro.response?.status === 401
            ) {

                sair();

                return;

            }

            setMensagem(
                erro.response?.data?.mensagem ||
                "Ocorreu um erro."
            );

            setTipoMensagem("erro");

        } finally {

            setPublicando(false);

        }

    }


    async function excluirNoticia(noticia) {

        const confirmar =
            window.confirm(
                `Deseja excluir a notícia "${noticia.titulo}"?`
            );

        if (!confirmar) {
            return;
        }

        try {

            await api.delete(
                `/noticias/${noticia.id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            if (
                editando?.id === noticia.id
            ) {

                limparFormulario();

            }

            carregarNoticias();

        } catch (erro) {

            console.error(
                "Erro ao excluir:",
                erro
            );

            if (
                erro.response?.status === 401
            ) {

                sair();

                return;

            }

            alert(
                erro.response?.data?.mensagem ||
                "Erro ao excluir notícia."
            );

        }

    }


    function formatarData(data) {

        if (!data) {
            return "";
        }

        return new Date(data)
            .toLocaleDateString(
                "pt-BR",
                {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            );

    }


    function mediaUrl(caminho) {

        if (!caminho) {
            return null;
        }

        return `http://localhost:3000${caminho}`;

    }


    return (

        <div className="admin-panel">

            {/* HEADER */}

            <header className="admin-header">

                <div className="admin-header-inner">

                    <div className="admin-brand">

                        <div className="admin-logo">
                            DE
                        </div>

                        <div className="admin-brand-text">

                            <strong>
                                Diário da Educação
                            </strong>

                            <span>
                                Painel Administrativo
                            </span>

                        </div>

                    </div>


                    <div className="admin-header-actions">

                        <div className="admin-status">
                            <span></span>
                            Sistema online
                        </div>

                        <button
                            className="admin-logout"
                            onClick={sair}
                        >

                            <LogOut size={17} />

                            <span>
                                Sair
                            </span>

                        </button>

                    </div>

                </div>

            </header>


            {/* CONTEÚDO */}

            <main className="admin-content">

                {/* TOPO */}

                <section className="admin-dashboard-heading">

                    <div>

                        <span className="admin-eyebrow">
                            <LayoutDashboard size={14} />
                            PAINEL DE CONTROLE
                        </span>

                        <h1>
                            Gerenciar notícias
                        </h1>

                        <p>
                            Publique, edite e organize as
                            notícias do Diário da Educação.
                        </p>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon">
                            <Newspaper size={21} />
                        </div>

                        <div>

                            <strong>
                                {noticias.length}
                            </strong>

                            <span>
                                notícias publicadas
                            </span>

                        </div>

                    </div>

                </section>


                {/* FORMULÁRIO */}

                <section className="admin-form-card">

                    <div className="admin-form-header">

                        <div className="admin-form-title">

                            <div className="admin-form-icon">

                                {editando
                                    ? <Pencil size={20} />
                                    : <Plus size={20} />
                                }

                            </div>

                            <div>

                                <h2>
                                    {editando
                                        ? "Editar notícia"
                                        : "Nova publicação"
                                    }
                                </h2>

                                <p>
                                    {editando
                                        ? "Atualize os dados desta publicação."
                                        : "Crie uma nova publicação para o Diário da Educação."
                                    }
                                </p>

                            </div>

                        </div>


                        {editando && (

                            <button
                                className="admin-cancel-top"
                                onClick={limparFormulario}
                                type="button"
                            >

                                <X size={16} />

                                Cancelar edição

                            </button>

                        )}

                    </div>


                    <form onSubmit={salvarNoticia}>

                        {/* MÍDIA */}

                        <div className="admin-field">

                            <div className="field-heading">

                                <label>
                                    Mídia da publicação
                                </label>

                                <span>
                                    Opcional
                                </span>

                            </div>


                            <div className="admin-media-grid">

                                {/* IMAGEM */}

                                <div className="admin-media-card">

                                    <div className="admin-media-card-header">

                                        <div>
                                            <ImagePlus size={18} />
                                            <strong>
                                                Imagem
                                            </strong>
                                        </div>

                                        {previewImagem && (
                                            <span className="media-added">
                                                <CheckCircle2 size={13} />
                                                Adicionada
                                            </span>
                                        )}

                                    </div>


                                    {!previewImagem ? (

                                        <label
                                            htmlFor="imagem"
                                            className="admin-upload-area"
                                        >

                                            <div className="upload-icon">
                                                <Upload size={23} />
                                            </div>

                                            <strong>
                                                Enviar imagem
                                            </strong>

                                            <span>
                                                JPG, PNG ou WEBP
                                            </span>

                                        </label>

                                    ) : (

                                        <div className="admin-preview">

                                            <img
                                                src={previewImagem}
                                                alt="Prévia"
                                            />

                                            <div className="preview-overlay">

                                                <label
                                                    htmlFor="imagem"
                                                    className="preview-change"
                                                >
                                                    Alterar
                                                </label>

                                                <button
                                                    type="button"
                                                    onClick={removerImagem}
                                                >
                                                    <X size={16} />
                                                </button>

                                            </div>

                                        </div>

                                    )}

                                    <input
                                        id="imagem"
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={selecionarImagem}
                                    />

                                </div>


                                {/* VÍDEO */}

                                <div className="admin-media-card">

                                    <div className="admin-media-card-header">

                                        <div>
                                            <Video size={18} />
                                            <strong>
                                                Vídeo
                                            </strong>
                                        </div>

                                        {previewVideo && (
                                            <span className="media-added">
                                                <CheckCircle2 size={13} />
                                                Adicionado
                                            </span>
                                        )}

                                    </div>


                                    {!previewVideo ? (

                                        <label
                                            htmlFor="video"
                                            className="admin-upload-area"
                                        >

                                            <div className="upload-icon">
                                                <Video size={23} />
                                            </div>

                                            <strong>
                                                Enviar vídeo
                                            </strong>

                                            <span>
                                                MP4, WEBM ou MOV
                                            </span>

                                        </label>

                                    ) : (

                                        <div className="admin-preview video">

                                            <video
                                                src={previewVideo}
                                                controls
                                                preload="metadata"
                                            />

                                            <div className="preview-overlay">

                                                <label
                                                    htmlFor="video"
                                                    className="preview-change"
                                                >
                                                    Alterar
                                                </label>

                                                <button
                                                    type="button"
                                                    onClick={removerVideo}
                                                >
                                                    <X size={16} />
                                                </button>

                                            </div>

                                        </div>

                                    )}

                                    <input
                                        id="video"
                                        type="file"
                                        accept="video/*"
                                        hidden
                                        onChange={selecionarVideo}
                                    />

                                </div>

                            </div>

                        </div>


                        {/* TÍTULO */}

                        <div className="admin-field">

                            <div className="field-heading">

                                <label htmlFor="titulo">
                                    Título
                                </label>

                                <span>
                                    {titulo.length}/200
                                </span>

                            </div>

                            <input
                                id="titulo"
                                className="admin-input"
                                type="text"
                                placeholder="Digite o título da notícia"
                                value={titulo}
                                onChange={(e) =>
                                    setTitulo(e.target.value)
                                }
                                maxLength={200}
                            />

                        </div>


                        {/* CONTEÚDO */}

                        <div className="admin-field">

                            <div className="field-heading">

                                <label htmlFor="conteudo">
                                    Conteúdo
                                </label>

                                <span>
                                    Texto da publicação
                                </span>

                            </div>

                            <textarea
                                id="conteudo"
                                className="admin-textarea"
                                rows="9"
                                placeholder="Escreva aqui o conteúdo completo da notícia..."
                                value={conteudo}
                                onChange={(e) =>
                                    setConteudo(e.target.value)
                                }
                            />

                        </div>


                        {/* MENSAGEM */}

                        {mensagem && (

                            <div
                                className={`admin-message ${tipoMensagem}`}
                            >

                                {tipoMensagem === "sucesso"
                                    ? <CheckCircle2 size={19} />
                                    : <AlertCircle size={19} />
                                }

                                <span>
                                    {mensagem}
                                </span>

                            </div>

                        )}


                        {/* AÇÕES */}

                        <div className="admin-form-actions">

                            {editando && (

                                <button
                                    type="button"
                                    className="admin-secondary-button"
                                    onClick={limparFormulario}
                                >

                                    <X size={17} />

                                    Cancelar

                                </button>

                            )}

                            <button
                                type="submit"
                                className="admin-primary-button"
                                disabled={publicando}
                            >

                                {publicando ? (

                                    <>
                                        <span className="admin-spinner"></span>
                                        Salvando...
                                    </>

                                ) : editando ? (

                                    <>
                                        <Pencil size={18} />
                                        Salvar alterações
                                    </>

                                ) : (

                                    <>
                                        <Newspaper size={18} />
                                        Publicar notícia
                                    </>

                                )}

                            </button>

                        </div>

                    </form>

                </section>


                {/* LISTA */}

                <section className="admin-list-section">

                    <div className="admin-list-header">

                        <div>

                            <span className="admin-eyebrow">
                                <FileText size={14} />
                                PUBLICAÇÕES
                            </span>

                            <h2>
                                Notícias publicadas
                            </h2>

                            <p>
                                Gerencie as publicações existentes.
                            </p>

                        </div>


                        <div className="admin-list-count">
                            {noticias.length}
                        </div>

                    </div>


                    {noticias.length === 0 ? (

                        <div className="admin-empty">

                            <div className="admin-empty-icon">
                                <Newspaper size={30} />
                            </div>

                            <h3>
                                Nenhuma notícia publicada
                            </h3>

                            <p>
                                As publicações aparecerão aqui
                                depois que forem criadas.
                            </p>

                        </div>

                    ) : (

                        <div className="admin-news-list">

                            {noticias.map((noticia) => (

                                <article
                                    className="admin-news-card"
                                    key={noticia.id}
                                >

                                    {/* MÍDIA */}

                                    <div className="admin-news-thumbnail">

                                        {noticia.imagem ? (

                                            <img
                                                src={mediaUrl(
                                                    noticia.imagem
                                                )}
                                                alt={noticia.titulo}
                                            />

                                        ) : noticia.video ? (

                                            <div className="admin-video-thumbnail">

                                                <video
                                                    src={mediaUrl(
                                                        noticia.video
                                                    )}
                                                    preload="metadata"
                                                />

                                                <div className="admin-video-play">
                                                    <Play
                                                        size={19}
                                                        fill="currentColor"
                                                    />
                                                </div>

                                            </div>

                                        ) : (

                                            <div className="admin-no-media">
                                                <Newspaper size={27} />
                                            </div>

                                        )}

                                    </div>


                                    {/* INFORMAÇÕES */}

                                    <div className="admin-news-details">

                                        <div className="admin-news-date">

                                            <CalendarDays size={14} />

                                            {formatarData(
                                                noticia.criado_em
                                            )}

                                        </div>


                                        <h3>
                                            {noticia.titulo}
                                        </h3>


                                        <p>
                                            {noticia.conteudo}
                                        </p>


                                        <div className="admin-news-tags">

                                            {noticia.imagem && (

                                                <span>
                                                    <ImagePlus size={13} />
                                                    Imagem
                                                </span>

                                            )}

                                            {noticia.video && (

                                                <span>
                                                    <Video size={13} />
                                                    Vídeo
                                                </span>

                                            )}

                                        </div>

                                    </div>


                                    {/* AÇÕES */}

                                    <div className="admin-news-actions">

                                        <button
                                            className="admin-view-button"
                                            title="Visualizar"
                                            onClick={() =>
                                                navigate(
                                                    `/noticia/${noticia.id}`
                                                )
                                            }
                                        >

                                            <Eye size={17} />

                                        </button>


                                        <button
                                            className="admin-edit-button"
                                            title="Editar"
                                            onClick={() =>
                                                iniciarEdicao(noticia)
                                            }
                                        >

                                            <Pencil size={17} />

                                        </button>


                                        <button
                                            className="admin-delete-button"
                                            title="Excluir"
                                            onClick={() =>
                                                excluirNoticia(noticia)
                                            }
                                        >

                                            <Trash2 size={17} />

                                        </button>

                                    </div>

                                </article>

                            ))}

                        </div>

                    )}

                </section>

            </main>

        </div>

    );

}

export default AdminPainel;

