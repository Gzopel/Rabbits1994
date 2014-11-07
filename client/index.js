var Controller = require('./controller').Controller;
var io = require('socket.io-client');
var socket = null;
var renderer = require('./renderer');
var jq = require('jquery');

//var token;
var id;

jq.ajax({
    type: 'POST',
    data: {    },
    url: '/login'
}).done(function (result) {
    //token = result.token;
    id = result.id;
    console.log('logueado ',result);
    socket = io('http://localhost/'/*,{ query: 'token=' + token}*/);

        var controller = new Controller(socket,id);

        renderer.attach(socket,id);
        renderer.start();

        socket.emit('join',{player:{id:id}});

});


