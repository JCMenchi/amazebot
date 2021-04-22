"use strict";

// initialize logger
const log4js = require('log4js');
const logger = log4js.getLogger('mazemgr');

const { Pool } = require('pg');

const MAZEDB_SCHEMA = `
    CREATE TABLE IF NOT EXISTS property
    (
        name varchar(64) UNIQUE NOT NULL,
        value varchar(1024),
        PRIMARY KEY (name)
    );

    CREATE SEQUENCE maze_serial_id START 1;
    CREATE TABLE IF NOT EXISTS maze
    (
        mid integer NOT NULL DEFAULT nextval('maze_serial_id'),
        name varchar(64) UNIQUE NOT NULL,
        description varchar(1024),
        configuration json,
        solution json,
        PRIMARY KEY (mid)
    );

    INSERT INTO property(name, value) VALUES ('description', 'Maze Database'),
                                             ('version', '1.0'),
                                             ('creation_date', '${new Date().toISOString()}');
`;

const MAZE_FIELDS = ['name', 'description', 'configuration', 'solution'];

class DBRepository {

    constructor(user, password) {
        this.pool = new Pool({
            user: user,
            host: 'pgsql',
            database: 'mazedb',
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
        logger.info('Create mazedb schema.');
        this.pool.query(MAZEDB_SCHEMA, [], (err, res) => {
            if (err) {
                console.log(err.stack);
            } else {
                console.log(res);
            }
        });
    }

    getMazes(cb) {
        this.pool.query('SELECT * FROM maze', [], (err, res) => {
            if (err) {
                console.log(err.stack);
                cb(null, `getMazes: database error: ${err.message}`);
            } else {
                const mazes = [];
                for(const rec of res.rows) {
                    mazes.push({
                        id: rec['mid'], name: rec.name, description: rec.description,
                        configuration: rec.configuration, solution: rec.solution
                    });
                }
                cb(mazes);
            }
        });
        
    }

    getMaze(mazeid, cb) {
        this.pool.query('SELECT * FROM maze WHERE mid = $1', [mazeid], (err, res) => {
            if (err) {
                console.log(err.stack);
                cb(null, `getMaze: database error: ${err.message}`);
            } else {
                if (res.rowCount === 1) {
                    const rec = res.rows[0];
                    cb({id: rec['mid'], name: rec.name, description: rec.description,
                        configuration: rec.configuration, solution: rec.solution});
                } else {
                    cb(null, 'Maze not found.');
                }
            }
        });
    }

    addMaze(fields, cb) {
        const params = [ ];
        let field_names = '';
        let field_index = '';
        let idx = 1;
        for(const k in fields) {
            if (MAZE_FIELDS.includes(k)) {
                field_names = field_names + k + ',';
                field_index = field_index + '$' + idx + ',';
                idx = idx + 1;
                params.push(fields[k]);
            }
        }
        // remove last comma
        field_names = field_names.substring(0, field_names.length - 1);
        field_index = field_index.substring(0, field_index.length - 1);

        const query = 'INSERT INTO maze (' + field_names + ') VALUES (' + field_index + ') RETURNING *;';

        this.pool.query(query, params, (err, res) => {
            if (err) {
                console.log(err.stack);
                cb(null, `addMaze: database error: ${err.message}`);
            } else {
                if (res.rowCount === 1) {
                    const rec = res.rows[0];
                    cb({id: rec['mid'], name: rec.name, description: rec.description,
                        configuration: rec.configuration, solution: rec.solution});
                } else {
                    cb(null, 'Cannot create maze.');
                }
            }
        });
    }

    updateMaze(mazeid, fields, cb) {
        const params = [ mazeid ];
        let query = 'UPDATE maze SET';
        let idx = 2;
        for(const k in fields) {
            if (MAZE_FIELDS.includes(k)) {
                query = query + ' ' + k + '=$' + idx + ',';
                idx = idx + 1;
                params.push(fields[k]);
            }
        }
        // remove last comma
        query = query.substring(0, query.length - 1);

        query = query + ' WHERE mid = $1 RETURNING *;';
        if (params.length > 1) {
            this.pool.query(query, params, (err, res) => {
                if (err) {
                    console.log(err.stack);
                    cb(null, `updateMaze: database error: ${err.message}`);
                } else {
                    if (res.rowCount === 1) {
                        const rec = res.rows[0];
                        cb({id: rec['mid'], name: rec.name, description: rec.description,
                            configuration: rec.configuration, solution: rec.solution});
                    } else {
                        cb(null, `Maze ${mazeid} does not exist.`);
                    }
                }
            });
        } else {
            cb(null, `updateMaze: nothing to update.`);
        }
    }

    deleteMaze(mazeid, cb) {
        this.pool.query('DELETE FROM maze WHERE mid = $1 RETURNING *;', [mazeid], (err, res) => {
            if (err) {
                console.log(err.stack);
                cb(null, `deleteMaze: database error: ${err.message}`);
            } else {
                if (res.rowCount === 1) {
                    const rec = res.rows[0];
                    cb({id: rec['mid'], name: rec.name, description: rec.description,
                        configuration: rec.configuration, solution: rec.solution});
                } else {
                    cb(null, `Maze ${mazeid} does not exist.`);
                }
            }
        });
    }

}

/* export functions */
module.exports = { DBRepository };