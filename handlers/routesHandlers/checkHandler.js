const data = require('../../lib/data');
const { hash, parsedJSON, createRandomString } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler')
const { maxChecks } = require('../../helpers/environments');


const handler = {};

handler.checkHandler = (requestedProperties, callback) => {

    const acceptedMethod = ['get', 'post', 'put', 'delete'];

    if (acceptedMethod.indexOf(requestedProperties.method) > -1) {
        handler._check[requestedProperties.method](requestedProperties, callback)

    } else {

        callback(405) // status code 405 means you are not allowed
    }


}

handler._check = {};

handler._check.post = (requestedProperties, callback) => {

    let protocol = typeof (requestedProperties.body.protocol) === 'string' &&
        ['http', 'https'].indexOf(requestedProperties.body.protocol) > -1 ? requestedProperties.body.protocol
        : false;

    let url = typeof (requestedProperties.body.url) === 'string' &&
        requestedProperties.body.protocol.trim().length > 0 ? requestedProperties.body.url
        : false;

    let method = typeof (requestedProperties.body.method) === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestedProperties.body.method) > -1 ?
        requestedProperties.body.method : false;

    let successCodes = typeof (requestedProperties.body.successCodes) === 'object' &&
        requestedProperties.body.successCodes instanceof Array ?
        requestedProperties.body.successCodes : false;

    let timeOutSeconds = typeof (requestedProperties.body.timeOutSeconds) === 'number' &&
        requestedProperties.body.timeOutSeconds % 1 === 0
        && requestedProperties.body.timeOutSeconds >= 1
        && requestedProperties.body.timeOutSeconds <= 5 ?
        requestedProperties.body.timeOutSeconds : false;


    if (protocol && url && method && successCodes && timeOutSeconds) {

        let token = typeof (requestedProperties.headerObject.token) === 'string'
            ? requestedProperties.headerObject.token : false;

        // look up the user phone by reading token

        data.read('tokens', token, (err, tokenData) => {

            if (!err && tokenData) {

                let userPhone = parsedJSON(tokenData).phone;
                // lookup user data

                data.read('users', userPhone, (err, userData) => {
                    if (!err && userData) {

                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                let userObject = parsedJSON(userData);

                                let userChecks = typeof (userObject.checks) === 'object' &&
                                    userObject.checks instanceof Array ? userObject.checks : [];

                                if (userChecks.length < maxChecks) {

                                    let checkId = createRandomString(20);
                                    let checkObject = {
                                        checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeOutSeconds
                                    }

                                    data.create('checks', checkId, checkObject, (err) => {
                                        if (!err) {
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);
                                            data.update('users', userPhone, userObject, (err) => {
                                                if (!err) {
                                                    callback(200, checkObject)
                                                } else {
                                                    callback(500, {
                                                        error: 'server side problem'
                                                    })
                                                }
                                            })
                                        } else {
                                            callback(500, {
                                                error: 'server side problem'
                                            })
                                        }
                                    })

                                } else {
                                    callback(401, {
                                        error: 'user reached max check'
                                    })
                                }
                            } else {
                                callback(403, {
                                    error: 'authentication failed'
                                })
                            }
                        })
                    } else {
                        callback(403, {
                            error: 'user not found'
                        })
                    }
                })

            } else {
                callback(403, {
                    error: 'authentication failed'
                })
            }
        })

    } else {
        callback(400, {
            error: 'you have problem in your request'
        })
    }

};



handler._check.get = (requestedProperties, callback) => {

    const id = typeof (requestedProperties.queryStringObject.id) === 'string'
        && requestedProperties.queryStringObject.id.trim().length === 20 ?
        requestedProperties.queryStringObject.id : false;

    if (id) {
        // look up check

        data.read('checks', id, (err, checkData) => {

            if (!err && checkData) {

                let token = typeof (requestedProperties.headerObject.token) === 'string'
                    ? requestedProperties.headerObject.token : false;

                tokenHandler._token.verify(token, parsedJSON(checkData).userPhone, (tokenIsValid) => {

                    if (tokenIsValid) {
                        callback(200, parsedJSON(checkData))
                    } else {
                        callback(403, {
                            error: 'authentication failed'
                        })
                    }
                })

            } else {
                callback(500, {
                    error: 'server side error'
                })
            }
        })

    } else {
        callback(400, {
            error: 'you have problem in your request'
        })
    }

};

handler._check.put = (requestedProperties, callback) => {

    let id = typeof (requestedProperties.body.id) === 'string' &&
        requestedProperties.body.id.trim().length > -1 ? requestedProperties.body.id
        : false;

    let protocol = typeof (requestedProperties.body.protocol) === 'string' &&
        ['http', 'https'].indexOf(requestedProperties.body.protocol) > -1 ? requestedProperties.body.protocol
        : false;

    let url = typeof (requestedProperties.body.url) === 'string' &&
        requestedProperties.body.protocol.trim().length > 0 ? requestedProperties.body.url
        : false;

    let method = typeof (requestedProperties.body.method) === 'string' &&
        ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestedProperties.body.method) > -1 ?
        requestedProperties.body.method : false;

    let successCodes = typeof (requestedProperties.body.successCodes) === 'object' &&
        requestedProperties.body.successCodes instanceof Array ?
        requestedProperties.body.successCodes : false;

    let timeOutSeconds = typeof (requestedProperties.body.timeOutSeconds) === 'number' &&
        requestedProperties.body.timeOutSeconds % 1 === 0
        && requestedProperties.body.timeOutSeconds >= 1
        && requestedProperties.body.timeOutSeconds <= 5 ?
        requestedProperties.body.timeOutSeconds : false;


    if (id) {


        if (protocol || url || method || successCodes || timeOutSeconds) {

            data.read('checks', id, (err, checkData) => {
                if (!err && checkData) {

                    let checkObject = parsedJSON(checkData);

                    let token = typeof (requestedProperties.headerObject.token) === 'string'
                        ? requestedProperties.headerObject.token : false;

                    tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {

                        if (tokenIsValid) {
                            if (protocol) {
                                checkObject.protocol = protocol
                            }

                            if (url) {
                                checkObject.url = url
                            }

                            if (method) {
                                checkObject.method = method
                            }

                            if (successCodes) {
                                checkObject.successCodes = successCodes
                            }

                            if (timeOutSeconds) {
                                checkObject.timeOutSeconds = timeOutSeconds
                            }

                            data.update('checks', id, checkObject, (err) => {
                                if (!err) {
                                    callback(200)
                                } else {

                                    callback(500, {
                                        error: 'server side error'
                                    })
                                }
                            })
                        } else {
                            callback(403, {
                                error: 'err1:authentication failed'
                            })
                        }
                    })

                } else {
                    callback(500, {
                        error: 'server side error'
                    })
                }
            })

        } else {
            callback(400, {
                error: 'you must provide at least one field'
            })
        }

    } else {
        callback(400, {
            error: 'you have problem in your request id'
        })
    }

};

handler._check.delete = (requestedProperties, callback) => {

    const id = typeof (requestedProperties.queryStringObject.id) === 'string'
        && requestedProperties.queryStringObject.id.trim().length === 20 ?
        requestedProperties.queryStringObject.id : false;

    if (id) {
        // look up check

        data.read('checks', id, (err, checkData) => {

            if (!err && checkData) {

                let token = typeof (requestedProperties.headerObject.token) === 'string'
                    ? requestedProperties.headerObject.token : false;

                tokenHandler._token.verify(token, parsedJSON(checkData).userPhone, (tokenIsValid) => {

                    if (tokenIsValid) {
                        data.delete('checks', id, (err) => {
                            if (!err) {
                                data.read('users', parsedJSON(checkData).userPhone, (err, userData) => {
                                    let userObject = parsedJSON(userData);

                                    if (!err && userData) {
                                        let userChecks = typeof (userObject.checks) === 'object' &&
                                            userObject.checks instanceof Array ? userObject.checks : []
                                        let checkPosition = userChecks.indexOf(id);
                                        if (checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1);
                                            userObject.checks = userChecks;
                                            data.update('users', userObject.phone, userObject, (err) => {
                                                if (!err) {
                                                    callback(200)
                                                } else {
                                                    callback(500, {
                                                        error: 'server side error'
                                                    })
                                                }
                                            })
                                        } else {
                                            callback(500, {
                                                error: 'check id error'
                                            })
                                        }



                                    } else {
                                        callback(500, {
                                            error: 'server side error'
                                        })
                                    }
                                })
                            } else {
                                callback(500, {
                                    error: 'server side error'
                                })
                            }
                        })
                    } else {
                        callback(403, {
                            error: 'authentication failed'
                        })
                    }
                })

            } else {
                callback(500, {
                    error: 'server side error'
                })
            }
        })

    } else {
        callback(400, {
            error: 'you have problem in your request'
        })
    }
};

module.exports = handler;