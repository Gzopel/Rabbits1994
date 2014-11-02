var Controller = require('./controller').Controller;
var io = require('socket.io-client');
var socket = null;
var renderer = require('./renderer');
var jq = require('jquery');

var token;
var id;
/*
jq('#login').submit(function (e) {
    e.preventDefault();
*/
    jq.ajax({
        type: 'POST',
        data: {    },
        url: '/login'
    }).done(function (result) {
        //token = result.token;
        id = result.id;
        console.log('logueado ',result);
        socket = io('http://localhost/'/*,{ query: 'token=' + token}*/);
/*
        socket.on('connect', function () {
          // jq('#login').hide();

            socket.on('disconnect', function () {
           //     jq('#login').show();
            });
*/

            var controller = new Controller(socket,id);

            renderer.attach(socket,id);
            renderer.start();

            socket.emit('join',{player:{id:id}});
    //    });
    });
//});

