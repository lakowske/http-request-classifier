/*
 * (C) 2015 Seth Lakowske
 */

var http       = require('http');
var JSONStream = require('JSONStream');
var through2    = require('through2');

var sample    = document.querySelector('#req');
var hostField = document.querySelector('#host');
var portField = document.querySelector('#port');

var cont   = null;
var input  = null;
function queue(thr, request, fn) {
    thr.push(request);
    fn();
}

function dragleave(e, element) {
    element.classList.remove("dropover");
}

function getRequests(host, port) {
    var options = {
        host : host,
        port : port,
        path : '/requests',
        method : 'GET',
        withCredentials : false
    }

    var parseify = JSONStream.parse();
    var pauseify = through2(function(dbrequest, enc, fn) {
        var self    = this;
        var first   = false;
        if (cont === null) {
            first = true;
        }

        cont = function() {
            console.log('next request');
            queue(self, dbrequest, fn);
        }

        if (first) {
            cont();
        }
    })

    var req = http.request(options, function(res) {
        res.pipe(pauseify).pipe(parseify);
        parseify.on('data', function(dbrequest) {
            input = dbrequest;
            //use trumpet template
            sample.innerHTML = dbrequest.value;
        })

    })
    req.on('error', function(err) {
        console.log(err);
    })
    req.on('data', function(data) {
        console.log('hi ' + data);
    })

    return req;

}

var req = getRequests('localhost', 3333)
req.end();



function putRequests(host, port) {
    var options = {
        host : host,
        port : port,
        path : '/requests',
        method : 'POST',
        withCredentials : false
    }

    var req = http.request(options, function(res) {
        if (res.statusCode === 200) {
            console.log('sall good man');
        }
        res.on('data', function(data) {
            console.log(data);
        })
        res.on('end', function() {
            console.log('put response received');
        })
    })

    return req;
}

function send(request) {
    var time = new Date().getTime();
    var host = hostField.value;
    var port = parseInt(portField.value);
    var req  = putRequests(host, port);

    //Write it back to the server
    req.write(JSON.stringify(request));

    req.end();
}

var samples = document.querySelectorAll('.sample');

for (var i = 0 ; i < samples.length ; i++) {
    var el = samples[i];
    el.setAttribute('draggable', 'true');
    el.addEventListener('dragstart', function(e) {
        console.log(sample);
        e.dataTransfer.setData('text/plain', sample.innerHTML);
        e.dataTransfer.effectAllowed = "copy";
    });
}

var categories = document.querySelectorAll('.category');
for (var i = 0 ; i < categories.length ; i++) {
    var el = categories[i];

    el.addEventListener('dragover', function(e) {
        e.preventDefault();
        if (e.toElement) e.toElement.classList.add("dropover");
        if (e.target) e.target.classList.add("dropover");
    })

    el.addEventListener('dragenter', function(e) {
        e.preventDefault();
    })

    el.addEventListener('dragleave', function(e) {
        if (e.toElement) dragleave(e, e.toElement);
        if (e.target) dragleave(e, e.target);
    })

    el.addEventListener('drop', function(e) {
        e.preventDefault();
        //console.log(e.target);
        //console.log(e.dataTransfer.getData('text/plain'));
        try {
            var request = JSON.parse(sample.innerHTML);
        } catch (err) {
            console.log('error making a JSON object');
        }
        if (request) {
            //console.log(el);
            request['clazz'] = e.target.innerHTML;
            send(request);
        }
        if (cont) cont()
    })
}
