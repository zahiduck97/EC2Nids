const Validator = require('jsonschema').Validator;

module.exports = (data, path) => {
    if (!data || (data && Object.keys(data).length === 0) ) {
        return {status: false, message: `The Body Must Not Be Null Or Empty`}
    }
    const v = new Validator();
    const valor = v.validate(data, path).valid
    if (!valor) {
        return {status: false, message: `Required Params Were Not Sent`}
    }
    return {status: true};
}
