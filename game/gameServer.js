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


var addPlayer = function(player){
    var playerPieceConfig = {
        collidable:true,
        id:player.id
    };
    var playerPiece = new Character(playerPieceConfig);

    playerPiece.team = 1 + (player.id%2);
    playerPiece.point = game.getStartingPosition(playerPiece.team,playerPiece.hitRadius);
    game.players.push(playerPiece);
    game.pieces.push(playerPiece);

    game.board.putPieceAtCoordinate(playerPiece,playerPiece.point);

    //notify all should be .sockets.in(gameID).emit
    var allPlayers = [];
    game.players.forEach(function(piece) {
        allPlayers.push({id:piece.id,point:piece.point,team:piece.team});
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
        character.point = game.getStartingPosition(character.team,character.hitRadius);
        game.board.movePiece(character,character.point);
        IO.sockets.emit('piece update', {type:'walk', pieceId:character.id, to:character.point});
    });
};
var updateKills = function(id,casualties){
    var p = game.getPlayerById(id);
    p.kills+=casualties.length;
    var ids = [];
    casualties.forEach(function(piece){
       ids.push(piece.id);
    });

    IO.sockets.emit('players update', {action:'kill update',pk:id,casualties:ids});
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
            updateKills(shot.owner,casualties);
        } else if (collisions.cells.length){
            IO.sockets.emit('piece update', {action:'remove',type:'shot',target:shot.id});
        } else {
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
    shot.orientation=shoot.orientation;
    shot.id='shot'+shots++;
    IO.sockets.emit('piece update', {action:'add',type:'shot', pieceId:shot.id, by:shot.owner,on:shot.point});
    updateShot(shot);
};


module.exports.createServer = function(io){
    IO = io;
    return {
        addPlayer: addPlayer,
        removePlayer: removePlayer,
        move: move,
        shoot:onShoot,
        attack:attack,
        getWalls : function(){
            return game.board.wallList;
        }
    }
};
