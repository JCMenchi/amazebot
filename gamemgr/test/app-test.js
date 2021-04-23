/* jshint esversion: 6 */
process.env.NODE_ENV = 'test';

const chai = require('chai');
chai.use(require('chai-fs'));
const fs = require('fs');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

/*
 * initialize logger
 */
const log4js = require('log4js');

if (process.env.LOG4JS_CONFIG === undefined) {
    if (fs.existsSync('./log4js.json')) {
        log4js.configure('./log4js.json');
    } else {
        log4js.configure({
            appenders: { out: { type: 'console' } },
            categories: {
                default: { appenders: ['out'], level: 'info' }
            }
        });
    }
}
const logger = log4js.getLogger('unittest');

const rungame = require('../src/engine');
const { app, startServer } = require('../src/gamemgr');
const { initService } = require('../src/service');

const { FileRepository } = require('../src/file_repository.js');
const { expect } = require('chai');
const fr = new FileRepository();
app.set('repository', fr);

describe('Game Manager REST API', function () {
    let HTTPServer;
    
    before(() => {
        initService('http://127.0.0.1:8081/api', 'http://127.0.0.1:8082/api');
        // start server
        HTTPServer = startServer(0);
    });

    describe('get status', function () {
        this.timeout(2000);
        it("should return info", (done) => {
            chai.request(app)
                .get('/info')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys(['state']);
                    done();
                });
        });
        it("should return game list", (done) => {
            chai.request(app)
                .get('/api/games')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });
        it("should return game 2", (done) => {
            chai.request(app)
                .get('/api/games/2')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
        it("should be able to update game 2", (done) => {
            chai.request(app)
                .patch('/api/games/2')
                .send({state: 'success'})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
        it("can run a game", (done) => {
            chai.request(app)
                .post('/api/games/1/start')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
        it("can create a game", (done) => {
            chai.request(app)
                .post('/api/games')
                .send({'playerid' : 1, 'botid': 1, 'mazeid': 1})
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    done();
                });
        });
        it("can delete a game", (done) => {
            chai.request(app)
                .delete('/api/games/4')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    describe('check error', function () {
        this.timeout(2000);
        it("should check if game exist", (done) => {
            chai.request(app)
                .get('/api/games/5345')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    done();
                });
        });
        it("do run a game twice", (done) => {
            chai.request(app)
                .post('/api/games/3/start')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    done();
                });
        });
        it("should tell if game to be updated exists", (done) => {
            chai.request(app)
                .patch('/api/games/234')
                .send({name: 'success'})
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    done();
                });
        });
        it("do run not existing game", (done) => {
            chai.request(app)
                .post('/api/games/123456/start')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    done();
                });
        });
        it("cannot create a game from bad player id", (done) => {
            chai.request(app)
                .post('/api/games')
                .send({'playerid' : 12345, 'botid': 1, 'mazeid': 1})
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    done();
                });
        });
        it("cannot create a game from bad maze id", (done) => {
            chai.request(app)
                .post('/api/games')
                .send({'playerid' : 1, 'botid': 1, 'mazeid': 12345})
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    done();
                });
        });
        it("should check if game to be deleted exists", (done) => {
            chai.request(app)
                .delete('/api/games/3456')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    describe('test engine', function () {
        this.timeout(2000);
        it("can run a game", (done) => {
            const game = {
                id: 1,
                player: 1,
                bot: 1,
                botURL: 'http://localhost:8081/api/data/bots/bot1.js',
                mazeConfiguration: {
                    maze: [
                        "+0+1+2+3+",
                        "0 | | | |",
                        "+-+-+-+-+",
                        "x     | |",
                        "+-+-+ +-+",
                        "2 | |   X",
                        "+-+-+-+-+",
                        "3 | | | |",
                        "+-+-+-+-+"
                    ],
                    entry: {
                        r: 1,
                        c: -1
                    },
                    exit: {
                        r: 1,
                        c: 4
                    }
                }
            };

            rungame(game, (code, result) => {
                expect(code).to.equal(0);
                done();
            });
        });

        it("check if bot exist before running", (done) => {
            const game = {
                id: 1,
                player: 1,
                bot: 1,
                botURL: 'http://localhost:8081/api/data/bots/bot1234.js',
                mazeConfiguration: {
                    maze: [
                        "+0+1+2+3+",
                        "0 | | | |",
                        "+-+-+-+-+",
                        "x     | |",
                        "+-+-+ +-+",
                        "2 | |   X",
                        "+-+-+-+-+",
                        "3 | | | |",
                        "+-+-+-+-+"
                    ],
                    entry: {
                        r: 1,
                        c: -1
                    },
                    exit: {
                        r: 1,
                        c: 4
                    }
                }
            };

            rungame(game, (code, result) => {
                expect(code).to.equal(102);
                done();
            });
        });
        it("check if bot code can be executed before running", (done) => {
            const game = {
                id: 1,
                player: 1,
                bot: 1,
                botURL: 'http://localhost:8081/api/players',
                mazeConfiguration: {
                    maze: [
                        "+0+1+2+3+",
                        "0 | | | |",
                        "+-+-+-+-+",
                        "x     | |",
                        "+-+-+ +-+",
                        "2 | |   X",
                        "+-+-+-+-+",
                        "3 | | | |",
                        "+-+-+-+-+"
                    ],
                    entry: {
                        r: 1,
                        c: -1
                    },
                    exit: {
                        r: 1,
                        c: 4
                    }
                }
            };

            rungame(game, (code, result) => {
                expect(code).to.equal(101);
                done();
            });
        });
    });

    after(() => {
        // stop server
        HTTPServer.close();
    });
});
