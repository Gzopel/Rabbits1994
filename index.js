var express = require('express');
var game = require('./game/game');

var app = express();

app.use(express.static('./public'));

var users = 1;

app.post('/login', function (req, res) {
    res.json({
        /*token: token,*/
        id:users++,
        server: require('ip').address()
    });
});
var http = require('http').Server(app);
var io = require('socket.io')(http);


game.attach(io);

http.listen(3000, function(){
    console.log('listening on *:3000');
});