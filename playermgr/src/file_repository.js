'use strict';

// initialize logger
const log4js = require('log4js');
const logger = log4js.getLogger('playermgr');

const fs = require('fs');

class FileRepository {

    constructor() {
        this.playersid = 1;
        this.botid = 1;
        this.players = {};
        this.bots = {};
        this.loadData('./data/data.json');
    }

    loadData(dataFile) {
        /* istanbul ignore else */
        if (fs.existsSync(dataFile)) {
            logger.info(`Read sample config: ${dataFile}`);
            try {
                const readdata = fs.readFileSync(dataFile, 'utf8');
                const conf = JSON.parse(readdata);
                this.players = conf.players;
                this.bots = conf.bots;
                this.playersid = 10;
                this.botid = 10;
            } catch (error) {
                /* istanbul ignore next */
                logger.error(`Cannot read sample config: ${dataFile}: ${error.message}`);
            }
        }
    }

    getPlayers(cb) {
        cb(this.players);
    }

    getPlayer(playerid, cb) {
        if (this.players[playerid]) {
            cb(this.players[playerid]);
        } else {
            cb(null, `Player ${playerid} does not exist.`);
        }
    }

    addPlayer(name, cb) {
        // check if name exists
        const p = Object.values(this.players).filter(i => i.name === name);
        if (p.length > 0) {
            cb(null, 'Player with same nam exists.');
            return;
        }
        // create player
        this.playersid = this.playersid + 1;
        this.players[this.playerid] = {
            id: this.playerid,
            name: name
        };

        cb(this.players[this.playerid]);
    }

    updatePlayer(playerid, fields, cb) {
        if (this.players[playerid]) {
            for(const k in fields) {
                /* istanbul ignore else */
                if (Object.keys(this.players[playerid]).includes(k)) {
                    this.players[playerid][k] = fields[k];
                }
            }
            cb(this.players[playerid]);
        } else {
            cb(null, `Player ${playerid} does not exist.`);
        }
    }

    deletePlayer(playerid, cb) {
        if (this.players[playerid]) {
            const p = this.players[playerid];
            delete this.players[playerid];
            // update bot list
            for(const b of p.bots) {
                if (this.bots[b]) {
                    delete this.bots[b];
                }
            }
            cb(p);
        } else {
            cb(null, `Player ${playerid} does not exist.`);
        }
    }

    getBot(playerid, botid, cb) {
        /* istanbul ignore else */
        if (this.players[playerid]) {
            if (this.players[playerid].bots.includes(botid)) {
                /* istanbul ignore else */
                if (this.bots[botid]) {
                    cb(this.bots[botid]);
                } else {
                    cb(null, `Bot ${botid} does not exist.`);
                }
            } else {
                cb(null, `Bot ${botid} does not belong to player ${playerid}.`);
            }
        } else {
            cb(null, `Player ${playerid} does not exist.`);
        }
    }

    addBot(playerid, name, url, cb) {
        if (this.players[playerid]) {
            this.botid = this.botid + 1;
            this.bots[this.botid] = {
                id: this.botid,
                name: name,
                url: url
            };
            this.players[playerid].bots.push(this.botid);
            cb(this.bots[this.botid]);
        } else {
            cb(null, `Cannot add bot; player ${playerid} does not exist.`);
        }
    }

    updateBot(playerid, botid, fields, cb) {
        if (this.players[playerid]) {
            /* istanbul ignore else */
            if (this.players[playerid].bots.includes(botid)) {
                const bot = this.bots[botid];
                for(const k in fields) {
                    /* istanbul ignore else */
                    if (Object.keys(bot).includes(k)) {
                        bot[k] = fields[k];
                    }
                }
                cb(bot);
            } else {
                cb(null, `Bot ${botid} does not belong to player ${playerid}.`);
            }
        } else {
            cb(null, `Bot ${botid} of player ${playerid} does not exist.`);
        }
    }

    deleteBot(playerid, botid, cb) {
        /* istanbul ignore else */
        if (this.players[playerid]) {
            if (this.players[playerid].bots.includes(botid)) {
                /* istanbul ignore else */
                if (this.bots[botid]) {
                    const b = this.bots[botid];
                    delete this.bots[botid];
                    this.players[playerid].bots = this.players[playerid].bots.filter(i => i !== botid);
                    cb(b);
                } else {
                    // cleanup bot list
                    this.players[playerid].bots = this.players[playerid].bots.filter(i => i !== botid);
                }
            } else {
                cb(null, `Bot ${botid} does not belong to player ${playerid}.`);
            }
        } else {
            cb(null, `Bot ${botid} does not exist for player ${playerid}.`);
        }
    }
}

module.exports = { FileRepository };