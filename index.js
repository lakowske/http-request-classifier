/*
 * (C) 2015 Seth Lakowske
 */

var http = require('http');
var JSONStream = require('JSONStream');

var sample = document.querySelector('#req');

function getRequests(host, port) {
    var options = {
        host : host,
        port : port,
        path : '/requests',
        withCredentials : false
    }

    var parseify = JSONStream.parse();

    var req = http.request(options, function(res) {
        res.pipe(parseify);
        parseify.on('data', function(dbrequest) {
            sample.innerHtml = dbrequest.value;
        })
        res.on('data', function(dbrequest) {
            sample.innerHtml = dbrequest.toString();
        })


    })
    req.end();
}

var samples = document.querySelectorAll('.sample');

for (var i = 0 ; i < samples.length ; i++) {
    var el = samples[i];
    el.setAttribute('draggable', 'true');
    el.addEventListener('dragstart', function(e) {
        //e.srcElement.classList.add("dragging");
        e.dataTransfer.setData('text/plain', 'this may be dragged');
    });
}

var categories = document.querySelectorAll('.category');
for (var i = 0 ; i < categories.length ; i++) {
    var el = categories[i];
    el.addEventListener('dragover', function(e) {
        if (e.toElement) e.toElement.classList.add("dropover");
        if (e.target) e.target.classList.add("dropover");
    })

    el.addEventListener('dragleave', function(e) {
        if (e.toElement) e.toElement.classList.remove("dropover");
        if (e.target) e.target.classList.remove("dropover");
    })
}

getRequests('localhost', 3333);
