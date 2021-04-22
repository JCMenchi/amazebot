
const express = require('express');
const router = express.Router();

// initialize logger
const log4js = require('log4js');
const logger = log4js.getLogger('mazemgr');

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
 * /api/mazes:
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
router.get('/mazes', function (req, res, next) {

    const repository = req.app.settings.repository;
    repository.getMazes((mazes, err) => {
        /* istanbul ignore if */
        if (err) {
            returnError(404, 201, err, res, next);
        } else {
            const mazeList = [];
            for (const m in mazes) {
                mazeList.push({ id: mazes[m].id, name: mazes[m].name, description: mazes[m].description });
            }
            res.json(mazeList);
            next();
        }
    });
});

/**
 * @swagger
 * /api/mazes/{mazeid}:
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

    const repository = req.app.settings.repository;
    repository.getMaze(mazeid, (maze, err) => {
        if (err) {
            returnError(404, 202, err, res, next);
        } else {
            res.json(maze);
            next();
        }
    });
});

/**
 * @swagger
 * /api/mazes:
 *   post:
 *     summary: Create maze.
 *     description: Create maze.
 *     requestBody:
 *       description: Maze info.
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
 *                 description: The maze name.
 *                 example: maze1
 *     responses:
 *       201:
 *         description: new maze created.
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
 *                   description: maze name.
 *                   example: maze1
 *       404:
 *         description: name already used.
 */
 router.post('/mazes', function (req, res, next) {

    const repository = req.app.settings.repository;
    repository.addMaze(req.fields, (maze, err) => {
        if (err) {
            returnError(404, 203, err, res, next);
        } else {
            res.status(201).json({id: maze.id, name: maze.name, description: maze.description});
            next();
        }
    });
});

/**
 * @swagger
 * /api/mazes/{mazeid}:
 *   patch:
 *     summary: Update choosen maze.
 *     description: Update choosen maze.
 *     parameters:
 *       - in: path
 *         name: mazeid
 *         required: true
 *         description: Numeric ID of the maze to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Maze info.
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
 *                 example: maze2
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
 *                   description: maze name.
 *                   example: maze1
 *       404:
 *         description: maze id not found.
 */
 router.patch('/mazes/:mazeid', function (req, res, next) {
    const mazeid = req.params.mazeid;
    logger.debug(`Update maze= ${mazeid}`);

    const repository = req.app.settings.repository;
    repository.updateMaze(mazeid, req.fields, (maze, err) => {
        if (err) {
            returnError(404, 204, err, res, next);
        } else {
            res.json(maze);
            next();
        }
    });

});

/**
 * @swagger
 * /api/mazes/{mazeid}:
 *   delete:
 *     summary: Delete maze.
 *     description: Delete maze.
 *     parameters:
 *       - in: path
 *         name: mazeid
 *         required: true
 *         description: Numeric ID of the maze to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: maze deleted.
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
 *                   description: maze name.
 *                   example: maze1
 *       404:
 *         description: name already used.
 */
router.delete('/mazes/:mazeid', function (req, res, next) {
    const mazeid = req.params.mazeid;
    logger.debug(`Delete maze= ${mazeid}`);

    const repository = req.app.settings.repository;
    repository.deleteMaze(mazeid, (maze, err) => {
        if (err) {
            returnError(404, 205, err, res, next);
        } else {
            res.json(maze);
            next();
        }
    });

});


module.exports = { router };
