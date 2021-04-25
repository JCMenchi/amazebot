/* jslint node: true */
/* jshint esversion: 8 */
'use strict';

// initialize logger
const log4js = require('log4js');
const logger = log4js.getLogger('mazemgr');

/*
 * Initialize performance measurement.
 */
const { performance, PerformanceObserver } = require('perf_hooks');
// Listen to Performance measurement
const obs = new PerformanceObserver((list, _observer) => {
    for (let e of list.getEntries()) {
        logger.debug('PERF: ' + e.name + ' ' + e.duration + ' ms');
    }
    performance.clearMarks();
});
obs.observe({ entryTypes: ['measure'], buffered: true });

// Setup swagger
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Maze Manager',
    version: '0.1.0',
  },
};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./src/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

/*
 * Create express application.
 */
const express = require('express');
const helmet = require('helmet');
const http = require('http');
const app = express();
const path = require('path');

app.use(helmet());
app.set('etag', false);
app.set('x-powered-by', false);

// init HTML FORM processing
const formidable = require('express-formidable');
app.use(formidable({
    encoding: 'utf-8',
    uploadDir: path.join(__dirname, '/uploads'),
    multiples: true,
    keepExtensions: true
}));

const { countAllRequests } = require("./monitoring");
app.use(countAllRequests());

// this middleware is called first to setup performnace mark
app.use(function (req, res, next) {
    performance.mark('Start ' + req.method + ' ' + req.path);
    // all OK call real route
    next();
});

/**
 * @swagger
 * /info:
 *   get:
 *     summary: Return info about maze service.
 *     description: Return info about maze service.
 *     responses:
 *       200:
 *         description: service state information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: service state.
 *                   example: UP
*/
app.get('/info', function (_req, res, next) {
    res.json({ state: 'UP' });
    next();
});

/* add route */
const { router } = require('./route.js');
app.use('/api', router);

/* add swagger endpoint */
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// show performance measurement and log error if nothing has been sent
app.use(function (req, res, next) {
    /* istanbul ignore else */
    if (res.writableEnded) {
        logger.debug('End Call ' + req.method + ' ' + req.path);
        performance.mark('End ' + req.method + ' ' + req.path);
        performance.measure('Call ' + req.method + ' ' + req.path, 'Start ' + req.method + ' ' + req.path, 'End ' + req.method + ' ' + req.path);
        next();
    } else {
        logger.error(`Unknown request ${req.method}:${req.path}`);
        next('unknown request.'); // send error
    }
});

/**
 * Start http server.
 * 
 * @param {number} port - http server port
 * @return {http.Server}
 */
function startServer(port) {
    const HTTPServer = http.createServer(app).listen(port, () => {
        logger.info('Maze Manager listening at http://%s:%s', HTTPServer.address().address, HTTPServer.address().port);
    });

    return HTTPServer;
}

/* export functions */
module.exports = { startServer, app };