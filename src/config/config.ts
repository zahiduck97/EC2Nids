const snowflake = require('snowflake-sdk');
let connection;

const getConnection = async function getConnection() {
    try {
        if (connection) {
            return connection;
        }

        const dataB64 = "ewogICAiYWNjZXNzVXJsIjoiaHR0cHM6Ly9uaXNzYW5uZXh0Z2VuLnVzLWVhc3QtMS5wcml2YXRlbGluay5zbm93Zmxha2Vjb21wdXRpbmcuY29tIiwKICAgImluc2VjdXJlQ29ubmVjdCI6dHJ1ZSwKICAgImFjY291bnQiOiJOSVNTQU5BTUVSSUNBUy1OSVNTQU5ORVhUR0VOIiwKICAgInVzZXJuYW1lIjoiTklEU19MQU1CREFfV0VCQVBQX1NWQ19QUkQiLAogICAicGFzc3dvcmQiOiIqJW4uVC1fMkA0I1U3eUAuNX5ja2EpTzkjSWtMVEAodl4kUiIsCiAgICJkYXRhYmFzZSI6IlNQREJOSURTIiwKICAgInNjaGVtYSI6Ik5JRFNfU1RHIgp9";

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

const closeConnection = async () => {
    return new Promise((resolve, reject) => {
        if (connection) {
            connection.destroy((err, conn) => {
                if (err) {
                    console.error('Unable to close the connection:', err);
                    reject(err); // Manejar el error como prefieras
                } else {
                    console.log('Connection successfully closed');
                    resolve(true);
                }
            });
            connection = null; // Asegurarse de resetear el objeto de conexión
        } else {
            console.log('No connection to close');
            resolve(false); // Indicar que no había conexión para cerrar
        }
    });
};

module.exports = { getConnection, closeConnection };
