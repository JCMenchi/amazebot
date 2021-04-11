
const express = require('express');
const router = express.Router();

// initialize logger
const log4js = require('log4js');
const logger = log4js.getLogger('playermgr');

const fs = require('fs');

const { players, bots } = loadData();

function loadData() {
    if (fs.existsSync('./data/data.json')) {
        logger.info('Read sample config: ./data/data.json');
        try {
            const readdata = fs.readFileSync('./data/data.json', "utf8");
            const conf = JSON.parse(readdata);
            return { players: conf.players, bots: conf.bots };
        } catch (error) {
            logger.error(`Cannot read sample config: ./data/data.json: ${error.message}`);
        }
    }
    return {players:{}, bots: {}};
}

/**
 * @swagger
 * /players:
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
 */
router.get('/players', function (_req, res, next) {
    const playerList = [];
    for (const p in players) {
        playerList.push({ id: players[p].id, name: players[p].name });
    }
    res.json(playerList);
    next();
});

/**
 * @swagger
 * /players/{playerid}:
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
 *       404:
 *         description: player id not found.
 */
router.get('/players/:playerid', function (req, res, next) {
    const playerid = req.params.playerid;
    logger.debug(`Get player= ${playerid}`);
    if (players[playerid]) {
        res.json(players[playerid]);
    } else {
        res.status(404);
        res.json({error: 1, message: `Player id ${playerid} not found.`});
    }
    next();
});

/**
 * @swagger
 * /players/{playerid}/bot/{botid}:
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
    if (players[playerid]) {
        if (players[playerid].bots.includes(botid)) {
            if (bots[botid]) {
                res.json(bots[botid]);
            } else {
                // bot is in list but does not exists any more
                // cleanup and return an error
                players[playerid].bots = players[playerid].bots.filter(item => item !== botid);
                res.status(404);
                res.json({error: 1, message: `Bot id ${botid} of player ${playerid} does not exist any more.`});
            }
        } else {
            // check if bot exists at all
            if (bots[botid]) {
                res.status(404);
                res.json({error: 2, message: `Bot id ${botid} does not belong to player ${playerid}.`});
            } else {
                res.status(404);
                res.json({error: 3, message: `Bot id ${botid} does not exist.`});
            }
        }
    } else {
        res.status(404);
        res.json({error: 4, message: `Player id ${playerid} not found.`});
    }
    next();
});

module.exports = { router };
