

const url = require('url');
const { StringDecoder } = require('string_decoder');
const { parsedJSON } = require('../helpers/utilities');
const { notFoundHandler } = require('../handlers/routesHandlers/notFoundHandler');
const routes = require('../routes');

const handler = {};


handler.handleReqRes = (req, res) => {


    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const queryStringObject = parsedUrl.query;
    const headerObject = req.headers;
    const decoder = new StringDecoder('utf-8');
    let realData = '';

    const requestedProperties = {
        parsedUrl,
        path,
        trimmedPath,
        method,
        queryStringObject, headerObject
    }

    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler

    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });

    req.on('end', () => {
        realData += decoder.end();
        requestedProperties.body = parsedJSON(realData);
        //console.log('test',requestedProperties.body);
        chosenHandler(requestedProperties, (statusCode, payload) => {
            statusCode = typeof (statusCode) === 'number' ? statusCode : 500;
            payload = typeof (payload) === 'object' ? payload : {}
            const payLoadString = JSON.stringify(payload);
            //console.log(realData);
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payLoadString);
        })


    });


};


module.exports = handler;