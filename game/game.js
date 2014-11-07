var Board = require('./board').Board;
var Piece = require('./board').Piece;
var Shot = require('./board').Shot;
var IO = null;
var game = null;

var config ={
    board:{
        width : 600,
        height : 600,
        columns : 10,
        rows : 10
    }
};

var Game = function (config) {
    this.board = new Board(config);
    this.pieces = [];
    this.players = [];
};
Game.prototype = Object.create(Object.prototype);
Game.prototype.getPieceById = function(id) {
    var i;
    for ( i=0;i<this.pieces.length;i++){
        if(this.pieces[i].id===id){
            return this.pieces[i];
        }
    }
    return null;
};

Game.prototype.getPlayerById = function(id) {
    var i;
    for ( i=0;i<this.players.length;i++){
        if(this.players[i].id===id){
            return this.players[i];
        }
    }
    return null;
};

Game.prototype.move = function(movement){
    if (!this.getPlayerById(movement.owner)) {
        return;
    }

    var piece = this.getPieceById(movement.owner);
    if (piece) {

        piece.orientation=movement.orientation;
        var destination = {
            x : piece.point.x,
            y : piece.point.y
        };

        if (destination.x <= 0 || destination.x >= this.board.width ||
            destination.y <= 0 || destination.x >= this.board.height ){
            //fuera de rango
        } else {
            if ( piece.orientation === 0 ){//UP
                destination.y+= piece.step;
            } else if ( piece.orientation === 45 ){ //UP RIGHT
                destination.y+= piece.sideStep;
                destination.x+= piece.sideStep;
            } else if ( piece.orientation === 90 ){ //RIGHT
                destination.x+=piece.step;
            } else if ( piece.orientation === 135 ){ // DOWN RIGHT
                destination.y-= piece.sideStep;
                destination.x+= piece.sideStep;
            } else if ( piece.orientation === 180 ){ // DOWN
                destination.y-=piece.step;
            } else if ( piece.orientation === 225 ){ // DOWN LEFT
                destination.y-= piece.sideStep;
                destination.x-= piece.sideStep;
            } else if ( piece.orientation === 270 ){ // LEFT
                destination.x-=piece.step;
            } else if ( piece.orientation === 315 ){ //UP LEFT
                destination.y+= piece.sideStep;
                destination.x-= piece.sideStep;
            }

            var collisions = this.board.collisionWalk(piece,destination,piece.hitRadius);

            if(!collisions) {
                this.board.movePiece(piece,{x:this.board.width/2,y:this.board.height/2});
                console.log('piece update');
                IO.sockets.emit('piece update', {type:'revive', pieceId:piece.id, to:piece.point});
                return;//hack!
            }

            if (collisions.pieces.length || collisions.cells.length) {
                console.log('collision');
                IO.sockets.emit('piece update', {type:'collision', pieceId:piece.id,cells: collisions.cells});
            } else {
                piece.point=destination;
                this.board.movePiece(piece,destination);
                console.log('piece update');
                IO.sockets.emit('piece update', {type:'walk', pieceId:piece.id, to:piece.point});
            }
        }
    }
};
Game.prototype.addPlayer = function(player){
    var playerPiece = new Piece({});

    //set up starting position
    playerPiece.point = {x:150,y:150};
    playerPiece.id = player.id;
    this.players.push(playerPiece);
    this.pieces.push(playerPiece);

    this.board.putPieceAtCoordinate(playerPiece,playerPiece.point);

    //notify all should be .sockets.in(gameID).emit
    var allPlayers = [];
    this.pieces.forEach(function(piece) {
        allPlayers.push({id:piece.id,point:piece.point});
    });
    IO.sockets.emit('players update', {action:'add',target:player,position:playerPiece.point,all:allPlayers});
};

Game.prototype.shot = function (shot){
    var shooter = game.getPlayerById(shot.owner);
    var shot = new Shot();
    shot.owner = shooter.id;
};
Game.prototype.attack = function (attack){
    var attacker = this.getPlayerById(attack.owner);
    for ( var i=0;i<this.pieces.length;i++){
        if(this.pieces[i].id!==attacker.id){
            if (attacker.distanceToPiece(this.pieces[i])<10) {
                IO.sockets.emit('piece update', {type:'hit', pieceId:this.pieces[i].id, by:attacker.id});
            }
        }
    }
};

Game.prototype.removePlayer = function(id){
    var i;
    for ( i=0;i<this.players.length;i++){
        if(this.players[i].id===id){
            this.players.splice(i,1);
        }
    }
    for ( i=0;i<this.pieces.length;i++){
        if(this.pieces[i].id===id){
            this.board.removePiece(this.pieces[i]);
            this.pieces.splice(i,1);
        }
    }
    IO.sockets.emit('players update', {action:'remove',target:id});
};

module.exports.attach = function(io){
    IO = io;
    game = new Game(config);
    io.sockets.on('connection', function (socket) {
        socket.on('join', function(msg){
            socket.client.playerId = msg.player.id;
            game.addPlayer( msg.player);
        });
        socket.on('disconnect',  function(msg){
            if(socket.client.playerId){
                game.removePlayer(socket.client.playerId);
            }
        });
        socket.on('player action', function(msg){
            console.log(msg);
            if(msg.action === 'move'){
                game.move(msg.movement);
            } else if (msg.action === 'shoot'){
             //   game.shot(msg);
            } else if(msg.action === 'attack'){
               game.attack(msg);
            }
        });

        console.log('Socket '+socket.id+' connected');
    });
};