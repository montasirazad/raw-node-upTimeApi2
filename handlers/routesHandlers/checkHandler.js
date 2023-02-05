const data = require('../../lib/data');
const { hash, parsedJSON } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler')



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



};



handler._check.get = (requestedProperties, callback) => {


};

handler._check.put = (requestedProperties, callback) => {


};

handler._check.delete = (requestedProperties, callback) => {

    
};

module.exports = handler;