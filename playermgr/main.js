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
        playermgr: { appenders: ['out'], level: 'debug' }
      }
    });
  }
}
const logger = log4js.getLogger('playermgr');

/*
 * Declare command line option.
 */
const parsed = require('yargs')
    .scriptName("playermgr")
    .usage('$0 [OPTION]', 'Player manager backend.').strict(true)
    .option('p', {
        alias: 'port',
        describe: 'http port',
        default: 8081,
        type: 'number'
    })
    .option('t', {
      alias: 'test',
      describe: 'use inmemory db for test',
      type: 'boolean'
    })
    .demandCommand(0)
    .version().alias('v', 'version')
    .help().alias('h', 'help')
    .argv;

// Configure tracing
const tracing = require('./src/tracing');

// Start server
const { startServer, app } = require('./src/playermgr');
const { FileRepository } = require('./src/file_repository');
const { DBRepository } = require('./src/database');

let db;
if (parsed.test) {
  logger.info('Run in test mode.');
  db = new FileRepository();
} else {
  db = new DBRepository('playeruser', 'playeruser');
}

app.set('repository', db);
startServer(parsed.port);