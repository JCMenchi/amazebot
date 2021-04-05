'use strict';

/*
 * Initialize logger.
 */
const log4js = require('log4js');
const fs = require('fs');

if (process.env.LOG4JS_CONFIG === undefined) {
  if (fs.existsSync('./log4js.json')) {
    log4js.configure('./log4js.json');
  } else {
    log4js.configure({
      appenders: { out: { type: 'console' } },
      categories: {
        default: { appenders: ['out'], level: 'info' },
        gamemgr: { appenders: ['out'], level: 'trace' }
      }
    });
  }
}

/*
 * Declare command line option.
 */
const parsed = require('yargs')
    .scriptName("playermgr")
    .usage('$0 [OPTION]', 'Player manager backend.').strict(true)
    .option('p', {
        alias: 'port',
        describe: 'http port',
        default: 8083,
        type: 'number'
    })
    .option('P', {
      alias: 'playermgrurl',
      describe: 'Player Manager URL',
      default: 'http://127.0.0.1:8081/api',
      type: 'string'
    })
    .option('M', {
      alias: 'mazemgrurl',
      describe: 'Maze Manager URL',
      default: 'http://127.0.0.1:8082/api',
      type: 'string'
    })
    .demandCommand(0)
    .version().alias('v', 'version')
    .help().alias('h', 'help')
    .argv;

// Configure tracing, load this code to setup connection with jaegertracing service.
require('./src/tracing');

// Configure Player Manager and Maze Manager Service
const { initService } = require('./src/service');
initService(parsed.playermgrurl, parsed.mazemgrurl);

// Start server
const { startServer } = require('./src/gamemgr');
startServer(parsed.port);