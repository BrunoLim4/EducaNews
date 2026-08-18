import { useState } from "react";
import { Lock, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

function AdminLogin() {

    const navigate = useNavigate();

    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function entrar(e) {

        e.preventDefault();

        setErro("");

        if (!usuario || !senha) {
            setErro("Informe o usuário e a senha.");
            return;
        }

        try {

            setCarregando(true);

            const resposta = await api.post("/auth/login", {
                usuario,
                senha
            });

            localStorage.setItem(
                "token",
                resposta.data.token
            );

            localStorage.setItem(
                "usuario",
                JSON.stringify(resposta.data.usuario)
            );

            navigate("/secretaria/painel");

        } catch (erro) {

            console.error(erro);

            setErro(
                erro.response?.data?.mensagem ||
                "Usuário ou senha incorretos."
            );

        } finally {

            setCarregando(false);

        }

    }

    return (

        <div className="admin-login">

            <div className="admin-login-card">

                <div className="admin-brand">

                    <div className="admin-logo">
                        DE
                    </div>

                    <div>

                        <strong>
                            Diário da Educação
                        </strong>

                        <span>
                            Área administrativa
                        </span>

                    </div>

                </div>


                <div className="admin-title">

                    <h1>
                        Acesso restrito
                    </h1>

                    <p>
                        Entre para administrar as notícias.
                    </p>

                </div>


                <form onSubmit={entrar}>

                    <label>
                        Usuário
                    </label>

                    <div className="admin-input">

                        <User size={18} />

                        <input
                            type="text"
                            placeholder="Digite seu usuário"
                            value={usuario}
                            onChange={(e) =>
                                setUsuario(e.target.value)
                            }
                        />

                    </div>


                    <label>
                        Senha
                    </label>

                    <div className="admin-input">

                        <Lock size={18} />

                        <input
                            type="password"
                            placeholder="Digite sua senha"
                            value={senha}
                            onChange={(e) =>
                                setSenha(e.target.value)
                            }
                        />

                    </div>


                    {erro && (

                        <div className="admin-error">

                            {erro}

                        </div>

                    )}


                    <button
                        type="submit"
                        className="admin-button"
                        disabled={carregando}
                    >

                        {carregando
                            ? "Entrando..."
                            : "Entrar"
                        }

                        {!carregando && (
                            <ArrowRight size={18} />
                        )}

                    </button>

                </form>


                <button
                    className="back-site"
                    onClick={() => navigate("/")}
                >
                    Voltar para o jornal
                </button>

            </div>

        </div>

    );

}

export default AdminLogin;