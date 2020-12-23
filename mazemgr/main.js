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
        default: { appenders: ['out'], level: 'info' }
      }
    });
  }
}
const logger = log4js.getLogger('playermgr');

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
    .demandCommand(0)
    .version().alias('v', 'version')
    .help().alias('h', 'help')
    .argv;

// Start server
const { startServer } = require('./src/mazemgr');
startServer(parsed.port);