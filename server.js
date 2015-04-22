/*
 * (C) 2015 Seth Lakowske
 */

var http          = require('http');
var ecstatic      = require('ecstatic');
var router        = require('routes')();
var methods       = require('http-methods');
var pgReqClassify = require('pg-http-request-classifier');
var pgReqLogger   = require('pg-http-request-logger');
var pg            = require('pg');
var JSONStream    = require('JSONStream');
var queryParse    = require('querystring').parse;
var url           = require('url');

var port       = parseInt(process.argv[2], 10);
var user       = process.env['USER'];
var connection = 'postgres://'+user+'@localhost/request';

//open the request db
function connectOrFail(callback) {

    var client = new pg.Client(connection);
    pg.connect(connection, function(err, client, done) {

        if (err) {
            console.error('error fetching client from pool', err);
            process.exit();
        }

        pgReqClassify.classTable(client, function(err, result) {
            if (err) {
                console.error('error while trying to create the classes table');
            } else {
                done();
                callback();
            }
        });

    })

}

function connectOrError(res, callback) {
    pg.connect(connection, function(err, client, done) {

        if (err) {
            res.write('Oops. Error while connecting to the database.\n');
            res.write(JSON.stringify(err) + '\n');
            res.end();
            done();
            return;
        }

        callback(client, done)
    })
}

//serve requests and classifications
function onConnection() {
    console.log('connected to ' + connection);

    var st     = ecstatic({
        root : __dirname,
        baseDir : '/',
    })

    router.addRoute('/classes', methods({

        POST: function(req, res, params, cb) {
            connectOrError(res, function(client, done) {

                function response(err, result, id) {
                    if (err) {
                        res.write(JSON.stringify(err));
                    } else {
                        res.write(JSON.stringify({class_id: id}));
                    }
                    res.end();
                    done();
                }

                var parseify = JSONStream.parse();
                req.pipe(parseify);
                parseify.on('data', function(clazz) {
                    pgReqClassify.insertClass(client, clazz, response);
                })
            })
        }

    }))

    router.addRoute('/users/:user_id/unclassified*?', function(req,res,params) {

        var count = queryParse(url.parse(req.url).query).count;

        if (count === undefined) {
            var count = 1;
        }

        connectOrError(res, function(client, done) {
            pgReqClassify.nextRequest(client, params.user_id, count, function(err, result) {
                res.write(JSON.stringify(result.rows))
                res.end();
                done();
            })
        })
    })

    router.addRoute('/requests', methods({
        POST: function(req, res, params, cb) {

            connectOrError(res, function(client, done) {
                function response(err, result, request_id) {
                    if (err) {
                        res.write(JSON.stringify(err))
                    }

                    if (result) {
                        res.write(JSON.stringify({request_id:request_id}));
                    }

                    res.end();
                    done();
                }

                var parseify = JSONStream.parse();
                req.pipe(parseify);
                parseify.on('data', function(clazz) {
                    pgReqLogger.insertRequest(client, clazz, response);
                })
            })
        }
    }))

    http.createServer(function(req, res) {
        var m = router.match(req.url);
        if (m) m.fn(req, res, m.params, function() {console.log('served')});
        else st(req, res);
    }).listen(port);

}

connectOrFail(onConnection);
