'use strict';

// initialize logger
const log4js = require('log4js');
const logger = log4js.getLogger('mazemgr');

// load express package
const express = require('express');
const formidable = require('express-formidable');
const helmet = require('helmet');
const http = require('http');
const path = require('path');
const Keycloak = require('keycloak-connect');

module.exports = class MazeManager {

    /**
     * 
     * @param {*} showdoc 
     * @param {*} secure 
     * @param {*} test
     */
    constructor(showdoc, secure, test) {
        this.test = test;
        this.secure = secure;
        this.showdoc = showdoc;
        this.showPerf = true;
    }

    /**
     * Create express and initialize routes
     */
    init() {
        this.app = express();
        this.app.use(helmet());
        this.app.set('etag', false);
        this.app.set('x-powered-by', false);

        /* istanbul ignore else */
        if (this.showPerf) {
            this.performance = this.initPerfMeasurement();
        }
        this.initMonitoring();

        /* istanbul ignore next */
        if (this.secure) {
            this.initSecurity();
        }

        // init HTML FORM processing
        this.app.use(formidable({
            encoding: 'utf-8',
            uploadDir: path.join(__dirname, '/uploads'),
            multiples: true,
            keepExtensions: true
        }));

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
        this.app.get('/info', function (_req, res, next) {
            res.json({ state: 'UP' });
            next();
        });

        /* istanbul ignore else */
        if (this.showdoc) {
            this.initDoc();
        }

        // add route
        const router = require('./route.js')(this.keycloak);
        this.app.use('/api', router);

        // setup persistance
        /* istanbul ignore else */
        if (this.test) {
            logger.info('Run in test mode.');
            const { FileRepository } = require('./file_repository');
            const fr = new FileRepository();
            this.app.set('repository', fr);
        } else {
            const { DBRepository } = require('./database');
            const db = new DBRepository('mazeuser', 'mazeuser');
            this.app.set('repository', db);
        }

        // show performance measurement and log error if nothing has been sent
        this.app.use(function (req, res, next) {
            /* istanbul ignore else */
            if (req.app.settings.performance) {
                if (res.writableEnded) {
                    logger.debug('End Call ' + req.method + ' ' + req.path);
                    req.app.settings.performance.mark('End ' + req.method + ' ' + req.path);
                    req.app.settings.performance.measure('Call ' + req.method + ' ' + req.path, 'Start ' + req.method + ' ' + req.path, 'End ' + req.method + ' ' + req.path);
                    next();
                } else {
                    logger.error(`Unknown request ${req.method}:${req.path}`);
                    next('unknown request.'); // send error
                }
            }
        });
    }

    /**
     * For keycloak
     */
    /* istanbul ignore next */
    initSecurity() {
       
        this.keycloak = new Keycloak({});
        this.keycloak.authenticated = (req) => {
            logger.info('keycloak authenticated');
        };

        this.keycloak.deauthenticated = (req) => {
            logger.info('keycloak deauthenticated');
        };

        this.keycloak.accessDenied = (req, res) => {
            logger.info('keycloak accessDenied');
            res.status(403).json({
                error: 403,
                message: 'access denied'
            });
        };

        this.app.use(this.keycloak.middleware({
            logout: '/logout',
            admin: '/'
        }));
    }

    /**
     * For prometheus
     */
    initMonitoring() {
        const { countAllRequests } = require("./monitoring");
        this.app.use(countAllRequests());
    }

    /**
     * Add log to measure performance
     */
    initPerfMeasurement() {
        const { performance, PerformanceObserver } = require('perf_hooks');

        // Listen to Performance measurement
        this.obs = new PerformanceObserver((list, _observer) => {
            for (let e of list.getEntries()) {
                logger.debug('PERF: ' + e.name + ' ' + e.duration + ' ms');
            }
            performance.clearMarks();
        });
        this.obs.observe({ entryTypes: ['measure'], buffered: true });

        this.app.set('performance', performance);

        // this middleware is called first to setup performnace mark
        this.app.use(function (req, res, next) {
            req.app.settings.performance.mark('Start ' + req.method + ' ' + req.path);
            // all OK call real route
            next();
        });

        return performance;
    }

    /**
     * Show swagger doc
     */
    initDoc() {
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
        /* add swagger endpoint */
        this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    }

    /**
        * Start http server.
        * 
        * @param {number} port - http server port
        * @return {http.Server}
        */
    startServer(port) {
        const HTTPServer = http.createServer(this.app).listen(port, () => {
            logger.info('Maze Manager listening at http://%s:%s', HTTPServer.address().address, HTTPServer.address().port);
        });

        return HTTPServer;
    }

};
