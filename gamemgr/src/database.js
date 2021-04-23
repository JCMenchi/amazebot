"use strict";

// initialize logger
const log4js = require('log4js');
const logger = log4js.getLogger('gamemgr');

const { Pool } = require('pg');

const GAMEDB_SCHEMA = `
    CREATE TABLE IF NOT EXISTS property
    (
        name varchar(64) UNIQUE NOT NULL,
        value varchar(1024),
        PRIMARY KEY (name)
    );

    CREATE SEQUENCE game_serial_id START 1;
    CREATE TABLE IF NOT EXISTS game
    (
        gid integer NOT NULL DEFAULT nextval('game_serial_id'),
        playerid integer NOT NULL,
        botid integer NOT NULL,
        mazeid integer NOT NULL,
        state varchar(64) NOT NULL DEFAULT 'init',
        steps integer DEFAULT 0,
        boturl varchar(1024) NOT NULL,
        maze_configuration json,
        PRIMARY KEY (gid)
    );

    INSERT INTO property(name, value) VALUES ('description', 'Game Database'),
                                             ('version', '1.0'),
                                             ('creation_date', '${new Date().toISOString()}');
`;

const GAME_FIELDS = ['playerid', 'botid', 'mazeid', 'state', 'steps', 'boturl', 'maze_configuration'];

class DBRepository {

    constructor(user, password) {
        this.pool = new Pool({
            user: user,
            host: 'pgsql',
            database: 'gamedb',
            password: password,
            port: 5432,
        });
        
        // the pool will emit an error on behalf of any idle clients
        // it contains if a backend error or network partition happens
        this.pool.on('error', (err, client) => {
            logger.error('Unexpected error on idle database client', err);
        });
        
        this.pool.on('connect', (client) => {
            logger.info('PG connect client');
        });
        
        this.pool.on('acquire', (client) => {
            logger.info('PG acquire client');
        });
        
        this.pool.on('remove', (client) => {
            logger.info('PG remove client');
        });

        this.init();
    }

    init() {
        this.pool.query('SELECT value FROM property WHERE name = $1', ['version'], (err, res) => {
            if (err) {
                if (err.code === '42P01') {
                    // table does not exist, database must be created
                    this.createDatabase();
                } else {
                    logger.error(err.message);
                }
            } else {
                if (res.rowCount === 1) {
                    if (res.rows[0].value !== '1.0') {
                        logger.error('Bad database version.');     
                    } else {
                        logger.info('Correct database version.');
                    }
                } else {
                    this.createDatabase();
                }
            }
        });
    }

    createDatabase() {
        logger.info('Create gamedb schema.');
        this.pool.query(GAMEDB_SCHEMA, [], (err, res) => {
            if (err) {
                console.log(err.stack);
            } else {
                console.log(res);
            }
        });
    }

    getGames(cb) {
        this.pool.query('SELECT * FROM game', [], (err, res) => {
            if (err) {
                console.log(err.stack);
                cb(null, `getGames: database error: ${err.message}`);
            } else {
                const games = [];
                for(const rec of res.rows) {
                    games.push({
                        id: rec['gid'], playerid: rec.playerid, botid: rec.botid,
                        mazeid: rec.mazeid, state: rec.state, steps: rec.steps, botURL: rec.boturl,
                        mazeConfiguration: rec.maze_configuration
                    });
                }
                cb(games);
            }
        });
        
    }

    getGame(gameid, cb) {
        this.pool.query('SELECT * FROM game WHERE gid = $1', [gameid], (err, res) => {
            if (err) {
                console.log(err.stack);
                cb(null, `getGame: database error: ${err.message}`);
            } else {
                if (res.rowCount === 1) {
                    const rec = res.rows[0];
                    cb({id: rec['gid'], playerid: rec.playerid, botid: rec.botid,
                        mazeid: rec.mazeid, state: rec.state, steps: rec.steps, botURL: rec.boturl,
                        mazeConfiguration: rec.maze_configuration});
                } else {
                    cb(null, 'Game not found.');
                }
            }
        });
    }

    addGame(playerid, botid, mazeid, mazeConf, botURL, cb) {
        const params = [playerid, botid, mazeid, botURL, mazeConf];
        const field_names = 'playerid, botid, mazeid, boturl, maze_configuration';
        const field_index = '$1, $2, $3, $4, $5';
        const query = 'INSERT INTO game (' + field_names + ') VALUES (' + field_index + ') RETURNING *;';

        this.pool.query(query, params, (err, res) => {
            if (err) {
                console.log(err.stack);
                cb(null, `addGame: database error: ${err.message}`);
            } else {
                if (res.rowCount === 1) {
                    const rec = res.rows[0];
                    cb({id: rec['gid'], playerid: rec.playerid, botid: rec.botid,
                        mazeid: rec.mazeid, state: rec.state, steps: rec.steps, botURL: rec.boturl,
                        mazeConfiguration: rec.maze_configuration});
                } else {
                    cb(null, 'Cannot create game.');
                }
            }
        });
    }

    deleteGame(gameid, cb) {
        this.pool.query('DELETE FROM game WHERE gid = $1 RETURNING *;', [gameid], (err, res) => {
            if (err) {
                console.log(err.stack);
                cb(null, `deleteGame: database error: ${err.message}`);
            } else {
                if (res.rowCount === 1) {
                    const rec = res.rows[0];
                    cb({id: rec['gid'], playerid: rec.playerid, botid: rec.botid,
                        mazeid: rec.mazeid, state: rec.state, steps: rec.steps, botURL: rec.boturl,
                        mazeConfiguration: rec.maze_configuration});
                } else {
                    cb(null, `Game ${gameid} does not exist.`);
                }
            }
        });
    }

}

/* export functions */
module.exports = { DBRepository };