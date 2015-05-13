/*
 * (C) 2015 Seth Lakowske
 */

var through2 = require('through2');

function streamKeypresses() {
    var stream = through2.obj(function(data, enc, cb) {
        this.push(data)
        cb()
    });

    document.onkeypress = function(e) {
        e = e || window.event;
        stream.write(e);
    }

    return stream;
}

module.exports.streamKeypresses = streamKeypresses;
