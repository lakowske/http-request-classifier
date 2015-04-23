/*
 * (C) 2015 Seth Lakowske
 */

var http       = require('http');
var JSONStream = require('JSONStream');
var through2    = require('through2');
var classes     = require('./classes');

var recv = classes.recv;
var send = classes.send;

function displayReq(requests) {
    if (requests.length <= 0) {
        sample.innerHTML = "Finished"
    } else {
        //use trumpet template
        sample.innerHTML = JSON.stringify(requests[0]);
    }
}

var name      = document.querySelector('#name');
name.onchange = function() {
    recv({username:name.value}, displayReq);
}

recv({username:name.value}, displayReq);
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
            var request = JSON.parse(sample.innerHTML);
        } catch (err) {
            console.log('error making a JSON object');
        }
        if (request) {
            request['clazz'] = e.target.innerHTML;
            send({username:name.value}, request, function(result) {
                recv({username:name.value}, displayReq);
            });
        }
    })
}
