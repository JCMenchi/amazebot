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
        mazemgr: { appenders: ['out'], level: 'debug' }
      }
    });
  }
}
const logger = log4js.getLogger('mazemgr');

/*
 * Declare command line option.
 */
const parsed = require('yargs')
    .scriptName("playermgr")
    .usage('$0 [OPTION]', 'Player manager backend.').strict(true)
    .option('p', {
        alias: 'port',
        describe: 'http port',
        default: 8082,
        type: 'number'
    })
    .option('t', {
      alias: 'test',
      describe: 'use in memory db for test',
      type: 'boolean'
    })
    .option('s', {
      alias: 'secure',
      describe: 'use keycloak',
      type: 'boolean'
    })
    .option('d', {
      alias: 'showdoc',
      describe: 'show swagger doc on /docs',
      type: 'boolean'
    })
    .demandCommand(0)
    .version().alias('v', 'version')
    .help().alias('h', 'help')
    .argv;

// Configure tracing
const tracing = require('./src/tracing');

// initialize server
const MazeManager = require('./src/mazemgr');
const mazemgr = new MazeManager(parsed.showdoc, parsed.secure, parsed.test);
mazemgr.init();
// start server
mazemgr.startServer(parsed.port);
