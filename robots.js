/*
 * (C) 2015 Seth Lakowske
 */

var http       = require('http');
var JSONStream = require('JSONStream');

/*
 * @param options {Object} http parameters
 * @param callback {Function} called when the robot responds 
 * with classified data.
 * @return {Object} request;
 */
function classify(options, callback) {
    options.path            = '/';
    options.method          = 'POST';
    options.withCredentials = false;

    var result = '';

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

module.exports.classify = classify;
