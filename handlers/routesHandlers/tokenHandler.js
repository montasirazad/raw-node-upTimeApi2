const data = require('../../lib/data');
const { hash, parsedJSON, createRandomString } = require('../../helpers/utilities');

const handler = {};

handler.tokenHandler = (requestedProperties, callback) => {

    const acceptedMethod = ['get', 'post', 'put', 'delete'];

    if (acceptedMethod.indexOf(requestedProperties.method) > -1) {
        handler._token[requestedProperties.method](requestedProperties, callback)

    } else {

        callback(405) // status code 405 means you are not allowed
    }


}

handler._token = {};

handler._token.post = (requestedProperties, callback) => {

    const phone = typeof (requestedProperties.body.phone) === 'string'
        && requestedProperties.body.phone.trim().length === 11 ? requestedProperties.body.phone : false;

    const password = typeof (requestedProperties.body.password) === 'string'
        && requestedProperties.body.password.trim().length > 0 ? requestedProperties.body.password : false;

    if (phone && password) {

        data.read('users', phone, (err, userData) => {
            let hashedPassword = hash(password)
            if (hashedPassword === parsedJSON(userData).password) {

                let tokenId = createRandomString(20);
                let expires = Date.now() + 60 * 60 * 1000;
                let tokenObject = {
                    phone,
                    'id': tokenId,
                    expires
                }

                data.create('tokens', tokenId, tokenObject, (err) => {
                    if (!err) {
                        callback(200, tokenObject)
                    } else {
                        callback(500, {
                            error: 'server side error'
                        })
                    }
                })
            } else {
                callback(400, {
                    error: 'Password is not valid'
                })
            }
        })
    }

};



handler._token.get = (requestedProperties, callback) => {

    const id = typeof (requestedProperties.queryStringObject.id) === 'string'
        && requestedProperties.queryStringObject.id.trim().length === 20 ?
        requestedProperties.queryStringObject.id : false;

    if (id) {
        data.read('tokens', id, (err, tokenData) => {
            const token = { ...parsedJSON(tokenData) }

            if (!err && token) {
                callback(200, token)
            } else {
                callback(400, {
                    error: 'token not found'
                })
            }
        })
    } else {
        callback(400, {
            error: 'token not valid'
        })
    }
};



handler._token.put = (requestedProperties, callback) => {

    const id = typeof (requestedProperties.body.id) === 'string'
        && requestedProperties.body.id.trim().length === 20 ? requestedProperties.body.id : false;

    const extend = typeof (requestedProperties.body.extend) === 'boolean'
        && requestedProperties.body.extend === true ? true : false;


    if (id && extend) {

        data.read('tokens', id, (err, tokenData) => {


            let tokenObject = parsedJSON(tokenData);

            if (tokenObject.expires > Date.now()) {

                tokenObject.expires = Date.now() + 60 * 60 * 1000;

                data.update('tokens', id, tokenObject, (err) => {
                    if (!err) {
                        callback(200)
                    } else {
                        callback(500, {
                            error: 'There is a server side error'
                        })
                    }
                })
            } else {
                callback(400, {
                    error: 'Token already expired'
                })
            }


        })
    } else {
        callback(400, {
            error: 'There was a problem in your request'
        })
    }




};

handler._token.delete = (requestedProperties, callback) => {


    const id = typeof (requestedProperties.queryStringObject.id) === 'string'
        && requestedProperties.queryStringObject.id.trim().length === 20 ?
        requestedProperties.queryStringObject.id : false;

    if (id) {
        data.read('tokens', id, (err, tokenData) => {

            if (!err && tokenData) {
                data.delete('tokens', id, (err) => {
                    if (!err) {
                        callback(200, {
                            message: 'Token deleted successfully.'
                        })
                    } else {
                        callback(500, {
                            error: 'Server side error.'
                        })
                    }
                })
            } else {
                callback(500, {
                    error: 'Server side error.'
                })
            }
        })
    } else {
        callback(400, {
            error: 'invalid token.Please try again.'
        })
    }



}

handler._token.verify = (id, phone, callback) => {

    data.read('tokens', id, (err, tokenData) => {

        if (!err && tokenData) {
            if (parsedJSON(tokenData).phone === phone && parsedJSON(tokenData).expires > Date.now()) {
                callback(true)
            } else {
                callback(false)
            }
        } else {
            callback(false)
        }

    })
};


module.exports = handler;