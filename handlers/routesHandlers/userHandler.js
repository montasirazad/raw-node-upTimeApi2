const data = require('../../lib/data');
const { hash, parsedJSON } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler')



const handler = {};

handler.userHandler = (requestedProperties, callback) => {

    const acceptedMethod = ['get', 'post', 'put', 'delete'];

    if (acceptedMethod.indexOf(requestedProperties.method) > -1) {
        handler._users[requestedProperties.method](requestedProperties, callback)

    } else {

        callback(405) // status code 405 means you are not allowed
    }


}

handler._users = {};

handler._users.post = (requestedProperties, callback) => {

    const firstName = typeof (requestedProperties.body.firstName) === 'string'
        && requestedProperties.body.firstName.trim().length > 0 ? requestedProperties.body.firstName : false;

    const lastName = typeof (requestedProperties.body.lastName) === 'string'
        && requestedProperties.body.lastName.trim().length > 0 ? requestedProperties.body.lastName : false;

    const phone = typeof (requestedProperties.body.phone) === 'string'
        && requestedProperties.body.phone.trim().length === 11 ? requestedProperties.body.phone : false;

    const password = typeof (requestedProperties.body.password) === 'string'
        && requestedProperties.body.password.trim().length > 0 ? requestedProperties.body.password : false;

    const tosAgreement = typeof (requestedProperties.body.tosAgreement) === 'boolean'
        && requestedProperties.body.tosAgreement === true ? requestedProperties.body.tosAgreement : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        data.read('users', phone, (err, user) => {
            if (err) {

                let userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement
                }

                data.create('users', phone, userObject, (err) => {

                    if (!err) {

                        callback(200, {
                            message: 'user created successfully'
                        })
                    } else {
                        callback(500, {
                            error: 'Could not create user'
                        })
                    }
                })
            } else {
                callback(500, {
                    error: 'There is a problem in server side'
                })
            }
        })
    } else {
        callback(400, {
            error: 'Ýou have problem in your request'
        })
    }

};



handler._users.get = (requestedProperties, callback) => {

    const phone = typeof (requestedProperties.queryStringObject.phone) === 'string'
        && requestedProperties.queryStringObject.phone.trim().length === 11 ?
        requestedProperties.queryStringObject.phone : false;

    if (phone) {

        let token = typeof (requestedProperties.headerObject.token) === 'string'
            ? requestedProperties.headerObject.token : false;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            if (tokenId) {
                data.read('users', phone, (err, user) => {
                    if (!err && user) {
                        let userData = { ...parsedJSON(user) }
                        delete userData.password;
                        callback(200, userData)
                    } else {
                        callback(400, {
                            error: 'Ýou have problem in your request'
                        })
                    }
                })
            } else {
                callback(403, {
                    error: 'Authentication failed'
                })
            }
        })


    }

};

handler._users.put = (requestedProperties, callback) => {

    const firstName = typeof (requestedProperties.body.firstName) === 'string'
        && requestedProperties.body.firstName.trim().length > 0 ? requestedProperties.body.firstName : false;

    const lastName = typeof (requestedProperties.body.lastName) === 'string'
        && requestedProperties.body.lastName.trim().length > 0 ? requestedProperties.body.lastName : false;

    const phone = typeof (requestedProperties.body.phone) === 'string'
        && requestedProperties.body.phone.trim().length === 11 ? requestedProperties.body.phone : false;

    const password = typeof (requestedProperties.body.password) === 'string'
        && requestedProperties.body.password.trim().length > 0 ? requestedProperties.body.password : false;



    if (phone) {

        if (firstName || lastName || password) {


            let token = typeof (requestedProperties.headerObject.token) === 'string'
                ? requestedProperties.headerObject.token : false;

            tokenHandler._token.verify(token, phone, (tokenId) => {
                if (tokenId) {
                    data.read('users', phone, (err, userData) => {

                        const updatedData = { ...parsedJSON(userData) }

                        if (!err && updatedData) {
                            if (firstName) {
                                updatedData.firstName = firstName
                            };

                            if (lastName) {
                                updatedData.lastName = lastName
                            }

                            if (password) {
                                userData.password = hash(password)
                            }

                            data.update('users', phone, updatedData, (err) => {
                                if (!err) {
                                    callback(200, {
                                        error: 'Data updated successfully.'
                                    })
                                } else {
                                    callback(500, {
                                        error: 'Server side error.'
                                    })
                                }
                            })
                        }
                    })

                } else {
                    callback(403, {
                        error: 'Authentication failed'
                    })
                }
            })







        } else {
            callback(400, {
                error: 'You have problem in your request.'
            })
        }

    }
    else {
        callback(400, {
            error: 'invalid phone number.Please try again.'
        })
    }
};
handler._users.delete = (requestedProperties, callback) => {

    const phone = typeof (requestedProperties.queryStringObject.phone) === 'string'
        && requestedProperties.queryStringObject.phone.trim().length === 11 ?
        requestedProperties.queryStringObject.phone : false;

    if (phone) {


        let token = typeof (requestedProperties.headerObject.token) === 'string'
            ? requestedProperties.headerObject.token : false;

        tokenHandler._token.verify(token, phone, (tokenId) => {
            if (tokenId) {
                data.read('users', phone, (err, userData) => {
                    if (!err && userData) {
                        data.delete('users', phone, (err) => {
                            if (!err) {
                                callback(500, {
                                    message: 'deleted successfully.'
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
                callback(403, {
                    error: 'Authentication failed'
                })
            }
        })




    } else {
        callback(400, {
            error: 'invalid phone number.Please try again.'
        })
    }
};

module.exports = handler;