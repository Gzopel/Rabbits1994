
module.exports.attach = function(io){

    var server = require('../game/gameServer').createServer(io);

    io.sockets.on('connection', function (socket) {
        socket.on('join', function(msg){
            socket.client.playerId = msg.player.id;
            server.addPlayer( msg.player);
        });
        socket.on('disconnect',  function(msg){
            if(socket.client.playerId){
                server.removePlayer(socket.client.playerId);
            }
        });
        socket.on('player action', function(msg){
            console.log(msg);
            if(msg.action === 'move'){
                server.move(msg.movement);
            } else if (msg.action === 'shoot'){
                server.shoot(msg);
            } else if(msg.action === 'attack'){
                server.attack(msg);
            }
        });

        console.log('Socket '+socket.id+' connected');
    });

    return server;
};