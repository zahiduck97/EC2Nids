const jwt_decode = require('jwt-decode');
const { getConnection } = require('../config/config');

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

Utils.ExecSQLQuery = async (sql, params) => {
    try {
        const connection = await getConnection();
        return new Promise((resolve, reject) => {
            connection.execute({
                sqlText: sql,
                binds: params,
                complete: function (err, stmt, rows) {
                    if (err) {
                        console.error('Failed to execute statement due to the following error: ' + err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            });
        });
    } catch (error) {
        console.error("Error al obtener la conexión: ", error);
        throw error;
    }
};

Utils.ExecSQL = async (sql) => {
    try {
        const Connection = await getConnection();
        console.log('saliendo de la conexion')
        return new Promise((resolve, reject) => {
            Connection.execute({
                sqlText: sql,
                complete: function (err, stmt, rows) {
                    if (err) {
                        console.error('Failed to execute statement due to the following error: ' + err.message);
                        reject(err.message)
                    } else {
                        console.log('se logro')
                        resolve(rows);
                    }
                }
            });
        });
    } catch (error) {
        console.error("Error al obtener la conexión: ", error);
    }
};

export default Utils;
