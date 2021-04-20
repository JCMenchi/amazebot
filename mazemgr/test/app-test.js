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

const { app, startServer } = require('../src/mazemgr.js');
const { FileRepository } = require('../src/file_repository.js');
const fr = new FileRepository();
app.set('repository', fr);

describe('Maze Manager REST API', function () {
    let HTTPServer;
    
    before(() => {
        // start server
        HTTPServer = startServer(0);
    });

    describe('get status', function () {
        this.timeout(10000);
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
        it("should return maze list", (done) => {
            chai.request(app)
                .get('/api/mazes')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });
        it("should return maze 2", (done) => {
            chai.request(app)
                .get('/api/mazes/2')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    describe('check error', function () {
        this.timeout(10000);
        it("should check if maze exist", (done) => {
            chai.request(app)
                .get('/api/mazes/5')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    after(() => {
        // stop server
        HTTPServer.close();
    });
});
