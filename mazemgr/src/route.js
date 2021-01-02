
const express = require('express');
const router = express.Router();

// initialize logger
const log4js = require('log4js');
const logger = log4js.getLogger('mazemgr');

const fs = require('fs');

const mazes = loadData();

function loadData() {
    if (fs.existsSync('./data/data.json')) {
        logger.info('Read sample config: ./data/data.json');
        try {
            const readdata = fs.readFileSync('./data/data.json', "utf8");
            const conf = JSON.parse(readdata);
            return conf.mazes;
        } catch (error) {
            logger.error(`Cannot read sample config: ./data/data.json: ${error.message}`);
        }
    }
    return {};
}

/**
 * @swagger
 * /mazes:
 *   get:
 *     summary: Return list of maze.
 *     description: Return list of maze.
 *     responses:
 *       200:
 *         description: list of maze.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The maze ID.
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: Maze name.
 *                     example: Simple Maze
 *                   description:
 *                     type: string
 *                     description: Maze description.
 *                     example: Simple Maze
 */
router.get('/mazes', function (_req, res, next) {
    const mazeList = [];
    for (const m in mazes) {
        mazeList.push({ id: mazes[m].id, name: mazes[m].name });
    }
    res.json(mazeList);
    next();
});

/**
 * @swagger
 * /mazes/{mazeid}:
 *   get:
 *     summary: Return choosen maze.
 *     description: Return choosen maze.
 *     parameters:
 *       - in: path
 *         name: mazeid
 *         required: true
 *         description: Numeric ID of the maze to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: maze.
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
 *                 description:
 *                   type: string
 *                   description: Maze description.
 *                   example: Simple Maze
 *                 configuration:
 *                   type: array
 *                   items:
 *                     type: string   
 *                   description: Maze definition.
 *                 solution:
 *                   type: array
 *                   items:
 *                     type: string   
 *                   description: Maze solution.
 *       404:
 *         description: maze id not found.
 */
router.get('/mazes/:mazeid', function (req, res, next) {
    const mazeid = req.params.mazeid;
    logger.debug(`Get maze= ${mazeid}`);
    if (mazes[mazeid]) {
        res.json(mazes[mazeid]);
    } else {
        res.status(404);
        res.json({error: 1, message: `Maze id ${mazeid} not found.`});
    }
    next();
});

module.exports = { router };
