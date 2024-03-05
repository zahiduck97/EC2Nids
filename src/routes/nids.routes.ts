import { Request, Response, Router } from 'express';
import Utils from "../utils/utils";
import userRepository from "../repository/user.repository";
const XLSX = require('xlsx');

const router = Router();

router.post('/', async (req: Request, res: Response, next) => {
    try {
        // Validate Token
        const headers = req.headers;
        const queryParams = req.query;
        let result;
        const errores = [];
        const requestData = req.body;

        const token = await Utils.decodeToken(headers);

        // Validar Body
        const base64Data = requestData.base64Data;
        if (!base64Data) return Utils.errorResponse(500, "Invalid Body", res);

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
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        JSON.stringify(jsonData, null, 2);

        // For Vehicle
        const status = {
            "FACTURA NLAC": 4,
            "PUERTO": 8,
            "RECINTO FISCAL": 10,
            "VPC": 12,
            "DEALER": 14

        }

        // For NSC Invoice
        const salesType = {
            'T': 1,
            'F': 2,
            'E': 3
        };

        // Variables
        let productions = [];
        let salesArr = [];
        let invoices = [];
        let nscInvoices = [];
        let shipments = [];
        let events = [];
        const nDate = new Date();
        nDate.setHours(6, 0, 0, 0);
        console.log(nDate.toISOString())
        let plant;

        await userRepository.executeQuery(`BEGIN;`)

        for (const row of jsonData) {
            // Validate Vin Length
            if (row.VIN.length !== 17) {
                errores.push({vin: row.VIN, error: "The VIN must be 17 characters"});
                continue;
            }

            // Variables
            const origen = row['ORIGEN DE PRODUCCION'] || '';
            let por;
            const sales = row['SALES NOTE'] || '';

            // Validate Vin In Vehicle or Insert
            const vehicle: any = await userRepository.validateVehicle(row.VIN);
            if (vehicle.length === 0) {
                por = await userRepository.getPorFromPlant(row['ORIGEN DE PRODUCCION'])
                if(por === 0) {
                    errores.push({vin: row.VIN, error: "Invalid Plant Code"});
                    continue;
                }
                // por = plant[0].POR_CODE;
                const estatus = status[row.ESTATUS] || 0;
                await userRepository.insertVehicle(row.VIN, row.MOTOR, row['END ITEM'], row['CVE COL EXT'], row['CVE COL INT'],
                    row.MOTOR.substring(0, 4), row.CUOTA, token.user.userId, por, origen, estatus, nDate.toISOString());
            }

            // Get Id's
            const dateInvoice = await Utils.convertToSpecificTime(row['FECHA FACTURA NISSAN'].toString());
            const lastVehicle = await userRepository.getIdsForVehicle(row.VIN, row['FACTURA NISSAN']);

            // el por solo lo usa production y se ejecuta en caso de que ya exista el vehiculo, porque no lo tenemos
            if (!lastVehicle[0].PRODUCCTION_ID && !por) {
                por = await userRepository.getPorFromPlant(row['ORIGEN DE PRODUCCION'])
                // por = plant[0].POR_CODE || 0;
            }

            // Validar si production, nsc invoice o sale necesitan el buyer
            let buyer;
            if (!lastVehicle[0].PRODUCCTION_ID || !lastVehicle[0].SALE_ID || !lastVehicle[0].NSC_INVOICE_ID) {
                buyer = await userRepository.getBuyerCode(row['CVE NSC']);
                if (buyer.length === 0) {
                    errores.push({vin: row.VIN, error: "The NSC Does Not Exist"});
                    continue;
                }
            }

            // Insert Production
            if (!lastVehicle[0].PRODUCCTION_ID) {
                if (row['FECHA OFFLINE REAL']) {
                    const date = Utils.convertToSpecificTime(row['FECHA OFFLINE REAL'].toString());
                    productions.push({
                        PRODUCTION_TYPE: 'ACTUAL',
                        PRODUCTION_ORDER_REGION_CODE: por,
                        BUYER_CODE: buyer[0].BUYER_CODE,
                        VIN: row.VIN,
                        START_PORT: row['CVE PUERTO ORIGEN'],
                        END_PORT: row['CLAVE PUERTO DESTINO'],
                        PLANNED_ACTUAL_OFFLINE_DATE: date.toISOString(),
                        LOCAL_ORDER_NO: row['ORDEN PRODUCCION'],
                        ORDERTAKE_BASE_PERIOD: row['ANO MES PEDIDO'],
                        SALES_NOTE_NO: sales,
                        PLANT_CODE: origen,

                    });

                    events.push({
                        TYPE: 4,
                        CODE: origen,
                        NAME: 'PRODUCCION_OFFLINE',
                        EVENT_DATE: date,
                        VIN_TEMP: row.VIN
                    })
                }
                if (row['FECHA OFFLINE PLAN']) {
                    const date = Utils.convertToSpecificTime(row['FECHA OFFLINE PLAN'].toString());
                    productions.push({
                        PRODUCTION_TYPE: 'PLAN',
                        VIN: row.VIN,
                        START_PORT: row['CVE PUERTO ORIGEN'],
                        END_PORT: row['CLAVE PUERTO DESTINO'],
                        PLANNED_ACTUAL_OFFLINE_DATE: date.toISOString(),
                        LOCAL_ORDER_NO: row['ORDEN PRODUCCION'],
                        ORDERTAKE_BASE_PERIOD: row['ANO MES PEDIDO']
                    });

                    events.push({
                        TYPE: 3,
                        CODE: origen,
                        NAME: 'PRODUCCION_PLAN',
                        EVENT_DATE: date,
                        VIN_TEMP: row.VIN
                    })
                }
            }

            // Insert Sale
            if (!lastVehicle[0].SALE_ID) {
                if (!row['FECHA ENTREGA A VENTAS']) {
                    errores.push({vin: row.VIN, error: "The DELIVERY_DATE Does Not Exist"});
                    continue;
                }
                const dateEntrega = Utils.convertToSpecificTime(row['FECHA ENTREGA A VENTAS'].toString());
                salesArr.push({
                    VIN: row.VIN,
                    NSC_ID: buyer[0].BUYER_ID,
                    DELIVERY_DATE: dateEntrega.toISOString(),
                    NOTES: sales
                });
                events.push({
                    TYPE: 5,
                    CODE: row['CVE NSC'],
                    NAME: 'SALES_DELIVERY',
                    EVENT_DATE: dateEntrega,
                    VIN_TEMP: row.VIN
                })

            }

            // Insert Invoice
            if (!lastVehicle[0].INVOICE_ID) {
                if (!row['FECHA FACTURA NISSAN']) {
                    errores.push({vin: row.VIN, error: "The INVOICE_DATE Does Not Exist"});
                    continue;
                }
                invoices.push({
                    INVOICE_CODE: row['FACTURA NISSAN'],
                    VIN: row.VIN,
                    INVOICE_DATE: dateInvoice.toISOString(),
                    FREE_ON_BOARD_COST: row.NFOB,
                    INSURANCE_COST: row.NSEGURO,
                    ADITIONAL_COST: row.NFLETE,
                    TOTAL: row.NPRECIO,
                    SALES_NOTE: sales,
                    PAYMENT_TERMS_CODE: row['NCONDICION_PAGO'],
                    PREFIX: row['FACTURA NISSAN'].toString().substring(0, 2),
                });

                await userRepository.insertEventWithouthId(6, row['FACTURA NISSAN'], 'NSC_INVOICE',
                    dateInvoice, token.user.userId, row.VIN);
            }

            // Insert Shipment
            if (!lastVehicle[0].SHIPMENT_ID) {
                if (!row['FECHA EMBARQUE']) {
                    errores.push({vin: row.VIN, error: "The SHIPPMENT_DATE Does Not Exist"});
                    continue;
                }
                const dateShipment = Utils.convertToSpecificTime(row['FECHA EMBARQUE'].toString());

                shipments.push({
                    VIN: row.VIN,
                    FEE: row.NFOB,
                    INSURANCE_FEE: row.NSEGURO,
                    ADD_FEE: row.NFOB,
                    SHIPPMENT_DATE: dateShipment.toISOString(),
                    ORIGIN_PORT_CODE: row['CVE PUERTO ORIGEN'],
                    DEST_PORT_CODE: row['CLAVE PUERTO DESTINO'],
                    BOAT_NAME: row.BUQUE,
                    WEIGHT: row.PESO
                });

                events.push({
                    TYPE: 12,
                    CODE: row['CLAVE PUERTO DESTINO'],
                    NAME: 'PORT_END_SHIPMENT',
                    EVENT_DATE: dateShipment,
                    VIN_TEMP: row.VIN
                })
            }

            // Insert NSC Invoice
            if (!lastVehicle[0].NSC_INVOICE_ID) {
                const vmc = salesType[row.VMC] || 0;
                const eventId = await userRepository.getEventByNameType(row.VIN, 6);
                nscInvoices.push({
                    VIN: row.VIN,
                    BUYER_CODE: buyer[0].BUYER_CODE,
                    INVOICE_CODE: row['FECHA FACTURA NISSAN'],
                    EVENT_ID: eventId[0].EVENT_ID,
                    SALES_TYPE_ID: vmc
                });
            }
        }
        await userRepository.executeQuery(`COMMIT;`)

        await userRepository.executeQuery(`BEGIN;`)
        await Promise.all([
            productions.length > 0 ? userRepository.insertProductionMasive(productions, token.user.userId, nDate.toISOString()) : null,
            salesArr.length > 0 ? userRepository.insertSaleMasive(salesArr, token.user.userId, nDate.toISOString()) : null,
            invoices.length > 0 ? userRepository.insertInvoiceFileMasive(invoices, token.user.userId, nDate.toISOString()) : null,
            events.length > 0 ? userRepository.insertEventWithouthIdMasive(events, token.user.userId, nDate.toISOString()) : null,
            shipments.length > 0 ? userRepository.insertShipmentMasive(shipments, token.user.userId, nDate.toISOString()) : null,
            nscInvoices.length > 0 ? userRepository.insertNscInvoiceMasive(nscInvoices, token.user.userId, nDate.toISOString()) : null
        ].filter(p => p !== null));
        await userRepository.executeQuery(`COMMIT;`)

        res.status(200).send()
    } catch (e) {
        console.error("Error procesando el archivo CSV: ", e);
        await userRepository.executeQuery(`ROLLBACK;`)
        next(e)
    }
});

export default router;
