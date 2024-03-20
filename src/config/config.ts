const snowflake = require('snowflake-sdk');
let connection;

const getConnection = async function getConnection() {
    try {
        if (connection) {
            return connection;
        }

        const dataB64 = "eyJhY2Nlc3NVcmwiOiJodHRwczovL25pc3NhbmFtZXJpY2FzLW5tZXgucHJpdmF0ZWxpbmsuc25vd2ZsYWtlY29tcHV0aW5nLmNvbSIsImluc2VjdXJlQ29ubmVjdCI6dHJ1ZSwiYWNjb3VudCI6Ik5JU1NBTkFNRVJJQ0FTLU5NRVgiLCJ1c2VybmFtZSI6Ik5JRFNfQVdTX0xBTUJEQV9TVkNfREVWIiwicGFzc3dvcmQiOiItLH4zJW0pZzFqPSQkNDYmd0lCO04kJDI+eU8lN3k+KF5VQCIsImRhdGFiYXNlIjoiU0REQk5JRFMiLCJzY2hlbWEiOiJOSURTX1NURyJ9\n";

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
