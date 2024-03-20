'use strict';
const jwt_decode = require('jwt-decode');
const {getConnection} = require('../config/config');
const CryptoJS = require("crypto-js");
const XLSX = require('xlsx');
const papa = require('papaparse');

const Utils = () => {
};
Utils.errorResponse = (code, errorMessage) => {
    console.error("❌ errorResponse: ", errorMessage);
    return {
        statusCode: code,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS,POST",
            "Access-Control-Allow-Headers": "Origin, Content-Type, X-Auth-Token",
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            status: "fail",
            message: errorMessage,
            Reference: "nibu.Authentication.srv",
        })
    }
}

Utils.buildResponse = (message,) => {
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS,POST",
            "Access-Control-Allow-Headers": "Origin, Content-Type, X-Auth-Token",
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            status: "success",
            message,
        })
    }
}

Utils.buildResponseStatusLogFile = (data) => {
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS,POST",
            "Access-Control-Allow-Headers": "Origin, Content-Type, X-Auth-Token",
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }
}

Utils.buildResponseForGet = (code, result) => {
    return {
        statusCode: code,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS,POST",
            "Access-Control-Allow-Headers": "Origin, Content-Type, X-Auth-Token",
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(result)
    }
}

Utils.buildResponseForLambda = (message, errors) => {
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS,POST",
            "Access-Control-Allow-Headers": "Origin, Content-Type, X-Auth-Token",
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            status: "success",
            message,
            errors
        })
    }
}

Utils.ExecSQL = async (sql) => {
    try {
        const Connection = await getConnection();
        return new Promise((resolve, reject) => {
            Connection.execute({
                sqlText: sql,
                complete: function (err, stmt, rows) {
                    if (err) {
                        console.error('Failed to execute statement due to the following error: ' + err.message);
                        reject(err.message)
                    } else {
                        resolve(rows);
                    }
                }
            });
        });
    } catch (error) {
        console.error("Error al obtener la conexión: ", error);
    }
};

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

Utils.decodeToken = (headers) => {
    try {
        let Token = headers['authorization'];
        if (!(Token && Token.startsWith('Bearer '))) throw new Error("Invalid Token");
        Token = Token.replace('Bearer ', '')
        const decodedToken = jwt_decode(Token);
        return decodedToken;
    } catch (e) {
        console.error("❌ Error: ", e);
        throw e;
    }
}

Utils.codePassword = (password) => {
    try {
        const secret = process.env.SECRET_KEY;
        return CryptoJS.AES.encrypt(password, secret).toString();
    } catch (e) {
        return {
            status: 'fail',
            data: e.message
        }
    }
}

Utils.convertToSpecificTime = (str) => {
    try {
        // Convertir la cadena a fecha
        if (str.length !== 8 || isNaN(str) || str === '') {
            return null;
        }

        const year = str.substring(0, 4);
        const month = str.substring(4, 6);
        const day = str.substring(6, 8);

        // Crear un objeto Date con la fecha
        const date = new Date(year, month - 1, day);

        // Ajustar la hora a las 6:00:00
        date.setHours(6, 0, 0, 0);


        return date;
    } catch (e) {
        console.error("❌ Error: ", e);
    }
}

Utils.convertToSpecificTimeStartsByDay = (str) => {
    try {
        // Convertir la cadena a fecha
        if (str.length !== 8 || isNaN(str) || str === '') {
            return null
        }

        const day = str.substring(0, 2);
        const month = str.substring(2, 4);
        const year = str.substring(4, 8);

        // Crear un objeto Date con la fecha
        const date = new Date(year, month - 1, day);

        // Ajustar la hora a las 6:00:00
        date.setHours(6, 0, 0, 0);


        return date;
    } catch (e) {
        console.error("❌ Error: ", e);
    }
}


Utils.getFactClienteCSV = (result, inter) => {
    try {
        const aux = {
            VIN: result[1].trim(),
            VDEALER: result[2].toString().trim(),
            VNUMERO_FACTURA: result[3].trim(),
            DFECHA_FACTURA: result[4].toString().trim(),
            NIMPORTE_FACTURA: result[5],
            NIMPUESTO_FACTURA: result[(inter === 127 || inter === 128) ? 6 : 7],
            NACCESORIOS_FACTURA: result[9],
            NTIPO_CAMBIO: result[11],
            VPOLITICA_VENTA: result[13].trim(),
            VVMC: result[14].trim(),
            VPLAZO_VENTA: result[15].trim(),
            VNOMBRE_CLIENTE: result[16].trim(),
        }
        if (inter === 127 || inter === 140) {
            aux.VAPELLIDO_PATERNO = result[17].trim();
            aux.VAPELLIDO_MATERNO = result[18].trim();
            aux.VSEXO = result[19].trim();
            aux.VESTADO_CIVIL = result[20].trim();
            aux.DFECHA_NACIMIENTO = result[21].toString().trim();
            aux.VRFC = result[22].toString().trim();
            aux.VCALLE = result[23].trim();
            aux.VNUMERO = result[24].trim();
            aux.VCOLONIA = result[25].trim();
            aux.VCPOSTAL = result[26];
            aux.VDELEGACION_MUNICIPIO = result[27] === 'NA' ? '' : result[27].trim();
            aux.VCIUDAD = result[28].trim();
            aux.VPAIS = result[29].trim();
            aux.VTELEFONO_CASA = typeof result[30] === 'string' ? 0 : result[30];
            aux.VCELULAR = typeof result[31] === 'string' ? 0 : result[31];
            aux.VEMAIL = result[32].trim();
            aux.DFECHA_ENTREGA_CLIENTE = result[33].toString().trim();
            aux.VDESEA_SER_CONTACTADO = result[34].trim();
        } else {
            aux.VRFC = result[17].toString().trim();
            aux.VCALLE = result[18].trim();
            aux.VNUMERO = result[19].trim();
            aux.VCOLONIA = result[20].trim();
            aux.VCPOSTAL = result[21];
            aux.VDELEGACION_MUNICIPIO = result[22] === 'NA' ? '' : result[22].trim();
            aux.VCIUDAD = result[23].trim();
            aux.VPAIS = result[24].trim();
            aux.VTELEFONO_CASA = typeof result[25] === 'string' ? 0 : result[25];
            aux.VCELULAR = typeof result[26] === 'string' ? 0 : result[26];
            aux.VEMAIL = result[27].trim();
            aux.DFECHA_ENTREGA_CLIENTE = result[28].toString().trim();
        }
        return aux;
    } catch (e) {
        console.error("❌ Error: ", e);
    }
}

Utils.getFactClienteTXT = (result, inter) => {
    try {
        const aux = {
            VIN: result.substring(3, 20).trim(),
            VDEALER: result.substring(20, 24).trim(),
            VNUMERO_FACTURA: result.substring(24, 44).trim(),
            DFECHA_FACTURA: result.substring(44, 52).trim(),
            NIMPORTE_FACTURA: +result.substring(52, 75),
            NIMPUESTO_FACTURA: +result.substring((inter === 27 || inter === 28) ? 75 : 88, (inter === 27 || inter === 28) ? 90 : 101),
        }
        if(inter === 27 || inter === 28) {
            aux.NACCESORIOS_FACTURA = +result.substring(118, 131);
            aux.NTIPO_CAMBIO = +result.substring(144, 155);
            aux.VPOLITICA_VENTA = result.substring(163, 167).trim();
            aux.VVMC = result.substring(167, 168).trim();
            aux.VPLAZO_VENTA = result.substring(168, 170).trim();
        } else {
            aux.NACCESORIOS_FACTURA = +result.substring(110, 123);
            aux.NTIPO_CAMBIO = +result.substring(132, 140);
            aux.VPOLITICA_VENTA = result.substring(148, 152).trim();
            aux.VVMC = result.substring(152, 153).trim();
            aux.VPLAZO_VENTA = result.substring(153, 155).trim();
        }

        switch (inter) {
            case 27:
                aux.VNOMBRE_CLIENTE = result.substring(170, 200).trim();
                aux.VAPELLIDO_PATERNO = result.substring(200, 240).trim();
                aux.VAPELLIDO_MATERNO = result.substring(240, 280).trim();
                aux.VSEXO = result.substring(280, 281).trim();
                aux.VESTADO_CIVIL = result.substring(281, 282).trim();
                aux.DFECHA_NACIMIENTO = result.substring(282, 290).trim();
                aux.VRFC = result.substring(290, 310).trim();
                aux.VCALLE = result.substring(310, 350).trim();
                aux.VNUMERO = result.substring(350, 360).trim();
                aux.VCOLONIA = result.substring(360, 400).trim();
                aux.VCPOSTAL = +result.substring(400, 405);
                aux.VDELEGACION_MUNICIPIO = result.substring(405, 445) === 'NA' ? '' : result.substring(405, 445).trim();
                aux.VCIUDAD = result.substring(445, 485).trim();
                aux.VPAIS = result.substring(485, 505).trim();
                aux.VTELEFONO_CASA = typeof result.substring(505, 515).trim() === 'string' ? 0 : +result.substring(505, 515).trim();
                aux.VCELULAR = typeof result.substring(515, 525).trim() === 'string' ? 0 : +result.substring(515, 525).trim();
                aux.VEMAIL = result.substring(525, 555).trim();
                aux.DFECHA_ENTREGA_CLIENTE = result.substring(555, 563).trim();
                aux.VDESEA_SER_CONTACTADO = result.substring(563, 564).trim();
                break;
            case 28:
                aux.VNOMBRE_CLIENTE = result.substring(170, 210).trim();
                aux.VRFC = result.substring(210, 230).trim()
                aux.VCALLE = result.substring(230, 270).trim();
                aux.VNUMERO = result.substring(270, 280).trim();
                aux.VCOLONIA = result.substring(280, 320).trim();
                aux.VCPOSTAL = +result.substring(320, 325);
                aux.VDELEGACION_MUNICIPIO = result.substring(325, 365) === 'NA' ? '' : result.substring(325, 365).trim();
                aux.VCIUDAD = result.substring(365, 405).trim();
                aux.VPAIS = result.substring(405, 425).trim();
                aux.VTELEFONO_CASA = result.substring(425, 435).trim() === 'NA' ? 0 : +result.substring(425, 435).trim();
                aux.VCELULAR = result.substring(435, 445).trim() === 'NA' ? 0 : +result.substring(435, 445).trim();
                aux.VEMAIL = result.substring(445, 475).trim();
                aux.DFECHA_ENTREGA_CLIENTE = result.substring(475, 483).trim()
                break;
            case 40:
                aux.VNOMBRE_CLIENTE = result.substring(155, 185).trim();
                aux.VAPELLIDO_PATERNO = result.substring(185, 225).trim();
                aux.VAPELLIDO_MATERNO = result.substring(225, 265).trim();
                aux.VSEXO = result.substring(265, 266).trim();
                aux.VESTADO_CIVIL = result.substring(266, 267).trim();
                aux.DFECHA_NACIMIENTO = result.substring(267, 275).trim();
                aux.VRFC = result.substring(275, 295).trim()
                aux.VCALLE = result.substring(295, 335).trim();
                aux.VNUMERO = result.substring(335, 345).trim();
                aux.VCOLONIA = result.substring(345, 385).trim();
                aux.VCPOSTAL = +result.substring(385, 390);
                aux.VDELEGACION_MUNICIPIO = result.substring(390, 430) === 'NA' ? '' : result.substring(390, 430).trim();
                aux.VCIUDAD = result.substring(430, 470).trim();
                aux.VPAIS = result.substring(470, 490).trim();
                aux.VTELEFONO_CASA = result.substring(490, 505).trim() === 'NA' ? 0 : +result.substring(490, 505).trim();
                aux.VCELULAR = result.substring(505, 520).trim() === 'NA' ? 0 : +result.substring(505, 520).trim();
                aux.VEMAIL = result.substring(520, 550).trim();
                aux.DFECHA_ENTREGA_CLIENTE = result.substring(550, 558).trim();
                aux.VDESEA_SER_CONTACTADO = result.substring(558, 559).trim();
                break;
            case 41:
                aux.VNOMBRE_CLIENTE = result.substring(155, 195).trim();
                aux.VRFC = result.substring(195, 215).trim()
                aux.VCALLE = result.substring(215, 255).trim();
                aux.VNUMERO = result.substring(255, 165).trim();
                aux.VCOLONIA = result.substring(265, 305).trim();
                aux.VCPOSTAL = +result.substring(305, 310);
                aux.VDELEGACION_MUNICIPIO = result.substring(310, 350) === 'NA' ? '' : result.substring(310, 350).trim();
                aux.VCIUDAD = result.substring(350, 390).trim();
                aux.VPAIS = result.substring(390, 410).trim();
                aux.VTELEFONO_CASA = result.substring(410, 425).trim() === 'NA' ? 0 : +result.substring(410, 425).trim();
                aux.VCELULAR = result.substring(425, 440).trim() === 'NA' ? 0 : +result.substring(425, 440).trim();
                aux.VEMAIL = result.substring(440, 470).trim();
                aux.DFECHA_ENTREGA_CLIENTE = result.substring(470, 478).trim();
                break;
        }
        return aux;
    } catch (e) {
        console.error("❌ Error: ", e);
    }
}

Utils.decodeXLS = (requestData) => {
    console.log('decodeXLS')
    // Validar Body
    const base64Data = requestData.base64Data;
    if (!base64Data) return Utils.errorResponse(500, "Invalid Body");

    // Separar y obtener el base64
    const base64ContentArray = base64Data.split(';base64,');
    const base64Content = base64ContentArray.length > 1 ? base64ContentArray[1] : base64ContentArray[0];

    // Decodificar base64 a un buffer
    const buffer = Buffer.from(base64Content, 'base64');

    // Leer el archivo Excel desde el buffer
    const workbook = XLSX.read(buffer, {type: 'buffer'});

    // Suponiendo que solo hay una hoja y quieres los datos de esa hoja
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convertir la hoja de Excel a JSON
    return XLSX.utils.sheet_to_json(worksheet);
}

Utils.decodeTxt = (requestData) => {
    console.log('decodeTxt')
    // Validar Body
    const base64Data = requestData.base64Data;
    if (!base64Data) return Utils.errorResponse(500, "Invalid Body");

    // Separar y obtener el base64
    const base64ContentArray = base64Data.split(';base64,');
    const base64Content = base64ContentArray.length > 1 ? base64ContentArray[1] : base64ContentArray[0];

    // Decodificar base64 a texto
    const buffer = Buffer.from(base64Content, 'base64').toString('utf-8');

    // Dividir el texto en líneas
    return buffer.split('\n');
}

Utils.decodeCsv = (requestData, header = true) => {
    console.log('decodeCsv')
    // Validar Body
    const base64Data = requestData.base64Data;
    if (!base64Data) return Utils.errorResponse(500, "Invalid Body");

    // Separar y obtener el base64
    const base64ContentArray = base64Data.split(';base64,');
    const base64Content = base64ContentArray.length > 1 ? base64ContentArray[1] : base64ContentArray[0];

    // Decodificar base64 a texto
    const buffer = Buffer.from(base64Content, 'base64').toString('utf-8');

    // Parsear CSV
    return papa.parse(buffer, {
        header,
        dynamicTyping: true,
        skipEmptyLines: true
    }).data;
}

module.exports = Utils;
