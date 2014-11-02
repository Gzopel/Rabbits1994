var express = require('express');
var game = require('./game/game');
var errorHandler = require('errorhandler');
//var jwt = require('jsonwebtoken');

var app = express();

app.use(express.static('./public'));
//app.use(cookieParser(/*'En mi pueblo le decimo macita'*/));
//app.use(session());
app.use(errorHandler());

var users = 1;
//var jwtSecret = 'superSecret';
app.post('/login', function (req, res) {
    // TODO: validate the actual user user
    var profile = {
        id: users++
    };
    //var token = jwt.sign(profile, jwtSecret, { expiresInMinutes: 60*5 });
    res.json({/*token: token,*/id:profile.id});
});
var http = require('http').Server(app);
var io = require('socket.io')(http);
/*
var socketioJwt = require('socket.io');//socketio-jwt
var io = io.listen(http);
io.use(socketioJwt.authorize({
    secret: jwtSecret,
    handshake: true
}));*/


game.attach(io);

http.listen(3000, function(){
    console.log('listening on *:3000');
});