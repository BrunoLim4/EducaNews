import { useEffect, useState } from "react";
import {
    ArrowLeft,
    CalendarDays,
    Video
} from "lucide-react";
import {
    useNavigate,
    useParams
} from "react-router-dom";

function Noticia() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [noticia, setNoticia] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {

        async function buscarNoticia() {

            try {

                setCarregando(true);
                setErro(null);

                const url =
                    `http://localhost:3000/api/noticias/${id}`;

                console.log("Buscando notícia:", url);

                const resposta = await fetch(url);

                console.log(
                    "Status:",
                    resposta.status
                );

                const texto =
                    await resposta.text();

                console.log(
                    "Resposta:",
                    texto
                );

                if (!resposta.ok) {

                    let mensagem =
                        "Erro ao buscar notícia.";

                    try {

                        const erroApi =
                            JSON.parse(texto);

                        mensagem =
                            erroApi.mensagem ||
                            mensagem;

                    } catch {

                        if (texto) {
                            mensagem = texto;
                        }

                    }

                    throw new Error(mensagem);

                }

                const dados =
                    JSON.parse(texto);

                if (!dados.noticia) {

                    throw new Error(
                        "Notícia não encontrada."
                    );

                }

                setNoticia(
                    dados.noticia
                );

            } catch (error) {

                console.error(
                    "Erro ao carregar notícia:",
                    error
                );

                setErro(
                    error.message
                );

            } finally {

                setCarregando(false);

            }

        }

        buscarNoticia();

    }, [id]);


    // ===============================
    // CARREGANDO
    // ===============================

    if (carregando) {

        return (
            <div className="noticia-status">

                <h2>
                    Carregando notícia...
                </h2>

            </div>
        );

    }


    // ===============================
    // ERRO
    // ===============================

    if (erro || !noticia) {

        return (
            <div className="noticia-status">

                <h2>
                    Não foi possível carregar a notícia.
                </h2>

                <p>
                    {erro || "Notícia não encontrada."}
                </p>

                <button
                    onClick={() => navigate("/")}
                >
                    Voltar para o início
                </button>

            </div>
        );

    }


    // ===============================
    // URL DA IMAGEM
    // ===============================

    const imagemUrl =
        noticia.imagem
            ? `http://localhost:3000${noticia.imagem}`
            : null;


    // ===============================
    // URL DO VÍDEO
    // ===============================

    const videoUrl =
        noticia.video
            ? `http://localhost:3000${encodeURI(noticia.video)}`
            : null;


    // ===============================
    // DATA
    // ===============================

    const data =
        new Date(
            noticia.criado_em
        ).toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );


    return (

        <div
            style={{
                minHeight: "100vh",
                background: "#f7f3ed",
                color: "#171717"
            }}
        >

            {/* =========================
                HEADER
            ========================= */}

            <header
                style={{
                    background: "#fff",
                    borderBottom: "1px solid #ddd",
                    padding: "20px"
                }}
            >

                <div
                    style={{
                        maxWidth: "1100px",
                        margin: "0 auto",
                        display: "flex",
                        alignItems: "center",
                        gap: "15px"
                    }}
                >

                    <div
                        style={{
                            width: "55px",
                            height: "55px",
                            background: "#f25c05",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: "20px",
                            borderRadius: "6px"
                        }}
                    >
                        DE
                    </div>

                    <div>

                        <h2
                            style={{
                                margin: 0,
                                fontFamily:
                                    "Georgia, serif"
                            }}
                        >
                            Diário da Educação
                        </h2>

                        <span
                            style={{
                                fontSize: "12px",
                                color: "#777",
                                letterSpacing: "1.5px"
                            }}
                        >
                            SECRETARIA DE EDUCAÇÃO DE MAETINGA
                        </span>

                    </div>

                </div>

            </header>


            {/* =========================
                CONTEÚDO
            ========================= */}

            <main
                style={{
                    maxWidth: "900px",
                    margin: "0 auto",
                    padding: "40px 20px"
                }}
            >

                {/* VOLTAR */}

                <button
                    onClick={() => navigate("/")}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        border: "none",
                        background: "transparent",
                        color: "#f25c05",
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginBottom: "30px"
                    }}
                >

                    <ArrowLeft size={18} />

                    Voltar para notícias

                </button>


                {/* CATEGORIA */}

                <div
                    style={{
                        color: "#f25c05",
                        fontWeight: "bold",
                        fontSize: "13px",
                        letterSpacing: "3px",
                        marginBottom: "15px"
                    }}
                >
                    EDUCAÇÃO
                </div>


                {/* TÍTULO */}

                <h1
                    style={{
                        fontFamily:
                            "Georgia, serif",
                        fontSize:
                            "clamp(36px, 6vw, 64px)",
                        lineHeight: "1.05",
                        margin: "0 0 20px"
                    }}
                >
                    {noticia.titulo}
                </h1>


                {/* DATA */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#777",
                        marginBottom: "35px"
                    }}
                >

                    <CalendarDays size={17} />

                    {data}

                </div>


                {/* =========================
                    VÍDEO
                ========================= */}

                {noticia.video && (

                    <section
                        style={{
                            marginBottom: "40px"
                        }}
                    >

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                color: "#f25c05",
                                fontWeight: "bold",
                                marginBottom: "12px"
                            }}
                        >

                            <Video size={20} />

                            Vídeo da publicação

                        </div>


                        <video
                            controls
                            playsInline
                            preload="metadata"
                            src={videoUrl}
                            style={{
                                width: "100%",
                                display: "block",
                                background: "#000",
                                borderRadius: "12px"
                            }}
                            onLoadedMetadata={() => {

                                console.log(
                                    "Vídeo carregado:",
                                    videoUrl
                                );

                            }}
                            onError={() => {

                                console.error(
                                    "Erro ao carregar vídeo:",
                                    videoUrl
                                );

                            }}
                        >

                            Seu navegador não suporta
                            reprodução de vídeo.

                        </video>

                    </section>

                )}


                {/* =========================
                    IMAGEM
                ========================= */}

                {noticia.imagem && (

                    <div
                        style={{
                            marginBottom: "40px"
                        }}
                    >

                        <img
                            src={imagemUrl}
                            alt={noticia.titulo}
                            style={{
                                width: "100%",
                                display: "block",
                                borderRadius: "12px"
                            }}
                        />

                    </div>

                )}


                {/* =========================
                    CONTEÚDO
                ========================= */}

                <div
                    style={{
                        fontFamily:
                            "Georgia, serif",
                        fontSize: "20px",
                        lineHeight: "1.8",
                        whiteSpace: "pre-line"
                    }}
                >

                    {noticia.conteudo}

                </div>

            </main>


            {/* =========================
                FOOTER
            ========================= */}

            <footer
                style={{
                    background: "#fff",
                    borderTop: "1px solid #ddd",
                    marginTop: "50px",
                    padding: "30px 20px"
                }}
            >

                <div
                    style={{
                        maxWidth: "900px",
                        margin: "0 auto"
                    }}
                >

                    <strong>
                        Diário da Educação
                    </strong>

                    <p
                        style={{
                            color: "#777"
                        }}
                    >
                        Secretaria de Educação de Maetinga
                    </p>

                    <span
                        style={{
                            color: "#999",
                            fontSize: "13px"
                        }}
                    >
                        © 2026
                    </span>

                </div>

            </footer>

        </div>

    );

}

export default Noticia;