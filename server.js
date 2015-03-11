/*
 * (C) 2015 Seth Lakowske
 */

var http       = require('http');
var ecstatic   = require('ecstatic');
var router     = require('routes')();
var logger     = require('http-request-logger');
var level      = require('level');
var JSONStream = require('JSONStream');

var port   = parseInt(process.argv[2], 10);

//open the request db
var db            = level('./classified.db');
var requestLogger = logger(db);
var sink          = requestLogger.push();

var st     = ecstatic({
    root : __dirname,
    baseDir : '/',
})

var parseify = JSONStream.parse();

router.addRoute('/classify', function(req, res, params) {
    req.pipe(parseify).pipe(sink);
})

http.createServer(function(req, res) {
    var m = router.match(req.url);
    if (m) m.fn(req, res, m.params);
    else st(req, res);
}).listen(port);
