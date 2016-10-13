var express = require('express');

var app = express();

app.use(express.static('./public'));

var http = require('http').Server(app);

http.listen(process.env.PORT || 3000, function(){
    console.log('listening on *:'+(process.env.PORT || 3000));
});