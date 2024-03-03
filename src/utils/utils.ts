const jwt_decode = require('jwt-decode');

const Utils = () => {};

Utils.decodeToken = (headers) => {
    try {
        let Token = headers['authorization'];
        if (!(Token && Token.startsWith('Bearer '))) throw new Error("Invalid Token");
        Token = Token.replace('Bearer ', '')
        return jwt_decode(Token);
    } catch (e) {
        console.error("❌ Error: ", e);
        throw e;
    }
}

Utils.errorResponse = (code, errorMessage, res) => {
    console.error("❌ errorResponse: ", errorMessage);
    // Configura los headers para CORS y el tipo de contenido
    res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS,POST",
        "Access-Control-Allow-Headers": "Origin, Content-Type, X-Auth-Token",
        "Content-Type": "application/json",
    });

    // Envía la respuesta con el código de estado y el cuerpo en formato JSON
    res.status(code).json({
        status: "fail",
        message: errorMessage,
        Reference: "nibu.Authentication.srv",
    });
}

export default Utils;
