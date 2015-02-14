/*
 * (C) 2015 Seth Lakowske
 */

var  http = require('http');
var ecstatic = require('ecstatic');

var st     = ecstatic({
    root : __dirname,
    baseDir : '/',
})

http.createServer(function(req, res) {
    st(req, res);
}).listen(3000);
