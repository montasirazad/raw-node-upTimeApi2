const { sampleHandler } = require("./handlers/routesHandlers/sampleHandlers");
const { userHandler } = require('./handlers/routesHandlers/userHandler');
const { tokenHandler } = require('./handlers/routesHandlers/tokenHandler');
const { checkHandler } = require("./handlers/routesHandlers/checkHandler");

const routes = {

    sample: sampleHandler,
    user: userHandler,
    token: tokenHandler,
    check: checkHandler

};



module.exports = routes;