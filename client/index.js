var controller = require('./controller');
var io = require('socket.io-client');
var socket = null;
var renderer = require('./renderer');
var jq = require('jquery');

//var token;
var id;

/*
jq(document).on('keypress',function(event){
   event.preventDefault();
});*/

jq.ajax({
    type: 'POST',
    data: {    },
    url: '/login'
}).done(function (result) {
    //token = result.token;
    id = result.id;

    var url = result.server || 'http://localhost/';

    console.log('logueado ',result);
    socket = io(url/*,{ query: 'token=' + token}*/);

    controller.attach(socket,id,controller.actions);
    renderer.loadMap(JSON.parse(result.map));
    renderer.attach(socket,id);
    renderer.start();

    socket.emit('join',{player:{id:id}});
});


