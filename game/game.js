var Board = require('./board').Board;
var Piece = require('./board').Piece;
var Shot = require('./board').Shot;
var IO = null;

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

        var destination =piece.calculateMovement();

        if (destination.x < 0 || destination.x >= this.board.width ||
            destination.y < 0 || destination.y >= this.board.height ){
            //fuera de rango
        } else {

            var collisions = this.board.collisionWalk(piece,destination);

            if(!collisions) {
                this.board.movePiece(piece,{x:this.board.width/2,y:this.board.height/2});
                console.log('piece update');
                IO.sockets.emit('piece update', {type:'revive', pieceId:piece.id, to:piece.point});
                return;//hack!
            }

            if (collisions.pieces.length || collisions.cells.length) {
                console.log('collision');
                IO.sockets.emit('piece update', {type:'collision', pieceId:piece.id});
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
    var playerPieceConfig = {
        collidable:true,
        point : {x:150,y:150}//getStartingPosition()
    };
    var playerPiece = new Piece(playerPieceConfig);

    playerPiece.id = player.id;

    this.players.push(playerPiece);
    this.pieces.push(playerPiece);

    this.board.putPieceAtCoordinate(playerPiece,playerPiece.point);

    //notify all should be .sockets.in(gameID).emit
    var allPlayers = [];
    this.pieces.forEach(function(piece) {
        allPlayers.push({id:piece.id,point:piece.point});
    });
    IO.sockets.emit('players update', {action:'add',type:'player',target:player,position:playerPiece.point,all:allPlayers});
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


var game = new Game(config);

var updateShot = function(shot){
    var destination = shot.calculateMovement();

    if (destination.x < 0 || destination.x >= game.board.width ||
        destination.y < 0 || destination.y >= game.board.height ){
        IO.sockets.emit('piece update', {action:'remove',type:'shot',target:shot.id});
    } else {
        var collisions = game.board.collisionWalk(shot,destination);

        if(collisions.pieces.length){
            var targets = [];
            collisions.pieces.forEach(function(piece){
                if(piece.id!==shot.owner){
                    targets.push({id:piece.id});
                }
            });
            IO.sockets.emit('piece update', {type:'shot hit', target:targets, by:shot.id,owner:shot.owner});
        }else {
            shot.point=destination;
            IO.sockets.emit('piece update', {type:'walk', pieceId:shot.id, to:shot.point});
            setTimeout(updateShot,100,shot);
        }
    }
};
var shots = 0;
var onShoot = function(shoot){
    var shooter = game.getPlayerById(shoot.owner);
    var shot = new Shot(shooter);
    shot.id='shot'+shots++;
    IO.sockets.emit('piece update', {action:'add',type:'shot', pieceId:shot.id, by:shot.owner,on:shot.point});
    updateShot(shot);
};

module.exports.attach = function(io){
    IO = io;
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
                onShoot(msg);
            } else if(msg.action === 'attack'){
               game.attack(msg);
            }
        });

        console.log('Socket '+socket.id+' connected');
    });
};