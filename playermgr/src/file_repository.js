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
        }
        cb(null, `Player ${playerid} does not exist.`);
    }

    addPlayer(name, cb) {
        this.playersid = this.playersid + 1;
        this.players[this.playerid] = {
            id: this.playerid,
            name: name
        };

        cb(this.players[this.playerid]);
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
        }
        cb(null, `Player ${playerid} does not exist.`);
    }

    getBot(playerid, botid, cb) {

        if (this.players[playerid]) {
            if (this.players[playerid].bots.includes(botid)) {
                if (this.bots[botid]) {
                    cb(this.bots[botid]);
                }
            }
        }

        cb(null, `Bot ${botid} does not exist for player ${playerid}.`);
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
        }

        cb(null, `Cannot add bot; player ${playerid} does not exist.`);
    }

    deleteBot(playerid, botid, cb) {

        if (this.players[playerid]) {
            if (this.players[playerid].bots.includes(botid)) {
                if (this.bots[botid]) {
                    const b = this.bots[botid];
                    delete this.bots[botid];
                    this.players[playerid].bots = this.players[playerid].bots.filter(i => i !== botid);
                    cb(b);
                } else {
                    // cleanup bot list
                    this.players[playerid].bots = this.players[playerid].bots.filter(i => i !== botid);
                }
            }
        }

        cb(null, `Bot ${botid} does not exist for player ${playerid}.`);
    }
}

module.exports = { FileRepository };