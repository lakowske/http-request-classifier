/*
 * (C) 2015 Seth Lakowske
 */

var http       = require('http');
var JSONStream = require('JSONStream');

/*
 * requests unclassified requests
 */
function unclassified(options, user_id, callback) {
    options.path            = '/users/' + user_id + '/unclassified';
    options.method          = 'GET';
    options.withCredentials = false

    var result = ''
    var req = http.request(options, function(res) {

        res.on('data', function(data) {
            result += data;
        })

        res.on('end', function() {
            input = JSON.parse(result);
            callback(input);
        })

    })

    req.on('error', function(err) {
        console.log(err);
    })

    return req;

}

function classified(options, writeStream) {
    options.path            = '/classes';
    options.method          = 'GET';

    var parseify   = JSONStream.parse();

    var req = http.request(options, function(res) {
        res.pipe(parseify).pipe(writeStream);
    })

    req.on('error', function(err) {
        console.log(err);
    })

    return req;

}

function recv(options, callback) {
    var req = unclassified(options, options.username, callback);
    req.end();
}

function putRequests(options, onEnd) {
    var options = {
        path : '/classes',
        method : 'POST',
        withCredentials : false
    }

    var result = '';
    var req = http.request(options, function(res) {
        res.on('data', function(data) {
            result += data;
        })
        res.on('end', function() {
            onEnd(result);
        })
    })

    return req;
}


function send(options, request, onSent) {
    var req  = putRequests(options, onSent);

    //Write the class to the server
    var serializedReq = JSON.stringify({
        request_id:request.request_id,
        user_id:options.username, clazz:request.clazz});
    req.write(serializedReq);
    req.end();
}

module.exports.recv = recv;
module.exports.send = send;
module.exports.classified = classified;
