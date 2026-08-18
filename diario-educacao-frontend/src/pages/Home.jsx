
import { useEffect, useState } from "react";
import logo from "../assets/Maetinga horizontalai.png";
import {
    ArrowRight,
    CalendarDays,
    Menu,
    Search,
    Play,
    Video,
    Phone,
    MapPin,
    Mail
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import api from "../services/api";
function Home() {

    const navigate = useNavigate();

    const [noticias, setNoticias] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(false);
    const [busca, setBusca] = useState("");

    useEffect(() => {

        async function buscarNoticias() {

            try {

                setCarregando(true);
                setErro(false);

                const resposta = await api.get("/noticias");

                console.log("NOTÍCIAS RECEBIDAS:", resposta.data);

                setNoticias(resposta.data.noticias || []);

            } catch (error) {

                console.error(
                    "Erro ao buscar notícias:",
                    error
                );

                setErro(true);

            } finally {

                setCarregando(false);

            }

        }

        buscarNoticias();

    }, []);


    function formatarData(data) {

        if (!data) {
            return "";
        }

        return new Date(data).toLocaleDateString(
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


    function abrirNoticia(id) {

        navigate(`/noticia/${id}`);

    }


    const noticiasFiltradas = noticias.filter((noticia) => {

        if (!busca.trim()) {
            return true;
        }

        const textoBusca = busca.toLowerCase();

        return (
            noticia.titulo?.toLowerCase().includes(textoBusca) ||
            noticia.conteudo?.toLowerCase().includes(textoBusca)
        );

    });


    const noticiaPrincipal = noticiasFiltradas[0];

    const outrasNoticias = noticiasFiltradas.slice(1);


    return (

        <div className="site">

            {/* =====================================================
                BANNER / CABEÇALHO
            ====================================================== */}

            <header className="top-header">

                <div className="header-content">

                    <div
                        className="brand"
                        onClick={() => navigate("/")}
                    >

                        <div className="brand-text">

                            <strong>
                                EducaNews
                            </strong>

                            <span>
                                Secretaria de Educação de Maetinga
                            </span>

                        </div>

                    </div>

                </div>

            </header>


            {/* =====================================================
                CONTEÚDO PRINCIPAL
            ====================================================== */}

            <main>

                {/* BUSCA */}

                <section className="search-area">

                    <div className="search-box">

                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Pesquisar notícias..."
                            value={busca}
                            onChange={(e) =>
                                setBusca(e.target.value)
                            }
                        />

                    </div>

                </section>


                {/* =================================================
                    NOTÍCIA PRINCIPAL
                ================================================== */}

                <section className="featured-section">

                    <div className="featured-container">

                        <div className="featured-content">

                            <span className="today-label">
                                EDIÇÃO DE HOJE
                            </span>


                            {carregando && (

                                <div className="loading">
                                    Carregando notícias...
                                </div>

                            )}


                            {erro && (

                                <div className="error-message">

                                    Não foi possível carregar
                                    as notícias.

                                </div>

                            )}


                            {!carregando &&
                                !erro &&
                                noticiaPrincipal && (

                                    <>

                                        <h1>
                                            {noticiaPrincipal.titulo}
                                        </h1>


                                        <p>
                                            {noticiaPrincipal.conteudo}
                                        </p>


                                        <div className="featured-date">

                                            <CalendarDays size={15} />

                                            {formatarData(
                                                noticiaPrincipal.criado_em
                                            )}

                                        </div>


                                        <button
                                            className="featured-button"
                                            onClick={() =>
                                                abrirNoticia(
                                                    noticiaPrincipal.id
                                                )
                                            }
                                        >

                                            Ler notícia

                                            <ArrowRight size={18} />

                                        </button>

                                    </>

                                )}


                            {!carregando &&
                                !erro &&
                                !noticiaPrincipal && (

                                    <>

                                        <h1>
                                            Informação que
                                            <span>
                                                {" "}transforma.
                                            </span>
                                        </h1>

                                        <p>
                                            Acompanhe as principais
                                            notícias da educação
                                            de Maetinga.
                                        </p>

                                    </>

                                )}

                        </div>


                        {/* MÍDIA */}

                        <div
                            className="featured-media"
                            onClick={() =>
                                noticiaPrincipal &&
                                abrirNoticia(
                                    noticiaPrincipal.id
                                )
                            }
                        >

                            {noticiaPrincipal?.imagem ? (

                                <img
                                    src={mediaUrl(
                                        noticiaPrincipal.imagem
                                    )}
                                    alt={noticiaPrincipal.titulo}
                                />

                            ) : noticiaPrincipal?.video ? (

                                <div className="featured-video">

                                    <video
                                        src={mediaUrl(
                                            noticiaPrincipal.video
                                        )}
                                        muted
                                        playsInline
                                        preload="metadata"
                                    />

                                    <div className="video-overlay">

                                        <div className="play-button">

                                            <Play
                                                size={25}
                                                fill="white"
                                            />

                                        </div>

                                        <span>
                                            Vídeo da publicação
                                        </span>

                                    </div>

                                </div>

                            ) : (

                                <div className="media-placeholder">

                                    <span>
                                        Diário da Educação
                                    </span>

                                </div>

                            )}

                        </div>

                    </div>

                </section>


                {/* =================================================
                    ÚLTIMAS NOTÍCIAS
                ================================================== */}

                <section
                    className="news-section"
                    id="noticias"
                >

                    <div className="section-heading">

                        <div>

                            <span>
                                ACOMPANHE
                            </span>

                            <h2>
                                Últimas notícias
                            </h2>

                        </div>

                    </div>


                    {!carregando &&
                        !erro &&
                        outrasNoticias.length > 0 && (

                            <div className="news-list">

                                {outrasNoticias.map(
                                    (noticia) => (

                                        <article
                                            className="news-card"
                                            key={noticia.id}
                                            onClick={() =>
                                                abrirNoticia(
                                                    noticia.id
                                                )
                                            }
                                        >

                                            <div className="news-media">

                                                {noticia.imagem ? (

                                                    <img
                                                        src={mediaUrl(
                                                            noticia.imagem
                                                        )}
                                                        alt={
                                                            noticia.titulo
                                                        }
                                                    />

                                                ) : noticia.video ? (

                                                    <div className="news-video">

                                                        <video
                                                            src={mediaUrl(
                                                                noticia.video
                                                            )}
                                                            muted
                                                            playsInline
                                                            preload="metadata"
                                                        />

                                                        <div className="news-video-overlay">

                                                            <div className="small-play">

                                                                <Play
                                                                    size={17}
                                                                    fill="white"
                                                                />

                                                            </div>

                                                            <span>
                                                                Vídeo
                                                            </span>

                                                        </div>

                                                    </div>

                                                ) : (

                                                    <div className="no-media">

                                                        <span>
                                                            Educação
                                                        </span>

                                                    </div>

                                                )}

                                            </div>


                                            <div className="news-content">

                                                <span className="news-category">

                                                    {noticia.video
                                                        ? "Vídeo"
                                                        : "Educação"}

                                                </span>


                                                <h3>
                                                    {noticia.titulo}
                                                </h3>


                                                <p>
                                                    {noticia.conteudo}
                                                </p>


                                                <div className="news-footer">

                                                    <div className="news-date">

                                                        <CalendarDays
                                                            size={14}
                                                        />

                                                        {formatarData(
                                                            noticia.criado_em
                                                        )}

                                                    </div>


                                                    <ArrowRight
                                                        className="news-arrow"
                                                        size={17}
                                                    />

                                                </div>

                                            </div>

                                        </article>

                                    )
                                )}

                            </div>

                        )}


                    {!carregando &&
                        !erro &&
                        noticiasFiltradas.length === 1 && (

                            <div className="empty-news">

                                <strong>
                                    Você está vendo a notícia
                                    mais recente.
                                </strong>

                                <p>
                                    Novas publicações aparecerão
                                    aqui assim que forem divulgadas.
                                </p>

                            </div>

                        )}


                    {!carregando &&
                        !erro &&
                        noticiasFiltradas.length === 0 && (

                            <div className="empty-news">

                                <strong>
                                    Nenhuma notícia encontrada.
                                </strong>

                                <p>
                                    Tente pesquisar por outro termo.
                                </p>

                            </div>

                        )}

                </section>

            </main>


            {/* =====================================================
                FOOTER
            ====================================================== */}

                        <footer className="footer">

                <div className="footer-container">

                    <div className="footer-main">

                        <div className="footer-brand">

                         

                            <div>

                                <strong>
                                    EducaNews
                                </strong>

                                <p>
                                    Secretaria de Educação
                                    de Maetinga
                                </p>

                            </div>

                        </div>


                        <div className="footer-column">

                            <span className="footer-title">
                                Fale Conosco
                            </span>

                            <a href="tel:+557734774000">

                                <Phone size={15} />

                                <span>
                                    Secretaria de Educação
                                </span>

                            </a>

                            <a href="mailto:educacao@maetinga.ba.gov.br">

                                <Mail size={15} />

                                <span>
                                    educacao@maetinga.ba.gov.br
                                </span>

                            </a>

                        </div>


                        <div className="footer-column">

                            <span className="footer-title">
                                Endereço
                            </span>

                            <div className="footer-address">

                                <MapPin size={17} />

                                <p>
                                    Secretaria de Educação
                                    <br />
                                    Maetinga - Bahia
                                    <br />
                                    Brasil
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="footer-bottom">

                        <span>
                            © 2026 Diário da Educação
                        </span>

                        <span className="developer">

                            Desenvolvido por

                            <strong>
                                DevBruno
                            </strong>

                        </span>

                    </div>

                </div>

            </footer>

        </div>  
    );

}

export default Home;

