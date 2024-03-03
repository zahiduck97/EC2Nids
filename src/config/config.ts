const snowflake = require('snowflake-sdk');
let connection;

const getConnection = async function getConnection() {
    try {
        if (connection) {
            console.log('Reutilizando Conexion')
            return connection;
        }

        const dataB64 = process.env.B64;

        let buff = Buffer.from(dataB64, 'base64');
        let text = buff.toString('ascii');
        const connectionString = JSON.parse(text);

        connection = snowflake.createConnection({
            accessUrl: connectionString.accessUrl,
            insecureConnect: connectionString.insecureConnect,
            account: connectionString.account,
            username: connectionString.username,
            password: connectionString.password,
            database: connectionString.database,
            schema: connectionString.schema
        });

        console.log('Creando conexion')

        return new Promise((resolve, reject) => {
            connection.connect(function (err, conn) {
                if (err) {
                    console.error('Unable to connect: ', err);
                    reject(err);
                } else {
                    console.log('Successfully connected as id: ' + connection.getId());
                    resolve(connection);
                }
            });
        });
    } catch (e) {
        console.log('Error conectando: ' + e)
    }
};

module.exports = { getConnection }
