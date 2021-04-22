'use strict';

const express = require('express');
const router = express.Router();

// initialize logger
const log4js = require('log4js');
const logger = log4js.getLogger('playermgr');

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
 * @param {express.Response<any, number>} res - expressjs Response object
 * @param {express.NextFunction} next - expressjs next callback
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
 * /api/players:
 *   get:
 *     summary: Return list of player.
 *     description: Return list of player.
 *     responses:
 *       200:
 *         description: list of player.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The player ID.
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: Player name.
 *                     example: John
 *                   bots:
 *                     type: array
 *                     items:
 *                       type: integer
 *                     description: Player bot list
 *                     example: [1, 2]
 */
router.get('/players', function (req, res, next) {
    const repository = req.app.settings.repository;
    repository.getPlayers((players, err) => {
        /* istanbul ignore if */
        if (err) {
            returnError(404, 101, err, res, next);
        } else {
            const playerList = [];
            for (const p in players) {
                playerList.push({ id: players[p].id, name: players[p].name });
            }
            res.json(playerList);
            next();
        }
    });
});

/**
 * @swagger
 * /api/players/{playerid}:
 *   get:
 *     summary: Return choosen player.
 *     description: Return choosen player.
 *     parameters:
 *       - in: path
 *         name: playerid
 *         required: true
 *         description: Numeric ID of the player to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: player.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The maze ID.
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: Maze name.
 *                   example: Simple Maze
 *                 bots:
 *                   type: array
 *                   items: 
 *                     type: integer
 *                   description: Player bot list
 *                   example: [1, 2]
 *       404:
 *         description: player id not found.
 */
router.get('/players/:playerid', function (req, res, next) {
    const playerid = req.params.playerid;
    logger.debug(`Get player= ${playerid}`);

    const repository = req.app.settings.repository;
    repository.getPlayer(playerid, (player, err) => {
        if (err) {
            returnError(404, 102, err, res, next);
        } else {
            res.json(player);
            next();
        }
    });

});

/**
 * @swagger
 * /api/players/{playerid}:
 *   patch:
 *     summary: Update choosen player.
 *     description: Update choosen player.
 *     parameters:
 *       - in: path
 *         name: playerid
 *         required: true
 *         description: Numeric ID of the player to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Player info.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: new name.
 *                 example: John
 *     responses:
 *       200:
 *         description: player.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The player ID.
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: Player name.
 *                   example: John
 *       404:
 *         description: player id not found.
 */
router.patch('/players/:playerid', function (req, res, next) {
    const playerid = req.params.playerid;
    logger.debug(`Update player= ${playerid}`);

    const repository = req.app.settings.repository;
    repository.updatePlayer(playerid, req.fields, (player, err) => {
        if (err) {
            returnError(404, 103, err, res, next);
        } else {
            res.json(player);
            next();
        }
    });

});

/**
 * @swagger
 * /api/players/{playerid}:
 *   delete:
 *     summary: Delete player.
 *     description: Delete player.
 *     parameters:
 *       - in: path
 *         name: playerid
 *         required: true
 *         description: Numeric ID of the player to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: player deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The player ID.
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: player name.
 *       404:
 *         description: name already used.
 */
router.delete('/players/:playerid', function (req, res, next) {
    const playerid = req.params.playerid;
    logger.debug(`Delete player= ${playerid}`);

    const repository = req.app.settings.repository;
    repository.deletePlayer(playerid, (player, err) => {
        if (err) {
            returnError(404, 104, err, res, next);
        } else {
            res.json(player);
            next();
        }
    });

});

/**
 * @swagger
 * /api/players/{playerid}/bot/{botid}:
 *   get:
 *     summary: Return choosen bot for player {playerid}.
 *     description: Return choosen bot for player {playerid}.
 *     parameters:
 *       - in: path
 *         name: playerid
 *         required: true
 *         description: Numeric ID of the player to retrieve.
 *         schema:
 *           type: integer
 *       - in: path
 *         name: botid
 *         required: true
 *         description: Numeric ID of the bot to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: player.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The BOT ID.
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: Bot name.
 *                   example: Simple Bot
 *                 url:
 *                   type: string
 *                   description: URL to get bot code
 *                   example: bots/bot1.js
 *       404:
 *         description: player id or bot id not found.
 */
router.get('/players/:playerid/bot/:botid', function (req, res, next) {
    const playerid = req.params.playerid;
    const botid = Number(req.params.botid);
    logger.debug(`Get Bot player=${playerid} bot=${botid}`);

    const repository = req.app.settings.repository;
    repository.getBot(playerid, botid, (bot, err) => {
        if (err) {
            returnError(404, 105, err, res, next);
        } else {
            res.json(bot);
            next();
        }
    });
    
});

/**
 * @swagger
 * /api/players/{playerid}/bot/{botid}:
 *   patch:
 *     summary: Update choosen bot.
 *     description: Update choosen bot.
 *     parameters:
 *       - in: path
 *         name: playerid
 *         required: true
 *         description: Numeric ID of the player owning the bot.
 *         schema:
 *           type: integer
 *       - in: path
 *         name: botid
 *         required: true
 *         description: Numeric ID of the bot to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Bot info.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: new name.
 *                 example: bot3
 *     responses:
 *       200:
 *         description: bot.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The bot ID.
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: Bot name.
 *                   example: bot1
 *                 url:
 *                   type: string
 *                   description: URL to get bot code
 *                   example: bots/bot1.js
 *       404:
 *         description: bot id not found.
 */
 router.patch('/players/:playerid/bot/:botid', function (req, res, next) {
    const playerid = req.params.playerid;
    const botid = Number(req.params.botid);
    logger.debug(`Get Bot player=${playerid} bot=${botid}`);

    const repository = req.app.settings.repository;
    repository.updateBot(playerid, botid, req.fields, (player, err) => {
        if (err) {
            returnError(404, 106, err, res, next);
        } else {
            res.json(player);
            next();
        }
    });

});

/**
 * @swagger
 * /api/players/{playerid}/bot/{botid}:
 *   delete:
 *     summary: Delete bot.
 *     description: Delete bot.
 *     parameters:
 *       - in: path
 *         name: playerid
 *         required: true
 *         description: Numeric ID of the player.
 *         schema:
 *           type: integer
 *       - in: path
 *         name: botid
 *         required: true
 *         description: Numeric ID of the bot to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: bot deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The player ID.
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: player name.
 *       404:
 *         description: bot does not exist.
 */
router.delete('/players/:playerid/bot/:botid', function (req, res, next) {
    const playerid = req.params.playerid;
    const botid = Number(req.params.botid);
    logger.debug(`Delete Bot player=${playerid} bot=${botid}`);

    const repository = req.app.settings.repository;
    repository.deleteBot(playerid, botid, (bot, err) => {
        if (err) {
            returnError(404, 107, err, res, next);
        } else {
            res.json(bot);
            next();
        }
    });
    
});

/**
 * @swagger
 * /api/players:
 *   post:
 *     summary: Create player.
 *     description: Create player.
 *     requestBody:
 *       description: Player info.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The player name.
 *                 example: John
 *     responses:
 *       201:
 *         description: new player created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The player ID.
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: player name.
 *       404:
 *         description: name already used.
 */
router.post('/players', function (req, res, next) {

    const name = req.fields.name;

    const repository = req.app.settings.repository;
    repository.addPlayer(name, (player, err) => {
        if (err) {
            returnError(404, 108, err, res, next);
        } else {
            res.status(201).json({id: player.id, name: player.name});
            next();
        }
    });
});

/**
 * @swagger
 * /api/players/{playerid}/bot:
 *   post:
 *     summary: Create bot.
 *     description: Create bot.
 *     parameters:
 *       - in: path
 *         name: playerid
 *         required: true
 *         description: Numeric ID of the player.
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Bot info.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The bot name.
 *                 example: Bot1
 *               url:
 *                 type: string
 *                 description: The bot url.
 *                 example: data/bot1.js
 *     responses:
 *       201:
 *         description: new bot created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The bot ID.
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: bot name.
 *       404:
 *         description: name already used.
 */
 router.post('/players/:playerid/bot', function (req, res, next) {
    const playerid = req.params.playerid;
    const url = req.fields.url;
    const name = req.fields.name;

    const repository = req.app.settings.repository;
    repository.addBot(playerid, name, url, (bot, err) => {
        if (err) {
            returnError(404, 109, err, res, next);
        } else {
            res.status(201).json(bot);
            next();
        }
    });
});

module.exports = { router };
