'use strict';

const express = require('express');
const router = express.Router();

// initialize logger
const log4js = require('log4js');
const logger = log4js.getLogger('gamemgr');

const fs = require('fs');

const { getBot, getBotCode, getMaze } = require('./service');

const games = loadData('./data/data.json');

/**
 * Temporary function to initialize service from JSON data file.
 * 
 * @param {string} filename - data file name
 * @return {*}
 */
function loadData(filename) {
    if (fs.existsSync(filename)) {
        logger.info('Read sample config: ./data/data.json');
        try {
            const readdata = fs.readFileSync('./data/data.json', 'utf8');
            const conf = JSON.parse(readdata);
            return conf.games;
        } catch (error) {
            logger.error(`Cannot read sample config: ./data/data.json: ${error.message}`);
        }
    }
    return {};
}

let gameid = 10;

/**
 * Return error message to client.
 * 
 * Build a JSON applicative error message and answer with the appropriate HTTP return status.
 * 
 * @example
 * { error: 12, message: 'There is an error.' }
 * 
 * @param {number} httpCode - HTTP status
 * @param {number} code - application error code
 * @param {string} message - human readable message
 * @param {Response<any, number>} res - expressjs Response object
 * @param {NextFunction} next - expressjs next callback
 */
function returnError(httpCode, code, message, res, next) {
    res.status(httpCode);
    res.json({
        error: code,
        message: message
    });
    next();
}

/**
 * @swagger
 * /api/games:
 *   get:
 *     summary: Return list of game.
 *     description: Return list of game.
 *     responses:
 *       200:
 *         description: list of game.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The game ID.
 *                     example: 1
 *                   state:
 *                     type: string
 *                     description: game state.
 *                     example: init
 */
router.get('/games', function (_req, res, next) {
    const gameList = [];
    for (const g in games) {
        gameList.push({
            id: games[g].id,
            state: games[g].state,
            steps: games[g].steps
        });
    }
    res.json(gameList);
    next();
});

/**
 * @swagger
 * /api/games/{gameid}:
 *   get:
 *     summary: Return choosen game.
 *     description: Return choosen game.
 *     parameters:
 *       - in: path
 *         name: gameid
 *         required: true
 *         description: Numeric ID of the game to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: game.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The game ID.
 *                   example: 1
 *                 state:
 *                   type: string
 *                   description: game state.
 *                   example: init
 *       404:
 *         description: game id not found.
 */
router.get('/games/:gameid', function (req, res, next) {
    const gameid = req.params.gameid;
    logger.debug(`Get game= ${gameid}`);
    if (games[gameid]) {
        res.json(games[gameid]);
        next();
    } else {
        returnError(404, 301, `game id ${gameid} not found.`, res, next);
    }
});


/**
 * @swagger
 * /api/games:
 *   post:
 *     summary: Create game.
 *     description: Create game.
 *     requestBody:
 *       description: Game info.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerid
 *               - botid
 *               - mazeid
 *             properties:
 *               playerid:
 *                 type: integer
 *                 description: The player ID.
 *                 example: 1
 *               botid:
 *                 type: integer
 *                 description: The bot ID.
 *                 example: 1
 *               mazeid:
 *                 type: integer
 *                 description: The maze ID.
 *                 example: 1
 *     responses:
 *       201:
 *         description: new game created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The game ID.
 *                   example: 1
 *                 state:
 *                   type: string
 *                   description: game state.
 *                   example: init
 *                 player:
 *                   type: number
 *                   description: player ID.
 *                   example: 1
 *                 bot:
 *                   type: number
 *                   description: bot ID.
 *                   example: 1
 *                 maze:
 *                   type: number
 *                   description: maze ID.
 *                   example: 1
 *                 step:
 *                   type: number
 *                   description: number of step to exit from maze.
 *                   example: 12
 *                 mazeConfiguration:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: maze definition.
 *                 botURL:
 *                   type: string
 *                   description: bot code.
 *                   example: /data/bot/bot1.js
 *       404:
 *         description: player, bot or maze id not found.
 */
router.post('/games', function (req, res, next) {

    const playerid = req.fields.playerid;
    const botid = req.fields.botid;
    const mazeid = req.fields.mazeid;

    // get bot
    getBot(playerid, botid)
        .then((result) => {
            // bot exists look for maze
            const theBot = result.data;
            getMaze(mazeid)
                .then((result) => {
                    games[gameid] = {
                        id: gameid,
                        player: playerid,
                        bot: botid,
                        maze: mazeid,
                        state: 'init',
                        steps: 0,
                        mazeConfiguration: result.data.configuration,
                        botURL: theBot.url
                    };
                    res.status(201).json({id: gameid, state: 'init'});
                    gameid = gameid + 1;
                    next();
                }).catch((error) => {
                    // cannot reach maze service
                    returnError(404, 311, `Cannot find maze ${mazeid}.`, res, next);
                });

        }).catch((error) => {
            // cannot reach player service
            returnError(404, 312, `Cannot find player ${playerid} or bot ${botid}.`, res, next);
        });

});

/**
 * @swagger
 * /api/games/{gameid}/start:
 *   post:
 *     summary: Start choosen game.
 *     description: Start choosen game.
 *     parameters:
 *       - in: path
 *         name: gameid
 *         required: true
 *         description: Numeric ID of the game to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: game.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The game ID.
 *                   example: 1
 *                 state:
 *                   type: string
 *                   description: game state.
 *                   example: init
 *       404:
 *         description: game id not found or game already executed.
 */
router.post('/games/:gameid/start', function (req, res, next) {
    const gameid = req.params.gameid;
    logger.debug(`Get game= ${gameid}`);
    if (games[gameid]) {
        if (games[gameid].state !== 'init') {
            returnError(404, 321, `game id ${gameid} already executed.`, res, next);
        } else {
            games[gameid].state = 'running';
            games[gameid].botURL = getBotCode(games[gameid].botURL);
            require('./engine')(games[gameid]);
            res.json({id: gameid, state: games[gameid].state});
            next();
        }
    } else {
        returnError(404, 322, `game id ${gameid} not found.`, res, next);
    }
});

module.exports = {
    router
};
