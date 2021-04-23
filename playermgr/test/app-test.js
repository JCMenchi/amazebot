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

const { app, startServer } = require('../src/playermgr.js');
const { FileRepository } = require('../src/file_repository.js');
const fr = new FileRepository();
app.set('repository', fr);

describe('Player Manager REST API', function () {
    let HTTPServer;
    
    before(() => {
        // start server
        HTTPServer = startServer(0);
    });

    describe('navigation method', function () {
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

        it("should return player list", (done) => {
            chai.request(app)
                .get('/api/players')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });
        it("should return player 2", (done) => {
            chai.request(app)
                .get('/api/players/2')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
        it("should return player 1 bot 1", (done) => {
            chai.request(app)
                .get('/api/players/1/bot/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
        it("should be able to add player foo", (done) => {
            chai.request(app)
                .post('/api/players')
                .send({name: 'foo'})
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    done();
                });
        });
        it("should be able to update player 1", (done) => {
            chai.request(app)
                .patch('/api/players/1')
                .send({name: 'foo'})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
        it("should be able to add bot to player 2", (done) => {
            chai.request(app)
                .post('/api/players/2/bot')
                .send({name: 'bar', url: '/data/bar.js'})
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    done();
                });
        });
        it("should be able to update bot 2 of player 1", (done) => {
            chai.request(app)
                .patch('/api/players/1/bot/2')
                .send({name: 'bar'})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
        it("should be able to delete player 2", (done) => {
            chai.request(app)
                .delete('/api/players/2')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
        it("should be able to delete bot 1 of player 1", (done) => {
            chai.request(app)
                .delete('/api/players/1/bot/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
        
    });

    describe('check error message', function () {
        this.timeout(2000);
        it("should check if player exists", (done) => {
            chai.request(app)
                .get('/api/players/5')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.error.should.eql(102);
                    done();
                });
        });
        it("cannot add player with existing name.", (done) => {
            chai.request(app)
                .post('/api/players')
                .send({name: 'William'})
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    done();
                });
        });
        it("should tell that bot does not exist.", (done) => {
            chai.request(app)
                .get('/api/players/1/bot/5')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.error.should.eql(105);
                    done();
                });
        });
        it("should tell that player to be patched does not exist.", (done) => {
            chai.request(app)
                .patch('/api/players/1234')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.error.should.eql(103);
                    done();
                });
        });
        it("should tell that player to be deleted does not exist.", (done) => {
            chai.request(app)
                .delete('/api/players/1234')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.error.should.eql(104);
                    done();
                });
        });
        it("should tell that bot to be deleted does not exist.", (done) => {
            chai.request(app)
                .delete('/api/players/1/bot/12')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.error.should.eql(107);
                    done();
                });
        });
        it("should tell that player does not exists when adding bot", (done) => {
            chai.request(app)
                .post('/api/players/234/bot')
                .send({name: 'bar', url: '/data/bar.js'})
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    done();
                });
        });
        it("should tell that player of bot to be patched does not exist.", (done) => {
            chai.request(app)
                .patch('/api/players/1234/bot/1234')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.error.should.eql(106);
                    done();
                });
        });
        it("should tell that bot to be patched does not exist.", (done) => {
            chai.request(app)
                .patch('/api/players/1/bot/1234')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.error.should.eql(106);
                    done();
                });
        });
    });

    after(() => {
        // stop server
        HTTPServer.close();
    });
});
