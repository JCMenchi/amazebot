"use strict";

// initialize logger
const log4js = require('log4js');
const logger = log4js.getLogger('playermgr');

const { Pool } = require('pg');


const PLAYERDB_SCHEMA = `
    CREATE TABLE IF NOT EXISTS property
    (
        name varchar(64) UNIQUE NOT NULL,
        value varchar(1024),
        PRIMARY KEY (name)
    );

    CREATE SEQUENCE player_serial_id START 1;
    CREATE TABLE IF NOT EXISTS player
    (
        pid integer NOT NULL DEFAULT nextval('player_serial_id'),
        name varchar(64) UNIQUE NOT NULL,
        PRIMARY KEY (pid)
    );

    CREATE SEQUENCE bot_serial_id START 1;
    CREATE TABLE IF NOT EXISTS bot
    (
        bid integer NOT NULL DEFAULT nextval('bot_serial_id'),
        name varchar(64) UNIQUE NOT NULL,
        url varchar(1024),
        player_id integer,
        filename varchar(1024),
        botcode text,
        PRIMARY KEY (bid),
        CONSTRAINT bot_uname UNIQUE (name, player_id),
        CONSTRAINT fk_pid FOREIGN KEY(player_id) 
	               REFERENCES player(pid)
                   ON DELETE CASCADE
    );

    INSERT INTO property(name, value) VALUES ('description', 'Player Database'),
                                             ('version', '1.0'),
                                             ('creation_date', '${new Date().toISOString()}');
`;

const PLAYER_FIELDS = ['name'];
const BOT_FIELDS = ['name', 'url'];

class DBRepository {

    constructor(user, password) {
        this.pool = new Pool({
            user: user,
            host: 'pgsql',
            database: 'playerdb',
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
        logger.info('Create playerdb schema.');
        this.pool.query(PLAYERDB_SCHEMA, [], (err, res) => {
            if (err) {
                console.log(err.stack);
            } else {
                console.log(res);
            }
        });
    }

    getPlayers(cb) {
        this.pool.query('SELECT * FROM player', [], (err, res) => {
            if (err) {
                console.log(err.stack);
                cb(null, `getPlayers: database error: ${err.message}`);
            } else {
                const players = [];
                for(const rec of res.rows) {
                    players.push({id: rec['pid'], name: rec.name});
                }
                cb(players);
            }
        });
        
    }

    getPlayer(playerid, cb) {
        this.pool.query('SELECT player.pid as pid, player.name as name, bot.bid as bid, bot.name as botname FROM player LEFT JOIN bot ON player.pid = bot.player_id WHERE player.pid = $1;',
                        [playerid], 
                        (err, res) => {
            if (err) {
                console.log(err.stack);
                cb(null, `getPlayer: database error: ${err.message}`);
            } else {
                if (res.rowCount > 0) {
                    const player = {
                        id: res.rows[0]['pid'],
                        name: res.rows[0]['name'],
                        bots: []
                    };
                    for(const rec of res.rows) {
                        if (rec['bid'] !== null) {
                            player.bots.push({id: rec['bid'], name: rec['botname']});
                        }
                    }
                    cb(player);
                } else {
                    cb(null, 'Player not found.');
                }
            }
        });
    }

    getPlayerFromName(playername, cb) {
        this.pool.query("SELECT pid, name FROM player WHERE name = $1;",
                        [playername], 
                        (err, res) => {
            if (err) {
                console.log(err.stack);
                cb(null, `getPlayerFromName: database error: ${err.message}`);
            } else {
                if (res.rowCount > 0) {
                    const player = {
                        id: res.rows[0]['pid'],
                        name: res.rows[0]['name']
                    };
                    cb(player);
                } else {
                    // player does not exists yet create it
                    this.addPlayer(playername, cb);
                }
            }
        });
    }

    addPlayer(name, cb) {
        this.pool.query('INSERT INTO player (name) VALUES ($1) RETURNING *;', [name], (err, res) => {
            if (err) {
                console.log(err.stack);
                cb(null, `addPlayer: database error: ${err.message}`);
            } else {
                if (res.rowCount === 1) {
                    cb({id: res.rows[0]['pid'], name: res.rows[0]['name']});
                } else {
                    cb(null, 'Cannot create player.');
                }
            }
        });
    }

    updatePlayer(playerid, fields, cb) {
        const params = [ playerid ];
        let query = 'UPDATE player SET';
        let idx = 2;
        for(const k in fields) {
            if (PLAYER_FIELDS.includes(k)) {
                query = query + ' ' + k + '=$' + idx + ',';
                idx = idx + 1;
                params.push(fields[k]);
            }
        }
        // remove last comma
        query = query.substring(0, query.length - 1);

        query = query + ' WHERE pid = $1 RETURNING *;';
        if (params.length > 1) {
            this.pool.query(query, params, (err, res) => {
                if (err) {
                    console.log(err.stack);
                    cb(null, `updatePlayer: database error: ${err.message}`);
                } else {
                    if (res.rowCount === 1) {
                        cb({id: res.rows[0]['pid'], name: res.rows[0]['name']});
                    } else {
                        cb(null, `Player ${playerid} does not exist.`);
                    }
                }
            });
        } else {
            cb(null, `updatePlayer: nothing to update.`);
        }
    }

    deletePlayer(playerid, cb) {
        this.pool.query('DELETE FROM player WHERE pid = $1 RETURNING *;', [playerid], (err, res) => {
            if (err) {
                console.log(err.stack);
                cb(null, `deletePlayer: database error: ${err.message}`);
            } else {
                if (res.rowCount === 1) {
                    cb({id: res.rows[0]['pid'], name: res.rows[0]['name']});
                } else {
                    cb(null, `Player ${playerid} does not exist.`);
                }
            }
        });
    }

    addBot(playerid, name, url, filename, botcode, cb) {
        this.pool.query('INSERT INTO bot (name, url, filename, botcode, player_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;', 
                        [name, url, filename, botcode, playerid], (err, res) => {
            if (err) {
                console.log(err.stack);
                cb(null, `addBot: database error: ${err.message}`);
            } else {
                if (res.rowCount === 1) {
                    cb({id: res.rows[0]['bid'], name: res.rows[0]['name'], 
                        player_id: res.rows[0]['player_id'], bid: res.rows[0]['bid'],
                        filename: res.rows[0]['filename']
                    });
                } else {
                    cb(null, 'Cannot create bot.');
                }
            }
        });
    }

    getBot(playerid, botid, cb) {

        this.pool.query('SELECT bot.bid, bot.name as name, bot.url as url, bot.filename as filename, player_id, player.name as player_name FROM bot, player WHERE bid = $1 AND player_id = $2 AND player_id = player.pid', [botid, playerid], (err, res) => {
            if (err) {
                console.log(err.stack);
                cb(null, `getBot: database error: ${err.message}`);
            } else {
                if (res.rowCount === 1) {
                    const rec = res.rows[0];
                    const b = {
                        id: rec['bid'], 
                        name: rec['name'], 
                        player_id: rec['player_id'],
                        player_name: rec['player_name']
                    };
                    if (rec['url']) {
                        b.url = rec['url'];
                    }
                    if (rec['filename']) {
                        b.filename = rec['filename'];
                    }
                    cb(b);
                } else {
                    cb(null, 'Bot not found.');
                }
            }
        });

        return null;
    }

    getBotCode(playerid, botid, cb) {

        this.pool.query('SELECT bot.botcode as botcode FROM bot, player WHERE bid = $1 AND player_id = $2 AND player_id = player.pid', [botid, playerid], (err, res) => {
            if (err) {
                console.log(err.stack);
                cb(null, `getBot: database error: ${err.message}`);
            } else {
                if (res.rowCount === 1) {
                    const rec = res.rows[0];
                    const b = {
                        id: rec['bid'], 
                        botcode: rec['botcode']
                    };
                    cb(b);
                } else {
                    cb(null, 'Bot not found.');
                }
            }
        });

        return null;
    }


    getBots(playerid, cb) {

        this.pool.query('SELECT bot.bid as bid, bot.name as name, bot.url as url, bot.filename as filename, player_id, player.name as player_name FROM bot, player WHERE player_id = $1 AND player_id = player.pid', [playerid], (err, res) => {
            if (err) {
                console.log(err.stack);
                cb(null, `getBot: database error: ${err.message}`);
            } else {
                if (res.rowCount > 0) {
                    const bots = [];
                    for(const rec of res.rows) {
                        bots.push({id: rec['bid'], name: rec.name, url: rec['url'], filename: rec['filename']});
                    }
                    cb(bots);
                } else {
                    cb(null, 'Bot not found.');
                }
            }
        });

        return null;
    }

    updateBot(playerid, botid, fields, cb) {
        const params = [ playerid, botid ];
        let query = 'UPDATE bot SET';
        let idx = 3;
        for(const k in fields) {
            if (BOT_FIELDS.includes(k)) {
                query = query + ' ' + k + '=$' + idx + ',';
                idx = idx + 1;
                params.push(fields[k]);
            }
        }
        // remove last comma
        query = query.substring(0, query.length - 1);

        query = query + ' WHERE player_id = $1 AND bid = $2 RETURNING *;';
        if (params.length > 1) {
            this.pool.query(query, params, (err, res) => {
                if (err) {
                    console.log(err.stack);
                    cb(null, `updateBot: database error: ${err.message}`);
                } else {
                    if (res.rowCount === 1) {
                        cb({id: res.rows[0]['bid'], name: res.rows[0]['name'], filename: res.rows[0]['filename'], url: res.rows[0]['url'], player_id: res.rows[0]['player_id']});
                    } else {
                        cb(null, `Bot not found for player ${playerid} does not exist.`);
                    }
                }
            });
        } else {
            cb(null, `updateBot: nothing to update.`);
        }
    }

    deleteBot(playerid, botid, cb) {

        this.pool.query('DELETE FROM bot WHERE bid = $1 AND player_id = $2 RETURNING *;', [botid, playerid], (err, res) => {
            if (err) {
                console.log(err.stack);
                cb(null, `deleteBot: database error: ${err.message}`);
            } else {
                if (res.rowCount === 1) {
                    cb({id: res.rows[0]['bid'], name: res.rows[0]['name'], player_id: res.rows[0]['player_id']});
                } else {
                    cb(null, 'Bot not found.');
                }
            }
        });

        return null;
    }

}

/* export functions */
module.exports = { DBRepository };