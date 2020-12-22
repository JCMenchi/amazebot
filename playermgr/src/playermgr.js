/* jslint node: true */
/* jshint esversion: 8 */
'use strict';

// initialize logger
const log4js = require('log4js');
const logger = log4js.getLogger('playermgr');

/*
 * Create express application.
 */
const express = require('express');
const http = require('http');
const app = express();

/*
 * 
 */
app.get('/info', function (_req, res, next) {
    res.json({state: 'UP'});
    next();
});

/**
 * Start http server.
 * 
 * @param {number} port - http server port
 * @return {http.Server}
 */
function startServer(port) {
    const thePort = port || 8081;

    const HTTPServer = http.createServer(app).listen(thePort, '0.0.0.0', () => {
        logger.info('Player Manager listening at http://%s:%s', HTTPServer.address().address, HTTPServer.address().port);
    });

    return HTTPServer;
}

/* export functions */
module.exports = { startServer, app };