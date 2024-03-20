'use strict';
const Utils = require('../utils/utils');


const Users = () => {
};

const buyerCodeMap = new Map();
const plantCodeMap = new Map();
const countryMap = new Map();
const paymentMap = new Map();

Users.create = async (jsonBody, codePass) => {
    console.info("✅ OPTIONS: ", jsonBody);
    try {
        const sqlInsert = `INSERT INTO "USERS" (
                EMAIL,
                USERNAME,
                NAME,
                LASTNAME,
                DEPARTMENT,
                ROL_ID,
                CREATED_AT,
                UPDATED_AT,
                ACTIVE,
                COUNTRY_ID,
                PASSWORD
                ) VALUES (
                '${jsonBody.email}',
                '${jsonBody.username}',
                '${jsonBody.name}',
                '${jsonBody.lastname}',
                '',
                '${jsonBody.rolId}',
                CURRENT_DATE(),
                CURRENT_DATE(),
                TRUE,
                '${jsonBody.countryId}',
                '${codePass}'
                ); `

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }

};

Users.validateUsernameAndEmail = async (username, email) => {
    console.info("✅ validateUsernameAndEmail: ", username, email);
    try {
        const sqlInsert = `SELECT ID FROM USERS WHERE USERNAME = '${username}' OR EMAIL = '${email}'`
        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }

};

// LAMBDA
Users.findVehicleByVin = async (vin) => {
    // console.info("✅ findVehicleByVin: ", vin);
    try {
        const sqlInsert = `SELECT POR  FROM VEHICLE WHERE VIN = '${vin}'`;
        return await Utils.ExecSQL(sqlInsert);
    } catch (err) {
        console.error("ERROR: ", err);
        throw err;
    }
};

Users.countEventByNameType = async (vin, code) => {
    // console.info("✅ countEventByNameType: ", vin, code);
    try {
        const sqlInsert = `SELECT COUNT(*) AS COUNT FROM EVENT WHERE ACTIVE=TRUE AND VIN_TEMP LIKE('${vin}') AND TYPE = ${code}`;
        const queryResult = Utils.ExecSQL(sqlInsert);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.validateEventsForNationalRegister = async (vin) => {
    // console.info("✅ validateEventsForNationalRegister: ");
    try {
        const sqlInsert = `SELECT
          MAX(CASE WHEN "TYPE" = 25 THEN TRUE ELSE NULL END) AS Has_Type_25,
          MAX(CASE WHEN "TYPE" = 24 THEN TRUE ELSE NULL END) AS Has_Type_24
        FROM EVENT
        WHERE VIN_TEMP = '${vin}' AND ("TYPE" = 24 OR "TYPE" = 25)
        GROUP BY VIN_TEMP;`;
        const queryResult = Utils.ExecSQL(sqlInsert);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.findProductionByVin = async (vin, rolId, countryId) => {
    console.info("✅ findProductionByVin: ", vin, rolId, countryId);
    try {
        const sqlInsert = (rolId !== 1) ?
            `SELECT PRODUCCTION_ID 
                FROM PRODUCTION 
                INNER JOIN BUYER ON BUYER.BUYER_CODE = PRODUCTION.BUYER_CODE
                INNER JOIN NSC ON BUYER.NSC_ID = NSC.NSC_ID
                WHERE VIN LIKE('${vin}') AND NSC.COUNTRY_ID = ${countryId} LIMIT 1`
            : `SELECT PRODUCCTION_ID FROM PRODUCTION WHERE VIN LIKE('${vin}') LIMIT 1`;
        const queryResult = Utils.ExecSQL(sqlInsert);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.getPermisosById = async (id) => {
    console.info("✅ getPermisosById: ", id);
    try {
        const sqlInsert = `SELECT ROLES.WRITE_PERMITION  FROM ROLES INNER JOIN USERS ON ROLES.ID = USERS.ROL_ID WHERE USERS.ID = ${id} `
        const queryResult = Utils.ExecSQL(sqlInsert);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.getLastEventId = async () => {
    console.info("✅ getLastEventId: ");
    try {
        const sqlInsert = `SELECT EVENT_ID FROM EVENT ORDER BY EVENT_ID DESC LIMIT 1`

        const queryResult = Utils.ExecSQL(sqlInsert);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};


Users.updateVehicleStatus = async (status, vin, userId) => {
    console.info("✅ updateVehicleStatus: ", status, vin, userId);
    try {
        const date = new Date();
        date.setHours(6, 0, 0, 0);
        const sqlInsert = `update VEHICLE set STATUS= ${status}, LAST_UPDATED_BY=${userId}, LAST_UPDATE_DATE='${date.toISOString()}'  where VIN='${vin}'`

        const queryResult = Utils.ExecSQL(sqlInsert);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.insertEvent = async (id, type, code, name, date, userId, vin) => {
    console.info(`✅ insertEvent: ${id}, ${code}, ${date}, ${vin}`);
    try {
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        const sqlInsert = `INSERT INTO EVENT (EVENT_ID,TYPE, CODE, NAME, EVENT_DATE, ACTIVE, CREATED_BY, CREATION_DATE,
            LAST_UPDATED_BY, LAST_UPDATE_DATE, VIN_TEMP) VALUES(${id}, ${type}, '${code}', '${name}', '${date.toISOString()}',
            true, ${userId}, '${nDate.toISOString()}', ${userId}, '${nDate.toISOString()}', '${vin}')`

        const queryResult = Utils.ExecSQL(sqlInsert);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.getRRTypeByCountryCode = async (code) => {
    console.info(`✅ getRRTypeByCountryCode: ${code}`);
    try {
        const sqlInsert = `SELECT RR_TYPE FROM NSC WHERE COUNTRY_ID = ${code}`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.updateRRVehicleStatus = async (status, fecha, vin) => {
    console.info(`✅ updateRRVehicleStatus: ${status}, ${fecha}, ${vin}`);
    try {
        const sqlInsert = `UPDATE  VEHICLE SET RETAIL_RECOGNITION_TYPE = '${status}', RETAIL_RECOGNITION_DATE = '${fecha.toISOString()}' WHERE  VIN='${vin}'`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

// Para Entrega Cliente
Users.countEventForCustomerDelivery = async (vin) => {
    console.info("✅ countEventByNameType: ", vin);
    try {
        const sqlInsert = `SELECT CUSTOMER_DELIVERY_ID FROM CUSTOMER_DELIVERY WHERE CUSTOMER_DELIVERY.VIN LIKE('${vin}')`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.insertCustomerDelivery = async (vin, date, userId) => {
    console.info(`✅ insertCustomerDelivery: ${userId}, ${date}, ${vin}`);
    try {
        date.setHours(6, 0, 0, 0);
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        const sqlInsert = `INSERT INTO CUSTOMER_DELIVERY (VIN, DELIVERY_DATE, CREATED_BY, CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE, ACTIVE)
                        VALUES('${vin}', '${date.toISOString()}', ${userId}, '${nDate.toISOString()}', ${userId}, '${nDate.toISOString()}', true)`

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

// Facturación Distribuidor
Users.getDealerInvoiceByVin = async (vin) => {
    console.info("✅ getDealerInvoiceByVin: ", vin);
    try {
        const sqlInsert = `SELECT DEALER_INVOICE_ID FROM DEALER_INVOICE WHERE VIN LIKE('${vin}') AND ACTIVE=TRUE ORDER BY LAST_UPDATE_DATE LIMIT 1`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.getDealerById = async (id) => {
    console.info("✅ getDealerById: ", id);
    try {
        const sqlInsert = `SELECT DEALER_ID  FROM DEALER WHERE DEALER_ID = ${id}`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.getDealerById = async (id) => {
    console.info("✅ getDealerById: ", id);
    try {
        const sqlInsert = `SELECT DEALER_ID  FROM DEALER WHERE DEALER_ID = ${id}`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.getEventByNameType = async (vin, code) => {
    // console.info("✅ getEventByNameType: ", vin, code);
    try {
        const sqlInsert = `SELECT EVENT_ID, EVENT_DATE FROM EVENT WHERE ACTIVE=TRUE AND VIN_TEMP LIKE('${vin}')
                AND TYPE = ${code} and ACTIVE = true`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.insertDealerInvoice = async (code, dealerId, eventId, salesId, vin, userId) => {
    console.info(`✅ insertDealerInvoice: ${code}, ${dealerId}, ${eventId}, ${salesId}, ${vin}, ${userId}`);
    try {
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        const sqlInsert = `INSERT INTO DEALER_INVOICE (INVOICE_CODE, DEALER_ID, EVENT_ID, SALES_TYPE_ID, VIN, CREATED_BY,
            LAST_UPDATED_BY, CREATION_DATE,LAST_UPDATE_DATE, ACTIVE) VALUES('${code}', ${dealerId}, ${eventId}, ${salesId}, 
            '${vin}', ${userId}, ${userId}, '${nDate.toISOString()}', '${nDate.toISOString()}', true)`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.insertInvoice = async (code, vin, date, free, payment, currency, exchange, userId, tax) => {
    console.info(`✅ insertInvoice: ${code}, ${vin}, ${date}, ${free}, ${payment}, ${currency}, ${exchange},
        ${userId}, ${tax}`);
    try {
        date.setHours(6, 0, 0, 0);
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        const sqlInsert = `INSERT INTO INVOICE (INVOICE_CODE, VIN, INVOICE_DATE, FREE_ON_BOARD_COST, PAYMENT_TERMS_CODE,
            CURRENCY, EXCHANGE_RATE, ACTIVE,CREATED_BY, CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE, TAX_COST)
            VALUES('${code}', '${vin}', '${date.toISOString()}', ${free}, '${payment}', '${currency}', ${exchange}, true, ${userId},
            '${nDate.toISOString()}', ${userId}, '${nDate.toISOString()}', ${tax})`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

// Tracking
Users.findProductionByVinAndGetDate = async (vin, rolId, countryId) => {
    // console.info("✅ findProductionByVinAndGetDate: ", vin, rolId, countryId);
    try {
        const sqlInsert = (rolId !== 1) ?
            `SELECT PRODUCCTION_ID, PLANNED_ACTUAL_OFFLINE_DATE 
                FROM PRODUCTION 
                INNER JOIN BUYER ON BUYER.BUYER_CODE = PRODUCTION.BUYER_CODE
                INNER JOIN NSC ON BUYER.NSC_ID = NSC.NSC_ID
                WHERE VIN LIKE('${vin}') AND NSC.COUNTRY_ID = ${countryId} LIMIT 1`
            : `SELECT PRODUCCTION_ID, PLANNED_ACTUAL_OFFLINE_DATE FROM PRODUCTION WHERE VIN LIKE('${vin}') LIMIT 1`;

        console.log(sqlInsert)
        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

// NSC BILLING
Users.insertVehicle = async (vin, engine, eim, ext, int, engineType, year, userId, por, origen, estatus, nDate) => {
    // console.info(`✅ insertVehicle`);
    try {
        const sqlInsert = `INSERT INTO VEHICLE(VIN, ENGINE_NO, BRAND_CODE, POR, PLANT_CODE, EIM, STATUS, EXT_COLOR_CODE,
            INT_COLOR_CODE, ENGINE_TYPE, MODEL_YEAR, ACTIVE, CREATED_BY, CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE)
            VALUES('${vin}', '${engine}', '1', '${por}', '${origen}', '${eim}', ${estatus}, '${ext}', '${int}', '${engineType}', ${year}, true,
            ${userId}, '${nDate}', ${userId}, '${nDate}')`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.insertVehicleMasive = async (records, userId, date) => {
    try {
        console.info(`✅ insertVehicleMasive`);
        const valuesString = records.map(record =>
            `('${record.VIN}', '${record.ENGINE_NO}', '1', '${record.POR}', '${record.PLANT_CODE}', '${record.EIM}',
                ${record.STATUS}, '${record.EXT_COLOR_CODE}', '${record.INT_COLOR_CODE}', '${record.ENGINE_TYPE}', ${record.MODEL_YEAR}, true,
                ${userId}, '${date}', ${userId}, '${date}')`
        ).join(', ');
        const sqlInsert = `INSERT INTO VEHICLE(VIN, ENGINE_NO, BRAND_CODE, POR, PLANT_CODE, EIM, STATUS, EXT_COLOR_CODE,
            INT_COLOR_CODE, ENGINE_TYPE, MODEL_YEAR, ACTIVE, CREATED_BY, CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE)
            VALUES ${valuesString}`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.getBuyerCode = async (nsc) => {
    // console.info("✅ getBuyerCode: ", nsc);
    try {
        if (buyerCodeMap.has(nsc)) return buyerCodeMap.get(nsc);
        const sqlInsert = `SELECT BUYER_CODE, BUYER_ID FROM BUYER WHERE BUYER_CODE ='${nsc}' LIMIT 1`;

        const queryResult = await Utils.ExecSQL(sqlInsert);
        if (queryResult.length > 0) {
            const aux = queryResult[0];
            buyerCodeMap.set(nsc, aux);
            return (aux);
        } else return 0
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.getPorFromPlant = async (code) => {
    // console.info("✅ getPorFromPlant: ", code);
    try {
        if (plantCodeMap.has(code)) return plantCodeMap.get(code)
        const sqlInsert = `SELECT POR_CODE FROM PLANT WHERE PLANT_CODE = '${code}' LIMIT 1`;

        const queryResult = await Utils.ExecSQL(sqlInsert);
        if (queryResult.length > 0) {
            const aux = queryResult[0].POR_CODE;
            plantCodeMap.set(code, aux);
            return (aux);
        } else return null
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.countProductionByVin = async (vin) => {
    console.info("✅ countProductionByVin: ", vin);
    try {
        const sqlInsert = `SELECT VIN FROM PRODUCTION WHERE VIN ='${vin}' LIMIT 1`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.insertProduction = async (type, code, vin, star, end, date, local, orderTake, userId, por, sales, origen) => {
    console.info(`✅ insertProduction: ${type}, ${code}, ${vin}, ${star}, ${end}, ${date},
        ${local}`);
    try {
        date.setHours(6, 0, 0, 0);
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        const sqlInsert = `INSERT INTO PRODUCTION (PRODUCTION_TYPE, PRODUCTION_ORDER_REGION_CODE, BUYER_CODE, VIN,
            START_PORT, END_PORT, PLANNED_ACTUAL_OFFLINE_DATE, LOCAL_ORDER_NO, ORDERTAKE_BASE_PERIOD, SALES_NOTE_NO, ACTIVE,
            CREATED_BY, CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE, PLANT_CODE)
            VALUES('${type}', '${por}', '${code}', '${vin}', '${star}', '${end}', '${date.toISOString()}', '${local}', '${orderTake}', '${sales}',
            true, ${userId}, '${nDate.toISOString()}', ${userId}, '${nDate.toISOString()}', '${origen}')`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.insertProductionMasive = async (records, userId, nDate) => {
    // console.info(`✅ insertProductionMasive`);
    try {
        const valuesString = records.map(record =>
            `('${record.PRODUCTION_TYPE}', '${record.PRODUCTION_ORDER_REGION_CODE}', '${record.BUYER_CODE}', '${record.VIN}',
                '${record.START_PORT}', '${record.END_PORT}', '${record.PLANNED_ACTUAL_OFFLINE_DATE}', '${record.LOCAL_ORDER_NO}',
                '${record.ORDERTAKE_BASE_PERIOD}', '${record.SALES_NOTE_NO}', true, ${userId}, '${nDate}',
                 ${userId}, '${nDate}', '${record.PLANT_CODE}')`
        ).join(', ');

        const sqlInsert = `INSERT INTO PRODUCTION (PRODUCTION_TYPE, PRODUCTION_ORDER_REGION_CODE, BUYER_CODE,
                VIN, START_PORT, END_PORT, PLANNED_ACTUAL_OFFLINE_DATE, LOCAL_ORDER_NO, ORDERTAKE_BASE_PERIOD, SALES_NOTE_NO,
                ACTIVE, CREATED_BY, CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE, PLANT_CODE) VALUES ${valuesString}`;
        return Utils.ExecSQL(sqlInsert);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.countSaleByVin = async (vin) => {
    console.info("✅ countSaleByVin: ", vin);
    try {
        const sqlInsert = `SELECT VIN FROM SALE WHERE VIN ='${vin}' LIMIT 1`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.insertSale = async (vin, nsc, date, userId, sale) => {
    console.info(`✅ insertSale: ${vin}, ${date}`);
    try {
        date.setHours(6, 0, 0, 0);
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        const sqlInsert = `INSERT INTO SALE (VIN, NSC_ID, DELIVERY_DATE, NOTES, ACTIVE,
            CREATED_BY, CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE)
            VALUES('${vin}', ${nsc}, '${date.toISOString()}', '${sale}', true, ${userId}, '${nDate.toISOString()}', ${userId},
            '${nDate.toISOString()}')`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.insertSaleMasive = async (records, userId, date) => {
    try {
        const valuesString = records.map(record =>
            `('${record.VIN}', ${record.NSC_ID}, '${record.DELIVERY_DATE}', '${record.NOTES}', true, ${userId}, '${date}',
                 ${userId}, '${date}')`
        ).join(', ');

        const sqlInsert = `INSERT INTO SALE (VIN, NSC_ID, DELIVERY_DATE, NOTES, ACTIVE,
            CREATED_BY, CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE)
            VALUES ${valuesString}`;

        return Utils.ExecSQL(sqlInsert);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.insertNscInvoice = async (vin, code, icode, sales, eventId, userId) => {
    console.info(`✅ insertNscInvoice: ${code}, ${vin}, ${icode}, ${sales}, ${userId}`);
    try {
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        const sqlInsert = `INSERT INTO NSC_INVOICE  (VIN, BUYER_CODE, INVOICE_CODE, EVENT_ID, ACTIVE, SALES_TYPE_ID, CREATED_BY,
            CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE)
            VALUES('${vin}', '${code}', '${icode}', ${eventId},true, ${sales}, ${userId},'${nDate.toISOString()}', ${userId}, '${nDate.toISOString()}')`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.insertNscInvoiceMasive = async (records, userId, date) => {
    // console.info(`✅ insertNscInvoiceMasive: `);
    try {
        const valuesString = records.map(record =>
            `('${record.VIN}', '${record.BUYER_CODE}', '${record.INVOICE_CODE}', ${record.EVENT_ID}, true, 
            ${record.SALES_TYPE_ID}, ${userId},'${date}', ${userId}, '${date}')`
        ).join(', ');

        const sqlInsert = `INSERT INTO NSC_INVOICE  (VIN, BUYER_CODE, INVOICE_CODE, EVENT_ID, ACTIVE, SALES_TYPE_ID,
            CREATED_BY, CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE)
            VALUES ${valuesString}`;

        return Utils.ExecSQL(sqlInsert);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.insertInvoiceFile = async (code, vin, date, free, insurance, aditional, total, payment, prefix, userId, sales) => {
    console.info(`✅ insertInvoiceFile: ${code}, ${vin}, ${date}, ${free}, ${payment}, ${userId}`);
    try {
        date.setHours(6, 0, 0, 0);
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        const sqlInsert = `INSERT INTO INVOICE (INVOICE_CODE, VIN, INVOICE_DATE, FREE_ON_BOARD_COST, INSURANCE_COST, 
            ADITIONAL_COST, TOTAL, SALES_NOTE, PAYMENT_TERMS_CODE, CURRENCY, EXCHANGE_RATE, PREFIX, ACTIVE, CREATED_BY,
            CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE)
            VALUES('${code}', '${vin}', '${date.toISOString()}', ${free}, '${insurance}', '${aditional}', '${total}', '${sales}',
             '${payment}', 'USD', 1, '${prefix}', true, ${userId},'${nDate.toISOString()}', ${userId}, '${nDate.toISOString()}')`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.insertInvoiceFileMasive = async (records, userId, date) => {
    // console.info(`✅ insertInvoiceFileMasive: `);
    try {
        const valuesString = records.map(record =>
            `('${record.INVOICE_CODE}', '${record.VIN}', '${record.INVOICE_DATE}', ${record.FREE_ON_BOARD_COST}, 
                '${record.INSURANCE_COST}', '${record.ADITIONAL_COST}', '${record.TOTAL}', '${record.SALES_NOTE}',
             '${record.PAYMENT_TERMS_CODE}', 'USD', 1, '${record.PREFIX}', true, ${userId},'${date}', ${userId}, '${date}')`
        ).join(', ');

        const sqlInsert = `INSERT INTO INVOICE (INVOICE_CODE, VIN, INVOICE_DATE, FREE_ON_BOARD_COST, INSURANCE_COST, 
            ADITIONAL_COST, TOTAL, SALES_NOTE, PAYMENT_TERMS_CODE, CURRENCY, EXCHANGE_RATE, PREFIX, ACTIVE, CREATED_BY,
            CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE)
            VALUES ${valuesString}`;

        return Utils.ExecSQL(sqlInsert);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.insertShipment = async (vin, fee, ifee, afee, date, origin, dest, boat, weigth, userId) => {
    console.info(`✅ insertShipment: ${fee}, ${ifee}, ${afee}, ${origin}, ${dest}`);
    try {
        const sqlInsert = `INSERT INTO SHIPMENT (VIN, FEE, INSURANCE_FEE, ADD_FEE, SHIPPMENT_DATE, ORIGIN_PORT_CODE,
            DEST_PORT_CODE, BOAT_NAME, WEIGHT, ACTIVE, CREATED_BY, CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE)
            VALUES('${vin}', ${fee}, ${ifee}, ${afee}, '${date.toISOString()}', '${origin}', '${dest}', '${boat}', ${weigth},
            true, ${userId},'${nDate.toISOString()}', ${userId}, '${nDate.toISOString()}')`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.insertShipmentMasive = async (records, userId, date) => {
    try {
        const valuesString = records.map(record =>
            `('${record.VIN}', ${record.FEE}, ${record.INSURANCE_FEE}, ${record.ADD_FEE}, '${record.SHIPPMENT_DATE}', 
            '${record.ORIGIN_PORT_CODE}', '${record.DEST_PORT_CODE}', '${record.BOAT_NAME}', ${record.WEIGHT},
            true, ${userId},'${date}', ${userId}, '${date}')`
        ).join(', ');

        const sqlInsert = `INSERT INTO SHIPMENT (VIN, FEE, INSURANCE_FEE, ADD_FEE, SHIPPMENT_DATE, ORIGIN_PORT_CODE,
            DEST_PORT_CODE, BOAT_NAME, WEIGHT, ACTIVE, CREATED_BY, CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE)
            VALUES ${valuesString}`;

        return Utils.ExecSQL(sqlInsert);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};


Users.insertEventWithouthId = async (type, code, name, date, userId, vin) => {
    // console.info(`✅ insertEventWithouthId: ${code}, ${date}, ${vin}`);
    try {
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        const sqlInsert = `INSERT INTO EVENT (TYPE, CODE, NAME, EVENT_DATE, ACTIVE, CREATED_BY, CREATION_DATE,
            LAST_UPDATED_BY, LAST_UPDATE_DATE, VIN_TEMP) VALUES(${type}, '${code}', '${name}', '${date.toISOString()}',
            true, ${userId}, '${nDate.toISOString()}', ${userId}, '${nDate.toISOString()}', '${vin}')`

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.insertEventWithouthIdMasive = async (records, userId, date) => {
    // console.info(`✅ insertEventWithouthIdMasive`);
    try {
        const valuesString = records.map(record =>
            `(${record.TYPE}, '${record.CODE}', '${record.NAME}', '${record.EVENT_DATE.toISOString()}', true, ${userId},
                '${date}', ${userId}, '${date}', '${record.VIN_TEMP}')`
        ).join(', ');

        const sqlInsert = `INSERT INTO EVENT (TYPE, CODE, NAME, EVENT_DATE, ACTIVE, CREATED_BY, CREATION_DATE,
            LAST_UPDATED_BY, LAST_UPDATE_DATE, VIN_TEMP) VALUES ${valuesString}`
        return Utils.ExecSQL(sqlInsert);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

// EIM
Users.insertEIM = async (eim, code, description, userId) => {
    console.info(`✅ insertEIM: ${code}`);
    try {
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        const sqlInsert = `INSERT INTO EIM (EIM, BASIC_CODE, DESCRIPTION, ACTIVE, CREATED_BY, CREATION_DATE,
            LAST_UPDATED_BY, LAST_UPDATE_DATE) VALUES('${eim}', '${code}', '${description}',true, ${userId}, 
            '${nDate.toISOString()}', ${userId}, '${nDate.toISOString()}')`

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.getModelCode = async (name) => {
    console.info("✅ getModelCode: ", name);
    try {
        const sqlInsert = `SELECT MODEL_CODE FROM MODEL WHERE NAME ='${name}' LIMIT 1`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw err;
    }
};

Users.insertBasic = async (id, code, model, userId) => {
    console.info(`✅ insertBasic: ${code}`);
    try {
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        const sqlInsert = `INSERT INTO BASIC (BASIC_ID, BASIC_CODE, MODEL_ID, ACTIVE, CREATED_BY, CREATION_DATE,
            LAST_UPDATED_BY, LAST_UPDATE_DATE) VALUES(${id}, '${code}', ${model},true, ${userId}, 
            '${nDate.toISOString()}', ${userId}, '${nDate.toISOString()}')`

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.insertModel = async (name, userId) => {
    console.info(`✅ insertModel: ${name}`);
    try {
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        const sqlInsert = `INSERT INTO MODEL (NAME, BRAND_CODE, ACTIVE, CREATED_BY, CREATION_DATE,
            LAST_UPDATED_BY, LAST_UPDATE_DATE) VALUES('${name}', 1, true, ${userId}, 
            '${nDate.toISOString()}', ${userId}, '${nDate.toISOString()}')`

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.countEim = async (eim) => {
    console.info("✅ countEim: ", eim);
    try {
        const sqlInsert = `SELECT EIM_PK FROM EIM WHERE EIM ='${eim}' LIMIT 1`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.countBasic = async (basic) => {
    console.info("✅ countBasic: ", basic);
    try {
        const sqlInsert = `SELECT BASIC_ID FROM BASIC WHERE BASIC_CODE ='${basic}' LIMIT 1`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.getMaxIdBasic = async () => {
    console.info("✅ getMaxIdBasic: ");
    try {
        const sqlInsert = `SELECT BASIC_ID FROM BASIC ORDER BY BASIC_ID DESC LIMIT 1`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

// Asign Dealers
Users.getPortEndInDate = async (vin) => {
    console.info("✅ getPortEndInDate: ");
    try {
        const sqlInsert = `SELECT EVENT_DATE FROM EVENT WHERE VIN_TEMP = '${vin}' AND ACTIVE = TRUE AND TYPE = 15`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

// Bloqueo
Users.getProductionDateByVin = async (vin) => {
    console.info("✅ getProductionDateByVin: ", vin);
    try {
        const sqlInsert = `SELECT PLANNED_ACTUAL_OFFLINE_DATE  FROM PRODUCTION WHERE VIN ='${vin}' LIMIT 1`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.updateVehicleActive = async (active, vin, userId) => {
    console.info("✅ updateVehicleActive: ", active, vin, userId);
    try {
        const date = new Date();
        date.setHours(6, 0, 0, 0);
        const sqlInsert = `UPDATE VEHICLE set ACTIVE= ${active}, LAST_UPDATED_BY=${userId}, LAST_UPDATE_DATE='${date.toISOString()}'  where VIN='${vin}'`

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

// Factura Cliente
Users.validateAddress = async (street, suburb, cp, city, state, countryId) => {
    console.info("✅ SQL: validateAddress");
    console.log([street, suburb, cp, city, state, countryId])
    try {
        const sqlInsert = `SELECT ADDRESS_ID FROM ADDRESS WHERE STREET = ? AND SUBURB = ? AND CP = ? AND CITY = ?
            AND STATE = ? AND COUNTRY_ID = ?  LIMIT 1`
        const queryResult = Utils.ExecSQLQuery(sqlInsert, [street, suburb, `'${cp}'`, city, state, countryId]);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.getCountryId = async (country) => {
    // console.info("✅ SQL: getCountryId");
    try {
        if (countryMap.has(country)) return countryMap.get(country);
        const sqlInsert = `SELECT COUNTRY_ID FROM COUNTRY WHERE NAME  = ? LIMIT 1`

        const queryResult = await Utils.ExecSQLQuery(sqlInsert, [country]);
        if (queryResult.length > 0) {
            const aux = queryResult[0].COUNTRY_ID;
            countryMap.set(country, aux);
            return aux;
        } else return null;
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.insertAddress = async (street, int, suburb, cp, city, state, country, userId) => {
    console.info("✅ SQL: insertAddress");
    try {
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        const sqlInsert = `INSERT INTO ADDRESS (STREET, INT_NUMBER, SUBURB, CP, CITY, STATE, COUNTRY_ID, ACTIVE,
            CREATED_BY, CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        const queryResult = Utils.ExecSQLQuery(sqlInsert, [street, int, suburb, cp, city, state,
            country, true, userId, nDate.toISOString(), userId, nDate.toISOString()]);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

// Users.insertAddressMasive = async (records, userId, date) => {
//     console.info("✅ SQL: insertAddressMasive");
//     try {
//         const valuesString = records.map(record =>
//             `('${record.STREET}', '${record.INT_NUMBER}', '${record.SUBURB}', '${record.CP}', '${record.CITY}', '${record.STATE}'
//             ${record.COUNTRY_ID}, true, ${userId}, '${date}', ${userId}, '${date}')`
//         ).join(', ');
//         const sqlInsert = `INSERT INTO ADDRESS (STREET, INT_NUMBER, SUBURB, CP, CITY, STATE, COUNTRY_ID, ACTIVE,
//             CREATED_BY, CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE) VALUES ${valuesString}`
//         return Utils.ExecSQL(sqlInsert);
//     } catch (err) {
//         console.error("ERROR: ", err);
//         throw (err);
//     }
// };

Users.getLastAddressId = async () => {
    try {
        const sqlInsert = `SELECT ADDRESS_ID FROM ADDRESS ORDER BY ADDRESS_ID DESC LIMIT 1 `
        console.info("✅ SQL: getLastAddressId");
        const queryResult = Utils.ExecSQLQuery(sqlInsert, []);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.insertPerson = async (name, last, second, gender, marital, tax, date, phone, mail, be, addres, secondPhone, userId) => {
    try {
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        const sqlInsert = `INSERT INTO PERSON (NAME, LAST_NAME, SECOND_LAST_NAME, GENDER, MARITAL_STATUS, TAX_ID,
            DATE_OF_BIRTH, PHONE, MAIL, BE_CONTACTED, ADDRESS_ID, SECOND_PHONE, ACTIVE, CREATED_BY, CREATION_DATE,
            LAST_UPDATED_BY, LAST_UPDATE_DATE)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        console.info("✅ SQL: insertPerson");
        const queryResult = Utils.ExecSQLQuery(sqlInsert, [name, last, second, gender, marital,
            tax, date.toISOString(), phone, mail, be, addres, secondPhone, true, userId, nDate.toISOString(), userId, nDate.toISOString()]);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

// Users.insertPersonMasive= async (record, userId, date) => {
//     console.info("✅ SQL: insertPersonMasive");
//     try {
//         const valuesString = records.map(record =>
//             `('${record.NAME}', '${record.LAST_NAME}', '${record.SECOND_LAST_NAME}', '${record.GENDER}', '${record.MARITAL_STATUS}',
//             '${record.TAX_ID}', '${record.DATE_OF_BIRTH}', '${record.PHONE}', '${record.MAIL}', ${record.BE_CONTACTED}, ${record.ADDRESS_ID},
//             '${record.SECOND_PHONE}', true, ${userId}, '${date}', ${userId}, '${date}')`
//         ).join(', ');
//         const sqlInsert = `INSERT INTO PERSON (NAME, LAST_NAME, SECOND_LAST_NAME, GENDER, MARITAL_STATUS, TAX_ID,
//             DATE_OF_BIRTH, PHONE, MAIL, BE_CONTACTED, ADDRESS_ID, SECOND_PHONE, ACTIVE, CREATED_BY, CREATION_DATE,
//             LAST_UPDATED_BY, LAST_UPDATE_DATE) VALUES ${valuesString}`
//         return Utils.ExecSQL(sqlInsert);
//     } catch (err) {
//         console.error("ERROR: ", err);
//         throw (err);
//     }
// };

Users.validatePerson = async (name, last, gender, date, tax) => {
    try {
        const sqlInsert = `SELECT PERSON_ID FROM PERSON WHERE NAME = ? AND LAST_NAME = ? AND GENDER = ? AND 
            DATE_OF_BIRTH = ? AND TAX_ID = ?`
        console.info("✅ SQL: validatePerson");
        const queryResult = Utils.ExecSQLQuery(sqlInsert, [name, last, gender, date.toISOString(), tax]);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.getLastPersonId = async () => {
    try {
        const sqlInsert = `SELECT PERSON_ID FROM PERSON ORDER BY PERSON_ID DESC LIMIT 1`
        console.info("✅ SQL: getLastPersonId");
        const queryResult = Utils.ExecSQLQuery(sqlInsert, []);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.insertCustomer = async (person, userId) => {
    try {
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        const sqlInsert = `INSERT INTO CUSTOMER (CUSTOMER_CODE, PERSON_ID, ACTIVE, CREATED_BY, CREATION_DATE,
            LAST_UPDATED_BY, LAST_UPDATE_DATE) VALUES(?, ?, ?, ?, ?, ?, ?)`
        console.info("✅ SQL: insertCustomer");
        const queryResult = Utils.ExecSQLQuery(sqlInsert, ['', person, true, userId,
            nDate.toISOString(), userId, nDate.toISOString()]);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.insertCustomerCompany = async (person, userId) => {
    try {
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        const sqlInsert = `INSERT INTO CUSTOMER (CUSTOMER_CODE, COMPANY_ID, ACTIVE, CREATED_BY, CREATION_DATE,
            LAST_UPDATED_BY, LAST_UPDATE_DATE) VALUES(?, ?, ?, ?, ?, ?, ?)`
        console.info("✅ SQL: insertCustomerCompany");
        const queryResult = Utils.ExecSQLQuery(sqlInsert, ['', person, true, userId,
            nDate.toISOString(), userId, nDate.toISOString()]);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.getLastCustomerId = async () => {
    try {
        const sqlInsert = `SELECT CUSTOMER_ID FROM CUSTOMER ORDER BY CUSTOMER_ID DESC LIMIT 1`
        console.info("✅ SQL: getLastCustomerId");
        const queryResult = Utils.ExecSQLQuery(sqlInsert, []);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.validateCustomer = async (personId, filter) => {
    console.info("✅ SQL: validateCustomer");
    try {
        const sqlInsert = `SELECT CUSTOMER_ID  FROM CUSTOMER WHERE ${filter} = ${personId}`
        const queryResult = Utils.ExecSQLQuery(sqlInsert, []);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.getLastCustomerId = async () => {
    try {
        const sqlInsert = `SELECT CUSTOMER_ID FROM CUSTOMER ORDER BY CUSTOMER_ID DESC LIMIT 1`
        console.info("✅ SQL: getLastCustomerId");
        const queryResult = Utils.ExecSQLQuery(sqlInsert, []);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.validateInvoice = async (code, vin, date) => {
    try {
        const sqlInsert = `SELECT INVOICE_ID FROM INVOICE WHERE INVOICE_CODE = ? AND VIN = ? AND INVOICE_DATE = ? LIMIT 1`
        console.info("✅ SQL: validateInvoice");
        console.log([code, vin, date])
        const queryResult = Utils.ExecSQLQuery(sqlInsert, [code, vin, date.toISOString()]);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.getPaymentTerms = async (name, type) => {
    console.info("✅ SQL: getPaymentTerms");
    try {
        if (paymentMap.has(name)) return paymentMap.get(name);
        const sqlInsert = `SELECT PAYMENT_TERMS_CODE  FROM PAYMENT_TERMS WHERE NAME = ? AND TYPE = ? LIMIT 1`

        const queryResult = await Utils.ExecSQLQuery(sqlInsert, [name, type]);
        if (queryResult.length > 0) {
            const aux = queryResult[0].PAYMENT_TERMS_CODE;
            paymentMap.set(name, aux);
            return aux;
        } else return null
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.insertInvoiceCliente = async (vin, code, date, free, tax, aditional, exchange, payment, method, total, currency, userId) => {
    console.info("✅ SQL: insertInvoiceCliente");
    try {
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        const sqlInsert = `INSERT INTO INVOICE (VIN, INVOICE_CODE, INVOICE_DATE, FREE_ON_BOARD_COST, TAX_COST,
            ADITIONAL_COST, EXCHANGE_RATE, PAYMENT_TERMS_CODE, PAYMENT_METHOD, TOTAL, CURRENCY,  ACTIVE, CREATED_BY,
            CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        console.log([vin, code, date.toISOString(), free, tax, aditional,
            exchange, payment, method, total, currency, true, userId, nDate.toISOString(), userId, nDate.toISOString()])
        const queryResult = Utils.ExecSQLQuery(sqlInsert, [vin, code, date.toISOString(), free, tax, aditional,
            exchange, payment, method, total, currency, true, userId, nDate.toISOString(), userId, nDate.toISOString()]);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.validateCustomerInvoice = async (vin, code) => {
    try {
        const sqlInsert = `SELECT CUSTOMER_ID  FROM CUSTOMER_INVOICE WHERE VIN = ? AND INVOICE_CODE = ? LIMIT 1`
        console.info(`✅ SQL: validateCustomerInvoice: ${vin}, ${code}`)
        const queryResult = Utils.ExecSQLQuery(sqlInsert, [vin, code]);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.insertCustomerInvoice = async (vin, customer, code, dealer, sales, event, userId) => {
    try {
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        const sqlInsert = `INSERT INTO CUSTOMER_INVOICE (VIN, CUSTOMER_ID, INVOICE_CODE, DEALER_SELLER_CODE,
            SALES_TYPE_ID, EVENT_ID, ACTIVE, CREATED_BY, CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE) VALUES(?, ?, 
            ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        console.info("✅ SQL: insertCustomerInvoice");
        const queryResult = Utils.ExecSQLQuery(sqlInsert, [vin, customer, code, dealer, sales,
            event, true, userId, nDate.toISOString(), userId, nDate.toISOString()]);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.insertCustomerInvoiceCompany = async (vin, customer, code, dealer, sales, event, userId) => {
    try {
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        const sqlInsert = `INSERT INTO CUSTOMER_INVOICE (VIN, CUSTOMER_ID, INVOICE_CODE, NSC_SEALLER_CODE,
            SALES_TYPE_ID, EVENT_ID, ACTIVE, CREATED_BY, CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE) VALUES(?, ?, 
            ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        console.info("✅ SQL: insertCustomerInvoice");
        const queryResult = Utils.ExecSQLQuery(sqlInsert, [vin, customer, code, dealer, sales,
            event, true, userId, nDate.toISOString(), userId, nDate.toISOString()]);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.validateEvent = async (vin, type) => {
    try {
        const sqlInsert = `SELECT EVENT_ID  FROM EVENT WHERE VIN_TEMP = ? AND TYPE = ? AND ACTIVE = ? LIMIT 1`
        console.info("✅ SQL: validateEvent");
        const queryResult = Utils.ExecSQLQuery(sqlInsert, [vin, type, true]);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.insertEventClient = async (type, code, name, date, vin, userId) => {
    console.info(`✅ insertEventClient`);
    try {
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        const sqlInsert = `INSERT INTO EVENT (TYPE, CODE, NAME, EVENT_DATE, ACTIVE, CREATED_BY, CREATION_DATE,
                LAST_UPDATED_BY, LAST_UPDATE_DATE, VIN_TEMP) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

        const queryResult = Utils.ExecSQLQuery(sqlInsert, [type, code, name, date.toISOString(), true,
            userId, nDate.toISOString(), userId, nDate.toISOString(), vin]);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.validateCustomerDelivery = async (code, vin) => {
    try {
        const sqlInsert = `SELECT CUSTOMER_ID  FROM CUSTOMER_DELIVERY WHERE INVOICE_CODE = ? AND VIN = ? LIMIT 1`
        console.info("✅ SQL: validateCustomerDelivery");
        const queryResult = Utils.ExecSQLQuery(sqlInsert, [code, vin]);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.insertCustomerDeliveryCliente = async (code, vin, customer, vmc, date, userId) => {
    console.info(`✅ insertCustomerDelivery: ${date}`);
    try {
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        console.log([code, vin, customer, vmc, date,
            userId, nDate.toISOString(), userId, nDate.toISOString()])
        const sqlInsert = `INSERT INTO CUSTOMER_DELIVERY(INVOICE_CODE, VIN, CUSTOMER_ID, VMC, DELIVERY_DATE, ACTIVE,
                CREATED_BY, CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

        const queryResult = Utils.ExecSQLQuery(sqlInsert, [code, vin, customer, vmc, date.toISOString(), true,
            userId, nDate.toISOString(), userId, nDate.toISOString()]);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.validateCompany = async (name, tax) => {
    console.info(`✅ validateCompany`);
    try {
        const sqlInsert = `SELECT COMPANY_ID  FROM COMPANY WHERE ACTIVE = ? AND BUSINESS_NAME = ? AND TAX_ID = ?`

        const queryResult = Utils.ExecSQLQuery(sqlInsert, [true, name, tax]);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.insertCompany = async (name, tax, address, userId) => {
    console.info(`✅ insertCompany`);
    try {
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        console.log([name, tax, address, userId, nDate.toISOString(), userId, nDate.toISOString()])
        const sqlInsert = `INSERT INTO COMPANY (BUSINESS_NAME, TAX_ID, ADDRESS_ID, ACTIVE, CREATED_BY, CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`

        const queryResult = Utils.ExecSQLQuery(sqlInsert, [name, tax, address, true, userId, nDate.toISOString(), userId, nDate.toISOString()]);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.getLastCompanyId = async () => {
    try {
        const sqlInsert = `SELECT COMPANY_ID FROM COMPANY ORDER BY COMPANY_ID DESC LIMIT 1`
        console.info("✅ SQL: getLastCompanyId");
        const queryResult = Utils.ExecSQLQuery(sqlInsert, []);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.validateVehicle = async (vin) => {
    try {
        const sqlInsert = `SELECT 1  FROM VEHICLE WHERE VIN = '${vin}'`;
        // console.info("✅ validateVehicle: ", sqlInsert);
        return await Utils.ExecSQL(sqlInsert);
    } catch (err) {
        console.error("ERROR: ", err);
        throw err;
    }
};

Users.getIdsForVehicle = async (vin, code) => {
    try {
        const sqlInsert = `SELECT 
                PRODUCCTION_ID, SALE.SALE_ID, INVOICE_ID, NSC_INVOICE_ID, SHIPMENT.SHIPMENT_ID 
            FROM VEHICLE
            LEFT JOIN PRODUCTION ON PRODUCTION.VIN = VEHICLE.VIN  AND PRODUCTION.ACTIVE = TRUE
            LEFT JOIN SALE ON SALE.VIN = VEHICLE.VIN AND SALE.ACTIVE = TRUE
            LEFT JOIN INVOICE ON INVOICE.VIN = VEHICLE.VIN AND INVOICE_CODE = ? AND INVOICE.ACTIVE  = TRUE
            LEFT JOIN NSC_INVOICE ON NSC_INVOICE.VIN = VEHICLE.VIN AND NSC_INVOICE.INVOICE_CODE = ? AND NSC_INVOICE.ACTIVE = TRUE
            LEFT JOIN SHIPMENT ON SHIPMENT.VIN = VEHICLE.VIN  AND SHIPMENT.ACTIVE = TRUE
            WHERE VEHICLE.VIN = ?`;
        // console.info("✅ getIdsForVehicle: ", sqlInsert);
        return await Utils.ExecSQLQuery(sqlInsert, [code, code, vin]);
    } catch (err) {
        console.error("ERROR: ", err);
        throw err;
    }
};

Users.executeQuery = async (Query) => {
    try {
        console.info("✅ executeQuery: ", Query);
        return await Utils.ExecSQLQuery(Query, []);
    } catch (err) {
        console.error("ERROR: ", err);
        throw err;
    }
};

Users.insertEventMasive = async (records, userId, date) => {
    try {
        console.info(`✅ insertEventMasive`);
        const valuesString = records.map(record =>
            `(${record.TYPE}, '${record.CODE}', '${record.NAME}', '${record.EVENT_DATE}', true, ${userId}, '${date}',
                ${userId}, '${date}', '${record.VIN_TEMP}')`
        ).join(', ');
        const sqlInsert = `INSERT INTO EVENT (TYPE, CODE, NAME, EVENT_DATE, ACTIVE, CREATED_BY, CREATION_DATE, LAST_UPDATED_BY,
            LAST_UPDATE_DATE, VIN_TEMP) VALUES ${valuesString}`;

        return Utils.ExecSQL(sqlInsert);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.insertEventMasiveNationalRegister = async (records, userId, date) => {
    try {
        console.info(`✅ insertEventMasiveNationalRegister`);
        const valuesString = records.map(record =>
            `(25, '${record.CODE}', 'NATIONAL_REGISTER', '${record.EVENT_DATE}', true, ${userId}, '${date}',
                ${userId}, '${date}', '${record.VIN_TEMP}')`
        ).join(', ');
        const sqlInsert = `INSERT INTO EVENT (TYPE, CODE, NAME, EVENT_DATE, ACTIVE, CREATED_BY, CREATION_DATE, LAST_UPDATED_BY,
            LAST_UPDATE_DATE, VIN_TEMP) VALUES ${valuesString}`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.updateVehicleStatusMasive = async (records, userId, date) => {
    try {
        console.info(`✅ updateVehicleStatusMasive`);
        await Utils.ExecSQL(`CREATE TEMPORARY TABLE status_vehicle_temp (VIN VARCHAR, STATUS VARCHAR);`)

        const valuesString = records.map(record => `('${record.VIN}', '${record.STATUS}')`).join(', ');
        const sqlInsert = `INSERT INTO status_vehicle_temp (VIN, STATUS) VALUES ${valuesString}`;
        console.log(sqlInsert)
        await Utils.ExecSQL(sqlInsert);

        const queryResult = await Utils.ExecSQL(`UPDATE VEHICLE SET VEHICLE.STATUS = status_vehicle_temp.STATUS,
            VEHICLE.LAST_UPDATED_BY = ${userId}, LAST_UPDATE_DATE='${date}'
            FROM status_vehicle_temp WHERE VEHICLE.VIN = status_vehicle_temp.VIN;`)
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.insertLogFile = async (menu, records, loaded, status, userId, date) => {
    try {
        const sqlInsert = `INSERT INTO UTL_DATAFILE_LOG (ID_MENU, RECORDS, RECORDS_LOADED, STATUS, ERROR, CREATED_BY, CREATION_DATE) VALUES(?,?,?,?,?,?,?);`;
        // console.info("✅ getIdsForVehicle: ", sqlInsert);
        return await Utils.ExecSQLQuery(sqlInsert, [menu, records, loaded, status, null, userId, date]);
    } catch (err) {
        console.error("ERROR: ", err);
        throw err;
    }
};

Users.updateLogFile = async (loaded, menu, userId) => {
    try {
        const sqlInsert = `UPDATE UTL_DATAFILE_LOG
            SET RECORDS_LOADED = ?
            WHERE ID_MENU = ? AND CREATED_BY = ?`;
        console.info("✅ updateLogFile: ");
        return await Utils.ExecSQLQuery(sqlInsert, [loaded, menu, userId]);
    } catch (err) {
        console.error("ERROR: ", err);
        throw err;
    }
};

Users.updateLogFileID = async (loaded, id) => {
    try {
        const sqlInsert = `UPDATE UTL_DATAFILE_LOG
            SET RECORDS_LOADED = ?
            WHERE ID = ?`;
        console.info("✅ updateLogFileID: ");
        return await Utils.ExecSQLQuery(sqlInsert, [loaded, id]);
    } catch (err) {
        console.error("ERROR: ", err);
        throw err;
    }
};

Users.completeLogFile = async (loaded, status, error, menu, userId) => {
    try {
        console.info("✅ completeLogFile: ");
        const sqlInsert = `UPDATE UTL_DATAFILE_LOG
            SET RECORDS_LOADED = ?, STATUS = ?, ERROR = ?
            WHERE ID_MENU = ? AND CREATED_BY = ?`;
        return Utils.ExecSQLQuery(sqlInsert, [loaded, status, JSON.stringify(error), menu, userId]);
    } catch (err) {
        console.error("ERROR: ", err);
        throw err;
    }
};

Users.getLogFile = async (menu, userId) => {
    try {
        console.info("✅ getLogFile: ");
        const sqlInsert = `SELECT RECORDS, RECORDS_LOADED, STATUS, ERROR  FROM UTL_DATAFILE_LOG
            WHERE ID_MENU = ? AND CREATED_BY = ? ORDER BY ID DESC LIMIT 1`;
        return Utils.ExecSQLQuery(sqlInsert, [menu, userId]);
    } catch (err) {
        console.error("ERROR: ", err);
        throw err;
    }
};

Users.getLogFileId = async (menu, userId) => {
    try {
        console.info("✅ getLogFileId: ");
        const sqlInsert = `SELECT ID FROM UTL_DATAFILE_LOG
            WHERE ID_MENU = ? AND CREATED_BY = ? ORDER BY ID DESC LIMIT 1`;
        return Utils.ExecSQLQuery(sqlInsert, [menu, userId]);
    } catch (err) {
        console.error("ERROR: ", err);
        throw err;
    }
};

module.exports = Users;
