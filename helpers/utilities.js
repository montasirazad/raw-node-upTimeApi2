const utilities = {};
const crypto = require('crypto');
const environments = require('./environments');




utilities.parsedJSON = (jsonString) => {
    let outPut;

    try {
        outPut = JSON.parse(jsonString)
    } catch {
        outPut = {}
    }

    return outPut;
};

utilities.hash = (str) => {

    if (typeof (str) === 'string' && str.length > 0) {

        const hash = crypto.createHmac('sha256', environments.secretKey)
            .update(str)
            .digest('hex');
        //console.log(hash);
        return hash

    }
    return false;

}


utilities.createRandomString = (strLength) => {

    let length = strLength;

    length = typeof (strLength) === 'number' && strLength > 0 ? strLength : false;

    if (length) {

        let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';

        let output = '';


        for (let i = 1; i <= length; i++) {
            let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            output += randomCharacter
            // console.log(i, ':', randomCharacter)

        };

        return output;

    }

    return false;




}


module.exports = utilities;