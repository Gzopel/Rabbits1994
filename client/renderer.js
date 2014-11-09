var PIXI  = require('pixi');

var w=600;//window.innerWidth;
var h=600;//window.innerHeight;

var renderer = PIXI.autoDetectRenderer(w,h);
document.body.appendChild(renderer.view);

// create map
var tileTexture = PIXI.Texture.fromImage('resources/tile.jpg');
var mapContainer = new PIXI.DisplayObjectContainer();
var i;
var j;
var side = 60;
var createWall = function(i,j){
    var sprite = new PIXI.Sprite(tileTexture);
    sprite.width=side;
    sprite.height=side;
    sprite.position.x= i*side;
    sprite.position.y= j*side;
    mapContainer.addChild(sprite);
};
for (i = 0; i<30; i++ ) {
    for (j = 0; j<30; j++ ) {
        if ((i == 0)||(j == 0)||(i == 29)||(j == 29)){
            createWall(i,j);
        }
    }
}

//create stage
var stage = new PIXI.Stage();
var animate = function () {
    renderer.render(stage);
    requestAnimationFrame(animate);
};


stage.addChild(mapContainer);

var pieceContainer = new PIXI.DisplayObjectContainer();
stage.addChild(pieceContainer);
var mapRef = {x:0,y:0};
var mapMax= {x:1800,y:1800};
var mapPointToPosition = function(point){
    return {
        x:point.x,
        y:(mapMax.y -point.y)//inverted axis
    }
};



var bunnyTexture = PIXI.Texture.fromImage('resources/bunny.png');
var createPiece = function(conf){
    var sprite= new PIXI.Sprite(conf.texture||bunnyTexture);
    sprite.width=conf.width||26;
    sprite.height=conf.height||37;
    sprite.visible=true;
    var spriteCenter = {
        x:sprite.width/2,
        y:sprite.height*0.7
    };
    var move = function(target){
        var dm = mapPointToPosition(target);
        sprite.position.x = dm.x-spriteCenter.x;
        sprite.position.y = dm.y-spriteCenter.y;
    };
    pieceContainer.addChild(sprite);

    if(conf.point){
        move(conf.point);
    }

    console.log('new piece '+conf);
    return {
        sprite:sprite,
        moveToPoint:move,
        getCenter: function(){
            return {
                x:sprite.position.x+spriteCenter.x,
                y:sprite.position.y+spriteCenter.y
            }
        },
        distanceTo: function(position){
            return {
                x:sprite.position.x+spriteCenter.x-position.x,
                y:sprite.position.y+spriteCenter.y-position.y
            }
        }
    }

};

var hitTexture = PIXI.Texture.fromImage('resources/hit.png');
var createShot = function(shot){
    var piece= new createPiece({
        texture:hitTexture,
        width:10,
        height:10,
        point:shot.on
    });
    return piece;
};


var createHit = function(player){
    var hit =  new PIXI.Sprite(hitTexture);
    hit.scale.x=2;
    hit.scale.y=2;
    var center = player.getCenter();
    hit.position.x=center.x;
    hit.position.y=center.y-10;
    pieceContainer.addChild(hit);
    setTimeout(function(){
        hit.visible=false;
        pieceContainer.removeChild(hit);
        delete hit;
    },250);
};

var createPlayer = function(player){
    var piece= new createPiece({
        texture:bunnyTexture,
        width:26,
        height:37,
        point:player.point
    });

    var movePiece = piece.moveToPoint;
    piece.moveToPoint = function(point){

        piece.sprite.position.x = point.x-(piece.sprite.width/2);
        piece.sprite.position.y = (mapMax.y-point.y)-(piece.sprite.height*0.7);

        mapRef.x=point.x-(w/2);
        mapRef.y=point.y-(h/2);
        mapContainer.position.x= -mapRef.x;
        mapContainer.position.y= h-(mapMax.y-mapRef.y);
        pieceContainer.position.x= -mapRef.x;
        pieceContainer.position.y= h-(mapMax.y-mapRef.y);

     //   movePiece(point);
    };

    piece.moveToPoint(player.point);


    return piece;
};


var myId;
var pieces = [];

module.exports ={
    attach :function(socket,id) {
        myId = id;
        socket.on('piece update', function (msg) {
            console.log('piece update',msg);
            if (msg.type ==='walk' ){
                var p = pieces[msg.pieceId];
                if (p) {
                    p.moveToPoint(msg.to);
                }
            } else if (msg.type ==='hit'){
                var player = pieces[msg.pieceId];
                createHit(player);
            } else if (msg.type === 'shot'){
                if( msg.action === 'add') {
                    pieces[msg.pieceId]=createShot(msg);
                } else if (msg.action === 'remove'){
                    pieceContainer.removeChild(pieces[msg.target].sprite);
                    delete pieces[msg.target];
                }
            } else if (msg.type === 'shot hit'){
                msg.target.forEach(function(target){
                    var player = pieces[target.id];
                    createHit(player);
                });
                pieceContainer.removeChild(pieces[msg.by].sprite);
                delete pieces[msg.by];
            }
        });

        socket.on('players update', function (msg) {
            console.log('player update',msg);
            if (msg.action === 'add'){
                msg.all.forEach( function(player){
                    if (!pieces[player.id]){
                        pieces[player.id]=(player.id===myId)?createPlayer(player):createPiece(player);
                    }
                });
            } else if (msg.action === 'remove'){
                if (pieces[msg.target]){
                    stage.removeChild(pieces[msg.target].sprite);
                    delete pieces[msg.target];
                }
            }
        });
    },
    start: function() {
        requestAnimationFrame(animate);
    }
};

