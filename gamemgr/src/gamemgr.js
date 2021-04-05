'use strict';

// initialize logger
const log4js = require('log4js');
const logger = log4js.getLogger('gamemgr');

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
        title: 'Game Manager',
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
const helmet = require("helmet");
const http = require('http');
const app = express();

app.use(helmet());
app.set('etag', false);
app.set('x-powered-by', false);

const { countAllRequests } = require("./monitoring");
app.use(countAllRequests());

// serve logs from data/log
app.use('/data/', express.static('./data/', {fallthrough: false}));

// init HTML FORM processing
const formidable = require('express-formidable');
app.use(formidable({
    encoding: 'utf-8',
    multiples: true,
    keepExtensions: true
}));

// this middleware is called first to setup performnace mark
app.use(function (req, _res, next) {
    performance.mark('Start ' + req.method + ' ' + req.path);
    // all OK call real route
    next();
});

/**
 * @swagger
 * /info:
 *   get:
 *     summary: Return info about game service.
 *     description: Return info about game service.
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

/*
 * Last middleware.
 * Used to measure performance or log call to unknown URL
 */
app.use(function (req, res, _next) {
    performance.mark('End ' + req.method + ' ' + req.path);
    if (res.headersSent) {
        logger.debug('End Call ' + req.method + ' ' + req.path);
        performance.measure('Call ' + req.method + ' ' + req.path, 'Start ' + req.method + ' ' + req.path, 'End ' + req.method + ' ' + req.path);
    } else {
        logger.error('Unknown URL ' + req.method + ' ' + req.path);
        res.status(405).json({error: 11, message: 'Cannot interpert URL.' });
    }
});

/**
 * Start http server.
 * 
 * @param {number} port - http server port
 * @return {http.Server}
 */
function startServer(port) {
    const thePort = port;

    const HTTPServer = http.createServer(app).listen(thePort, '0.0.0.0', () => {
        logger.info('Game Manager listening at http://%s:%s', HTTPServer.address().address, HTTPServer.address().port);
    });

    return HTTPServer;
}

/* export functions */
module.exports = { startServer, app };