/* jslint node: true */
/* jshint esversion: 8 */
'use strict';

/*
 * initialize logger
 */
const log4js = require('log4js');
const fs = require('fs');

if (process.env.LOG4JS_CONFIG === undefined) {
  if (fs.existsSync('./log4js.json')) {
    log4js.configure('./log4js.json');
  } else {
    log4js.configure({
      appenders: {out: {type: 'console'}},
      categories: {
        default: {appenders: ['out'], level: 'info'},
      },
    });
  }
}
const logger = log4js.getLogger();

/**
 * setupExpress
 * @param {string} rootdir the root dir.
 * @return {express} the express app.
 */
function setupExpress(rootdir) {
  const express = require('express');
  const helmet = require("helmet");
  const app = express();
  
  app.use(helmet());

  // this middleware is called first to log call
  app.use(function(req, res, next) {
    logger.debug('Call ' + req.method + ' ' + req.path);
    next();
  });

  app.get('/', function(request, response, next) {
    response.sendFile(rootdir + '/index.html');
  });

  // server static file from local folder
  app.use('/', express.static('./'));

  // log unknown request
  app.use(function(req, res, next) {
    logger.error('End ' + req.method + ' ' + req.path);
    next();
  });
  return app;
}

/**
 * startServer
 * @param {express} app the express app.
 * @param {string} host the host of the testserver.
 * @param {string} port the port of the testserver.
 * @param {object} remote The url for remote scs rest gw, sim rest gw and primary trk.
 */
function startServer(app, host, port, remote) {
  const http = require('http');
  const HTTPServer = http.createServer(app);

  HTTPServer.on('error', function(err) {
    logger.error('Proxy error: ' + err.message);
  });

  HTTPServer.listen(port, host, function() {
    logger.info('Dev Server listening at http://%s:%s', HTTPServer.address().address, HTTPServer.address().port);
  });
}

// declare command line option
const parsed = require('yargs').scriptName(`server`)
    .usage('$0 [OPTION]', 'Backend to serve UI.').strict(true)
    .option('p', {
      alias: 'port',
      describe: 'http port of testserver',
      default: 7999,
      type: 'number',
    })
    .option('H', {
      alias: 'host',
      describe: 'http hostname of testserver',
      default: '127.0.0.1',
      type: 'string',
    })
    .version().alias('v', 'version')
    .help().alias('h', 'help')
    .argv;


const app = setupExpress(__dirname);
startServer(app, parsed.host, parsed.port, remote);

