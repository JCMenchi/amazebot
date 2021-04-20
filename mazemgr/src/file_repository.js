'use strict';

// initialize logger
const log4js = require('log4js');
const logger = log4js.getLogger('Mazemgr');

const fs = require('fs');

class FileRepository {

    constructor() {
        this.mazeid = 1;
        this.mazes = {};
        this.loadData('./data/data.json');
    }

    loadData(dataFile) {
        /* istanbul ignore else */
        if (fs.existsSync(dataFile)) {
            logger.info(`Read sample config: ${dataFile}`);
            try {
                const readdata = fs.readFileSync(dataFile, 'utf8');
                const conf = JSON.parse(readdata);
                this.mazes = conf.mazes;
                this.mazeid = 10;
            } catch (error) {
                /* istanbul ignore next */
                logger.error(`Cannot read sample config: ${dataFile}: ${error.message}`);
            }
        }
    }

    getMazes(cb) {
        cb(this.mazes);
    }

    getMaze(mazeid, cb) {
        if (this.mazes[mazeid]) {
            cb(this.mazes[mazeid]);
        }
        cb(null, `Maze ${mazeid} does not exist.`);
    }

    addMaze(name, cb) {
        // check if name exists
        const p = Object.values(this.mazes).filter(i => i.name === name);
        if (p.length > 0) {
            cb(null, 'Maze with same name exists.');
            return;
        }
        // create Maze
        this.mazeid = this.mazeid + 1;
        this.mazes[this.mazeid] = {
            id: this.mazeid,
            name: name
        };

        cb(this.mazes[this.mazeid]);
    }

    updateMaze(mazeid, fields, cb) {
        if (this.mazes[mazeid]) {
            for(const k in fields) {
                /* istanbul ignore else */
                if (Object.keys(this.mazes[mazeid]).includes(k)) {
                    this.mazes[mazeid][k] = fields[k];
                }
            }
            cb(this.mazes[mazeid]);
        }
        cb(null, `Maze ${mazeid} does not exist.`);
    }

    deleteMaze(mazeid, cb) {
        if (this.mazes[mazeid]) {
            const m = this.mazes[mazeid];
            delete this.mazes[mazeid];
            cb(m);
        }
        cb(null, `Maze ${mazeid} does not exist.`);
    }
}

module.exports = { FileRepository };