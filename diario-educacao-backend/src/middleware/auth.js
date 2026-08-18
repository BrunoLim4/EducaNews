const jwt = require("jsonwebtoken");

function autenticarToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            mensagem: "Token não fornecido."
        });
    }

    try {
        const usuario = jwt.verify(token, process.env.JWT_SECRET);

        req.usuario = usuario;

        next();
    } catch (erro) {
        return res.status(403).json({
            mensagem: "Token inválido ou expirado."
        });
    }
}

module.exports = autenticarToken;