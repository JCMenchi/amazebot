'use strict';

const worker = require('worker_threads');
const fs = require('fs');

/*
 Service worker cannot be tested by mocha
*/

module.exports = (game, repository, token, endcb) => {
    /* istanbul ignore else */
    if (!endcb && worker.isMainThread) {
        // run in asynchroneous mode when no callback is defined
        // initialize logger
        const log4js = require('log4js');
        const logger = log4js.getLogger('gamemgr');
            
        // create log file folder if needed
        /* istanbul ignore next */
        if (!fs.existsSync('./data/log')) {
            fs.mkdirSync('./data/log', { recursive: true });
        }

        // This re-loads the current file inside a Worker instance.
        const wrk = new worker.Worker(__filename, { workerData: { game: game, token: token }});

        wrk.on('online', () => {
            /* istanbul ignore next */
            logger.info(`Worker #${wrk.threadId} is started`);
        });

        wrk.on('message', (value) => {
            /* istanbul ignore next */
            logger.info(`Worker #${wrk.threadId} message: ${JSON.stringify(value)}`);
            // copy execution result
            /* istanbul ignore next */
            const gameinfo = {};

            /* istanbul ignore next */
            if (value.state) {
                gameinfo.state = value.state;
            }
            /* istanbul ignore next */
            if (value.steps) {
                gameinfo.steps = value.steps;
            }
            /* istanbul ignore next */
            repository.updateGame(game.id, gameinfo, (result, message) => {});
        });

        wrk.on('error', (err) => {
            /* istanbul ignore next */
            logger.error(`Worker #${wrk.threadId} error: ${err}`);
        });

        wrk.on('messageerror', (error) => {
            /* istanbul ignore next */
            logger.error(`Worker #${wrk.threadId} message error: ${error.message}`);
        });

        wrk.on('exit', (code) => {
            /* istanbul ignore next */
            logger.info(`Worker #${wrk.threadId} exited with code: ${code}`);
            /* istanbul ignore next */
            if (code !== 0) {
                game.state = 'failure';
            }
        });

        return wrk;
    }

    // run in synchroneous mode when a callback is defined
    /* istanbul ignore else */
    if (endcb) {
        // initialize logger
        const log4js = require('log4js');
        const logger = log4js.getLogger('gamemgr');

        runBot(game, token, logger, endcb);
    }
};

// we are in worker thread
/* istanbul ignore if */
if (!worker.isMainThread) {
    /*
     * Initialize logger.
     * log4js has to be configure in each worker thread.
     */
    const log4js = require('log4js');

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

    const game = worker.workerData.game;
    logger.info('Start Worker.');

    runBot(game, worker.workerData.token, logger, (code, result) => {
        if (code === 0) {
            worker.parentPort.postMessage(result);
        }
        process.exit(code);
    });
}

function runBot(game, token, logger, endcb) {
    const axios = require('axios');
    const vm = require('vm');
    const maze = require('./maze');

    axios.get(game.botURL, token?{ headers: { Authorization: token } }:undefined).then((result) => {
        // load bot script
        global.executeStep = undefined;

        try {
            /* istanbul ignore if */
            if (result.data.botcode) {
                const script = new vm.Script(result.data.botcode, { filename: result.data.filename });
                script.runInThisContext({ timeout: 5000 });
            } else {
                const script = new vm.Script(result.data, { filename: game.botURL });
                script.runInThisContext({ timeout: 5000 });
            }
        } catch (e) {
            logger.error('Cannot load script:', e);
        }
        if (global.executeStep === undefined) {
            logger.error('Cannot find BOT main function.');
            endcb(101, 'Cannot find BOT main function.');
            return;
        }

        // create Maze
        const theMaze = new maze.Maze(game.mazeConfiguration.maze, `./data/log/player${game.playerid}_bot${game.botid}_game${game.id}.log`);
        
        // return result when log file is closed
        theMaze.logfile.on("finish", function() {
            endcb(0, theMaze.result());
        });
        
        // execute bot
        theMaze.run(global.executeStep);
        
    }).catch((error) => {
        /* istanbul ignore else */
        if (error.isAxiosError) {
            logger.error(`Error from PlayerManager(${error.config.url}): ${JSON.stringify(error.toJSON())}`);
        } else {
            logger.error(`Error from PlayerManager: ${error.message}`);
        }
        endcb(102, 'Cannot get bot code.');
    });

}