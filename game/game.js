var Character = require('./board').Character;
var Shot = require('./board').Shot;
var Game = require('./board').Game;
var IO = null;

var config ={
    board:{
        width : 1800,
        height : 1800,
        columns : 30,
        rows : 30
    }
};

var game = new Game(config);

var move = function(movement){
    if (!game.getPlayerById(movement.owner)) {
        return;
    }

    var piece = game.getPieceById(movement.owner);
    if (piece) {

        piece.orientation=movement.orientation;

        var destination =piece.calculateMovement();

        if (destination.x < 0 || destination.x >= game.board.width ||
            destination.y < 0 || destination.y >= game.board.height ){
            //fuera de rango
        } else {

            var collisions = game.board.collisionWalk(piece,destination);

            if(!collisions) {
                game.board.movePiece(piece,{x:game.board.width/2,y:game.board.height/2});
                console.log('piece update');
                IO.sockets.emit('piece update', {type:'revive', pieceId:piece.id, to:piece.point});
                return;//hack!
            }

            if (collisions.pieces.length || collisions.cells.length) {
                console.log('collision');
                IO.sockets.emit('piece update', {type:'collision', pieceId:piece.id});
            } else {
                piece.point=destination;
                game.board.movePiece(piece,destination);
                console.log('piece update');
                IO.sockets.emit('piece update', {type:'walk', pieceId:piece.id, to:piece.point});
            }
        }
    }
};
var startingPositions = [{x:150,y:150},{x:450,y:450},{x:150,y:450},{x:450,y:150},
                         {x:150,y:300},{x:300,y:150},{x:450,y:300},{x:300,y:450}];

var getStartingPosition = function(hitRadius){
    var i;
    for ( i=0;i<startingPositions.length;i++){
        var collisions = game.board.collisionPoint(hitRadius,startingPositions[i]);
        if(!collisions.pieces.length && !collisions.cells.length ){
            return  startingPositions[i];
        }
    }
    return startingPositions[0];
};

var addPlayer = function(player){
    var playerPieceConfig = {
        collidable:true,
        id:player.id
    };
    var playerPiece = new Character(playerPieceConfig);

    playerPiece.point = getStartingPosition(playerPiece.hitRadius);

    game.players.push(playerPiece);
    game.pieces.push(playerPiece);

    game.board.putPieceAtCoordinate(playerPiece,playerPiece.point);

    //notify all should be .sockets.in(gameID).emit
    var allPlayers = [];
    game.pieces.forEach(function(piece) {
        allPlayers.push({id:piece.id,point:piece.point});
    });
    IO.sockets.emit('players update', {action:'add',type:'player',target:player,position:playerPiece.point,all:allPlayers});
};

var attack = function (attack){
    var attacker = game.getPlayerById(attack.owner);
    for ( var i=0;i<game.pieces.length;i++){
        if(game.pieces[i].id!==attacker.id){
            if (attacker.distanceToPiece(game.pieces[i])<10) {
                IO.sockets.emit('piece update', {type:'hit', pieceId:game.pieces[i].id, by:attacker.id});
                if(++game.pieces[i].hits>=4){
                    revive([game.pieces[i]]);
                }
            }
        }
    }
};

var removePlayer = function(id){
    var i;
    for ( i=0;i<game.players.length;i++){
        if(game.players[i].id===id){
            game.players.splice(i,1);
        }
    }
    for ( i=0;i<game.pieces.length;i++){
        if(game.pieces[i].id===id){
            game.board.removePiece(game.pieces[i]);
            game.pieces.splice(i,1);
        }
    }
    IO.sockets.emit('players update', {action:'remove',target:id});
};

var revive = function(characters){
    characters.forEach(function(character){
        character.hits=0;
        character.point = getStartingPosition(character.hitRadius);
        game.board.movePiece(character,character.point);
        IO.sockets.emit('piece update', {type:'walk', pieceId:character.id, to:character.point});
    });
};

var updateShot = function(shot){
    var destination = shot.calculateMovement();

    if (destination.x < 0 || destination.x >= game.board.width ||
        destination.y < 0 || destination.y >= game.board.height ){
        IO.sockets.emit('piece update', {action:'remove',type:'shot',target:shot.id});
    } else {
        var collisions = game.board.collisionWalk(shot,destination);

        if(collisions.pieces.length){
            var targets = [];
            var casualties = [];
            collisions.pieces.forEach(function(piece){
                if(piece.id!==shot.owner){
                    if(++piece.hits>=4){
                        casualties.push(piece);
                    }
                    targets.push({id:piece.id});
                }
            });
            IO.sockets.emit('piece update', {type:'shot hit', target:targets, by:shot.id,owner:shot.owner});
            revive(casualties);
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

module.exports.walls = game.board.wallList;

module.exports.attach = function(io){
    IO = io;
    io.sockets.on('connection', function (socket) {
        socket.on('join', function(msg){
            socket.client.playerId = msg.player.id;
            addPlayer( msg.player);
        });
        socket.on('disconnect',  function(msg){
            if(socket.client.playerId){
                removePlayer(socket.client.playerId);
            }
        });
        socket.on('player action', function(msg){
            console.log(msg);
            if(msg.action === 'move'){
                move(msg.movement);
            } else if (msg.action === 'shoot'){
                onShoot(msg);
            } else if(msg.action === 'attack'){
               attack(msg);
            }
        });

        console.log('Socket '+socket.id+' connected');
    });
};