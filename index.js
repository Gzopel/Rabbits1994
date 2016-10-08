var express = require('express');

var app = express();

app.use(express.static('./public'));

var users = 1;

var http = require('http').Server(app);
var io = require('socket.io')(http);
var game = require('./routes/gameRoutes').attach(io);


app.post('/login', function (req, res) {
    res.json({
        /*token: token,*/
        id:users++,
        server: require('ip').address(),
        map:JSON.stringify(game.getMap()),
    });
});


http.listen(process.env.PORT || 3000, function(){
    console.log('listening on *:'+(process.env.PORT || 3000));
});