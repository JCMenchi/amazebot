/* jshint esversion: 6 */

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


describe('Backend REST API', function () {
    let HTTPServer;
    
    before(() => {
        // start server
        HTTPServer = startServer(8081);
    });

    describe('navigation method', function () {
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
    });

    after(() => {
        // stop server
        HTTPServer.close();
    });
});
