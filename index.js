/*
 * (C) 2015 Seth Lakowske
 */

var http       = require('http');
var JSONStream = require('JSONStream');
var through2    = require('through2');
var classes     = require('./classes');
var robots      = require('./robots');
var keypress    = require('./keypress');

var keys = keypress.streamKeypresses();
keys.on('data', function(e) {
    if (e.keyCode == 97) {
        currentReq.clazz = robotGuess;
        sendRequest(currentReq);
    }
    console.log(e.keyCode);
})

var recv = classes.recv;
var send = classes.send;

var currentReq = null;
var robotGuess = null;

function sendRequest(request) {
    send({username:name.value}, request, function(result) {
        recv({username:name.value}, processRequests);
    });
}

function displayReq(requests) {

    if (requests.length <= 0) {
        sample.innerHTML = "Finished"
    } else {
        //use template in the future
        var r = requests[0];
        currentReq = r;
        var displayText = r.method + ' ' + r.url + '<br>' + r.user_agent + '<br>' + r.cookie + '<br>' + r.remoteaddress;
        sample.innerHTML = displayText;
    }
}

function setCategoryWidth(category, width) {
    if (width < 0.1) {
        width = 0.1;
    }

    width = width * 960 + "px";

    var el = document.getElementById(category);
    el.style.width = width;
}

function displaySuggestion(classes) {
    var maxP = 0.0;
    for (var key in classes) {
        var p = classes[key];
        if (p > maxP) robotGuess = key;
        setCategoryWidth(key, p)
    }
    console.log(robotGuess + ' ' + maxP);
    console.log(classes);
}

function suggest(requests) {
    if (requests.length <= 0) {
        console.log('nothing to help with')
    } else {
        var req = robots.classify({host:window.location.hostname, port:'4466'}, displaySuggestion);
        req.write(JSON.stringify(requests));
        req.end();
    }
}

function processRequests(requests) {
    displayReq(requests);
    suggest(requests);
}

var name      = document.querySelector('#name');
name.onchange = function() {
    recv({username:name.value}, displayReq);
}

recv({username:name.value}, processRequests);
Window._recv = recv;
Window._send = send;

var sample    = document.querySelector('#req');
var samples = document.querySelectorAll('.sample');

function dragleave(e, element) {
    element.classList.remove("dropover");
}



//apply attributes and event listener to sample element
for (var i = 0 ; i < samples.length ; i++) {
    var el = samples[i];
    el.setAttribute('draggable', 'true');
    el.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', sample.innerHTML);
        e.dataTransfer.effectAllowed = "copy";
    })
}

//apply event listeners to category elements
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
        if (e.toElement) dragleave(e, e.toElement);
        if (e.target) dragleave(e, e.target);
        e.preventDefault();
        try {
            var request = currentReq;
        } catch (err) {
            console.log('error making a JSON object');
        }
        if (request) {
            request['clazz'] = e.target.innerHTML;
            sendRequest(request);
        }
    })
}
