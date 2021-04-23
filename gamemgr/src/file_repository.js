'use strict';

// initialize logger
const log4js = require('log4js');
const logger = log4js.getLogger('Gamemgr');

const fs = require('fs');

class FileRepository {

    constructor() {
        this.gameid = 1;
        this.games = {};
        this.loadData('./data/data.json');
    }

    loadData(dataFile) {
        /* istanbul ignore else */
        if (fs.existsSync(dataFile)) {
            logger.info(`Read sample config: ${dataFile}`);
            try {
                const readdata = fs.readFileSync(dataFile, 'utf8');
                const conf = JSON.parse(readdata);
                this.games = conf.games;
                this.gameid = 10;
            } catch (error) {
                /* istanbul ignore next */
                logger.error(`Cannot read sample config: ${dataFile}: ${error.message}`);
            }
        }
    }

    getGames(cb) {
        cb(this.games);
    }

    getGame(gameid, cb) {
        if (this.games[gameid]) {
            cb(this.games[gameid]);
        } else {
            cb(null, `Game ${gameid} does not exist.`);
        }
    }

    addGame(playerid, botid, mazeid, mazeConf, botURL, cb) {
        // create Game
        this.gameid = this.gameid + 1;
        this.games[this.gameid] = {
            id: this.gameid,
            playerid: playerid,
            botid: botid,
            mazeid: mazeid,
            state: 'init',
            steps: 0,
            mazeConfiguration: mazeConf,
            botURL: botURL
        };
        
        cb(this.games[this.gameid]);
    }

    updateGame(gameid, fields, cb) {
        if (this.games[gameid]) {
            for(const k in fields) {
                /* istanbul ignore else */
                if (Object.keys(this.games[gameid]).includes(k)) {
                    this.games[gameid][k] = fields[k];
                }
            }
            cb(this.games[gameid]);
        } else {
            cb(null, `Game ${gameid} does not exist.`);
        }
    }

    deleteGame(gameid, cb) {
        if (this.games[gameid]) {
            const m = this.games[gameid];
            delete this.games[gameid];
            cb(m);
        } else {
            cb(null, `Game ${gameid} does not exist.`);
        }
    }
}

module.exports = { FileRepository };