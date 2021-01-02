'use strict';

const worker = require('worker_threads');

module.exports = (game) => {
    if (worker.isMainThread) {
        // initialize logger
        const log4js = require('log4js');
        const logger = log4js.getLogger('gamemgr');

        // This re-loads the current file inside a Worker instance.
        const wrk = new worker.Worker(__filename, { workerData: game });

        wrk.on('online', () => {
            logger.info(`Worker #${wrk.threadId} is started`);
        });

        wrk.on('message', (value) => {
            logger.info(`Worker #${wrk.threadId} message: ${JSON.stringify(value)}`);
            // copy execution result
            if (value.state) {
                game.state = value.state;
            }
            if (value.steps) {
                game.steps = value.steps;
            }
        });

        wrk.on('error', (err) => {
            logger.error(`Worker #${wrk.threadId} error: ${err}`);
        });

        wrk.on('messageerror', (error) => {
            logger.error(`Worker #${wrk.threadId} message error: ${error.message}`);
        });

        wrk.on('exit', (code) => {
            logger.info(`Worker #${wrk.threadId} exited with code: ${code}`);
            if (code !== 0) {
                game.state = 'failure';
            }
        });

        return wrk;
    }
};

// we are in worker thread
if (!worker.isMainThread) {
    /*
     * Initialize logger.
     * log4js has to be configure in each worker thread.
     */
    const log4js = require('log4js');
    const fs = require('fs');

    if (process.env.LOG4JS_CONFIG === undefined) {
        log4js.configure({
            appenders: { out: { type: 'console' } },
            categories: {
                default: { appenders: ['out'], level: 'info' },
                gameworker: { appenders: ['out'], level: 'debug' }
            }
        });
    }
    const logger = log4js.getLogger('gameworker');

    const axios = require('axios');
    const vm = require('vm');
    const maze = require('./maze');

    const game = worker.workerData;
    logger.info('Start Worker.');

    // create log file folder if needed
    if (!fs.existsSync('./data/log')) {
        fs.mkdirSync('./data/log', { recursive: true });
    }

    axios.get(game.botURL).then((result) => {
        // load bot script
        global.executeStep = undefined;
        const script = new vm.Script(result.data, { filename: game.botURL });
        script.runInThisContext({ timeout: 5000 });
        if (global.executeStep === undefined) {
            logger.error('Cannot find BOT main function.');
            process.exit(101);
        }

        // create Maze
        const theMaze = new maze.Maze(game.mazeConfiguration, `./data/log/player${game.player}_bot${game.bot}_game${game.id}.log`);
        // execute bot
        theMaze.run(global.executeStep);
        // return result
        worker.parentPort.postMessage(theMaze.result());
        theMaze.logfile.on("end", function() {
            theMaze.logfile.end();
            process.exit(0);
        });
        
    }).catch((error) => {
        if (error.isAxiosError) {
            logger.error(`Error from PlayerManager(${error.config.url}): ${JSON.stringify(error.toJSON())}`);
        } else {
            logger.error(`Error from PlayerManager: ${error.message}`);
        }
        process.exit(102);
    });

}