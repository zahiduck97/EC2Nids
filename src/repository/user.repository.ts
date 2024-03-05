import Utils from "../utils/utils";

const Users = () => {};

const buyerCodeMap = new Map();
const plantCodeMap = new Map();

Users.executeQuery = async (Query) => {
    try {
        console.info("✅ executeQuery: ", Query);
        return await Utils.ExecSQLQuery(Query, []);
    } catch (err) {
        console.error("ERROR: ", err);
        throw err;
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
        } else return 0
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};

Users.insertVehicle = async (vin, engine, eim, ext, int, engineType, year, userId, por, origen, estatus, nDate) => {
    // console.info(`✅ insertVehicle`);
    try {
        const sqlInsert = `INSERT INTO VEHICLE(VIN, ENGINE_NO, BRAND_CODE, POR, PLANT_CODE, EIM, STATUS, EXT_COLOR_CODE,
            INT_COLOR_CODE, ENGINE_TYPE, MODEL_YEAR, ACTIVE, CREATED_BY, CREATION_DATE, LAST_UPDATED_BY, LAST_UPDATE_DATE)
            VALUES('${vin}', '${engine}', '1', '${por}', '${origen}', '${eim}', ${estatus}, '${ext}', '${int}', '${engineType}', ${year}, true,
            ${userId}, '${nDate}', ${userId}, '${nDate}')`;

        const queryResult = Utils.ExecSQL(sqlInsert);
        return(queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
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

Users.getBuyerCode = async (nsc) => {
    // console.info("✅ getBuyerCode: ", nsc);
    try {
        if (buyerCodeMap.has(nsc)) return buyerCodeMap.get(nsc);
        const sqlInsert = `SELECT BUYER_CODE, BUYER_ID FROM BUYER WHERE BUYER_CODE ='${nsc}' LIMIT 1`;

        const queryResult = await Utils.ExecSQL(sqlInsert);
        if (queryResult.length > 0) {
            const aux = queryResult[0];
            buyerCodeMap.set(nsc, aux);
            return(aux);
        } else return 0
    } catch (err) {
        console.error("ERROR: ", err);
        throw(err);
    }
};

Users.insertEventWithouthId = async (type, code, name, date, userId, vin) => {
    return new Promise((resolve, reject) => {
        // console.info(`✅ insertEventWithouthId: ${code}, ${date}, ${vin}`);
        try {
            const nDate = new Date();
            nDate.setHours(6, 0, 0, 0);
            const sqlInsert = `INSERT INTO EVENT (TYPE, CODE, NAME, EVENT_DATE, ACTIVE, CREATED_BY, CREATION_DATE,
            LAST_UPDATED_BY, LAST_UPDATE_DATE, VIN_TEMP) VALUES(${type}, '${code}', '${name}', '${date.toISOString()}',
            true, ${userId}, '${nDate.toISOString()}', ${userId}, '${nDate.toISOString()}', '${vin}')`

            const queryResult = Utils.ExecSQL(sqlInsert);
            resolve(queryResult);
        } catch (err) {
            console.error("ERROR: ", err);
            reject(err);
        }
    });
};

Users.getEventByNameType = async (vin, code) => {
    return new Promise((resolve, reject) => {
        // console.info("✅ getEventByNameType: ", vin, code);
        try {
            const sqlInsert = `SELECT EVENT_ID, EVENT_DATE FROM EVENT WHERE ACTIVE=TRUE AND VIN_TEMP LIKE('${vin}')
                AND TYPE = ${code} and ACTIVE = true`;

            const queryResult = Utils.ExecSQL(sqlInsert);
            resolve(queryResult);
        } catch (err) {
            console.error("ERROR: ", err);
            reject(err);
        }
    });
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
        const queryResult = Utils.ExecSQL(sqlInsert);
        return (queryResult);
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

        const queryResult = Utils.ExecSQL(sqlInsert);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
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

        const queryResult = Utils.ExecSQL(sqlInsert);
        return (queryResult);
    } catch (err) {
        console.error("ERROR: ", err);
        throw (err);
    }
};



export default Users;
