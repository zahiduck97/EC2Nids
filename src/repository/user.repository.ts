import Utils from "../utils/utils";

const Users = () => {};

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

export default Users;
