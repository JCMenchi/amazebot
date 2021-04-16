'use strict';

class Repository {

    constructor() {
        this.playersid = 1;
        this.players = {};
        this.bots = {};
    }

    getPlayers() {
        return this.players;
    }
    
    getPlayer(playerid) {
        return null;
    }

    addPlayer(name) {
        return null;
    }

    getBot(playerid, botid) {
        return null;
    }

    getBots() {
        return this.bots;
    }
}

module.exports = { Repository };