'use strict';

// initialize logger
const log4js = require('log4js');
const logger = log4js.getLogger('gamemgr');

// init axios
const axios = require('axios');

let playermgr;
let mazemgr;

/**
 * Initialize axios instance to call service of Player Manager and Maze Manager.
 * 
 * @param {string} playermgrurl - Player Manager URL
 * @param {string} mazemgrurl - Maze Manager URL
 * 
 * @namespace ExtService
 */
function initService(playermgrurl, mazemgrurl) {

    playermgr = axios.create({
        timeout: 10000,
        headers: { 'content-type': 'application/json' },
        baseURL: playermgrurl
    });
    playermgr.interceptors.response.use(function (response) {
        logger.trace(`Result of PlayerManager(${response.config.url}): ${JSON.stringify(response.data)}`);
        return response;
    }, function (error) {
        /* istanbul ignore next */
        if (error.isAxiosError) {
            logger.error(`Error from PlayerManager(${error.config.url}): ${JSON.stringify(error.toJSON())}`);
        }
        return Promise.reject(error);
    });

    mazemgr = axios.create({
        timeout: 10000,
        headers: { 'content-type': 'application/json' },
        baseURL: mazemgrurl
    });
    mazemgr.interceptors.response.use(function (response) {
        logger.trace(`Result of MazeManager(${response.config.url}): ${JSON.stringify(response.data)}`);
        return response;
    }, function (error) {
        /* istanbul ignore next */
        if (error.isAxiosError) {
            logger.error(`Error from MazeManager(${error.config.url}): ${JSON.stringify(error.toJSON())}`);
        }
        return Promise.reject(error);
    });

}

/**
 * Get Bot definition from player.
 * 
 * @param {number} playerid - Player ID
 * @param {number} botid - Bot ID
 * @return {Promise}
 * 
 * @memberof ExtService
 */
function getBot(playerid, botid, token) {
    /* istanbul ignore next */
    if (token) {
        return playermgr.get(`/players/${playerid}/bot/${botid}`, { headers: { Authorization: token } });
    }
    return playermgr.get(`/players/${playerid}/bot/${botid}`);
}

/**
 * Get Maze definition.
 * 
 * @param {number} mazeid - maze ID
 * @return {Promise}
 * 
 * @memberof ExtService
 */
function getMaze(mazeid, token) {
    /* istanbul ignore next */
    if (token) {
        return mazemgr.get(`/mazes/${mazeid}`, { headers: { Authorization: token } });
    }
    return mazemgr.get(`/mazes/${mazeid}`);
}

/**
 * Calculate URL to load bot code.
 * 
 * @param {string} boturl - URL of bot javascript code
 * @return {string}
 * 
 * @memberof ExtService
 */
function getBotCode(game) {
    /* istanbul ignore else */
    if (game.botURL && game.botURL !== '') {
        /* istanbul ignore if */
        if (game.botURL.startsWith('http')) {
            return game.botURL;
        } else {
            return playermgr.defaults.baseURL + '/' + game.botURL;
        }
    } else {
        return playermgr.defaults.baseURL + '/players/' + game.playerid + '/bot/' + game.botid + '/code';
    }
}

module.exports = { initService, getBot, getMaze, getBotCode };
