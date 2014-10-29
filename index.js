var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var game = require('./game/game');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
//var session = require('express-session')


app.use(express.static('./public'));
app.use(cookieParser('En mi pueblo le decimo macita'));
//app.use(session({ store: sessionStore }));
app.use(errorHandler());



game.attach(io);

http.listen(3000, function(){
    console.log('listening on *:3000');
});