var Controller = require('./controller').Controller;
var socket = require('socket.io-client')('http://localhost/');
var renderer = require('./renderer');

socket.on('players update', function (msg) {
    console.log(msg);
});


var controller = new Controller(socket);
renderer.attach(socket);
renderer.start();

socket.emit('join',{player:{id:1}});