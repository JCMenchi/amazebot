'use strict';

const express = require('express');

// initialize logger
const log4js = require('log4js');
const logger = log4js.getLogger('gamemgr');

const fs = require('fs');

const { getBot, getBotCode, getMaze } = require('./service');

module.exports = (keycloak) => {

    // set up security
    let protect_middleware = (def) => {
        return (request, response, next) => {
            next();
        };
    };

    /* istanbul ignore if */
    if (keycloak !== undefined) {
        protect_middleware = keycloak.protect.bind(keycloak);
    }

    const router = express.Router();

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
    router.get('/games', protect_middleware('game.view'), function (req, res, next) {

        const repository = req.app.settings.repository;
        repository.getGames((games, err) => {
            /* istanbul ignore if */
            if (err) {
                returnError(404, 301, err, res, next);
            } else {
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
            }
        });
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
    router.get('/games/:gameid', protect_middleware('game.view'), function (req, res, next) {

        const gameid = req.params.gameid;
        const repository = req.app.settings.repository;
        repository.getGame(gameid, (game, err) => {
            if (err) {
                returnError(404, 302, err, res, next);
            } else {
                res.json(game);
                next();
            }
        });
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
    router.post('/games', protect_middleware('game.edit'), function (req, res, next) {

        const playerid = req.fields.playerid;
        const botid = req.fields.botid;
        const mazeid = req.fields.mazeid;
        const repository = req.app.settings.repository;

        // get bot
        getBot(playerid, botid)
            .then((result) => {
                // bot exists look for maze
                const theBot = result.data;
                const botname = result.data.name;
                const playername = result.data.player_name;
                getMaze(mazeid)
                    .then((result) => {

                        repository.addGame(playerid, botid, mazeid, playername, botname, result.data.name, result.data.configuration, theBot.url,
                            (game, err) => {
                                /* istanbul ignore if */
                                if (err) {
                                    // cannot create game
                                    returnError(404, 303, `Cannot create game.`, res, next);
                                } else {
                                    res.status(201).json(game);
                                    next();
                                }
                            });

                    }).catch((error) => {
                        // cannot reach maze service
                        returnError(404, 304, `Cannot find maze ${mazeid}.`, res, next);
                    });
            }).catch((error) => {
                // cannot reach player service
                returnError(404, 305, `Cannot find player ${playerid} or bot ${botid}.`, res, next);
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
    router.post('/games/:gameid/start', protect_middleware('game.edit'), function (req, res, next) {
        const gameid = req.params.gameid;
        logger.debug(`Get game= ${gameid}`);

        const repository = req.app.settings.repository;
        repository.getGame(gameid, (game, err) => {
            if (err) {
                returnError(404, 306, err, res, next);
            } else {
                if (game.state !== 'init') {
                    returnError(404, 307, `game id ${gameid} already executed.`, res, next);
                } else {
                    game.state = 'running';

                    repository.updateGame(game.id, { state: game.state }, (game, err) => {
                        /* istanbul ignore if */
                        if (err) {
                            returnError(404, 306, err, res, next);
                        } else {
                            game.botURL = getBotCode(game.botURL);
                            require('./engine')(game, repository);
                            res.json({ id: gameid, state: game.state });
                            next();
                        }
                    });

                }
            }
        });
    });

    /**
     * @swagger
     * /api/games/{gameid}:
     *   delete:
     *     summary: Delete game.
     *     description: Delete game.
     *     parameters:
     *       - in: path
     *         name: gameid
     *         required: true
     *         description: Numeric ID of the game to delete.
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: game deleted.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: integer
     *                   description: The game ID.
     *                   example: 1
     *       404:
     *         description: game not found.
     */
    router.delete('/games/:gameid', protect_middleware('game.admin'), protect_middleware('game.admin'), function (req, res, next) {
        const gameid = req.params.gameid;
        logger.debug(`Delete game= ${gameid}`);

        const repository = req.app.settings.repository;
        repository.deleteGame(gameid, (game, err) => {
            if (err) {
                returnError(404, 308, err, res, next);
            } else {
                res.json(game);
                next();
            }
        });

    });

    /**
     * @swagger
     * /api/games/{gameid}:
     *   patch:
     *     summary: Update choosen game.
     *     description: Update choosen game.
     *     parameters:
     *       - in: path
     *         name: gameid
     *         required: true
     *         description: Numeric ID of the game to update.
     *         schema:
     *           type: integer
     *     requestBody:
     *       description: Game info.
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - state
     *             properties:
     *               state:
     *                 type: string
     *                 description: new state.
     *                 example: success
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
     *       404:
     *         description: game id not found.
     */
    router.patch('/games/:gameid', protect_middleware('game.edit'), function (req, res, next) {
        const gameid = req.params.gameid;
        logger.debug(`Update game= ${gameid}`);

        const repository = req.app.settings.repository;
        repository.updateGame(gameid, req.fields, (game, err) => {
            if (err) {
                returnError(404, 204, err, res, next);
            } else {
                res.json(game);
                next();
            }
        });

    });

    // return router with all route
    return router;
};

