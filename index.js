/*
 * (C) 2015 Seth Lakowske
 */

var http       = require('http');
var JSONStream = require('JSONStream');
var through2    = require('through2');

var name      = document.querySelector('#name');
name.onchange = function() {
    recv();
}
var sample    = document.querySelector('#req');


var cont   = null;
var input  = null;
function queue(thr, request, fn) {
    thr.push(request);
    fn();
}

function dragleave(e, element) {
    element.classList.remove("dropover");
}

function getRequests(user_id) {
    var options = {
        path : '/users/' + user_id + '/unclassified',
        method : 'GET',
        withCredentials : false
    }

    var result = ''
    var req = http.request(options, function(res) {

        res.on('data', function(data) {
            result += data;
        })

        res.on('end', function() {
            input = JSON.parse(result);
            if (input.length <= 0) {
                sample.innerHTML = "Finished"
            } else {
                //use trumpet template
                sample.innerHTML = JSON.stringify(input[0]);
            }
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


function recv() {
    var username  = name.value;
    var req = getRequests(username)
    req.end();
}

recv();

Window._recv = recv;

function putRequests(onEnd) {
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


function send(request, onSent) {
    var time = new Date().getTime();
    var username = name.value;
    var req  = putRequests(onSent);

    //Write the class to the server
    var serializedReq = JSON.stringify({
        request_id:request.request_id,
        user_id:username, clazz:request.clazz});
    req.write(serializedReq);

    req.end();
}

Window._send = send;

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
        if (e.toElement) dragleave(e, e.toElement);
        if (e.target) dragleave(e, e.target);
        
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
            send(request, function(result) {
                console.log(result);
                recv();
            });
        }
    })
}
