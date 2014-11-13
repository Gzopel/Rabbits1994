var PIXI  = require('pixi');

var w=800;//game camera W x H
var h=600;//

console.log('creating renderer '+window.innerWidth+'x'+window.innerHeight);
var renderer = PIXI.autoDetectRenderer(1040,600);
document.body.appendChild(renderer.view);


var bunnyTexture = PIXI.Texture.fromImage('resources/bunny.png');
var hitTexture = PIXI.Texture.fromImage('resources/hit.png');
var grassTexture = PIXI.Texture.fromImage('resources/grass.jpg');
var tileTexture = PIXI.Texture.fromImage('resources/tile.jpg');
var tiles = PIXI.Texture.fromImage('resources/tiles.png');
var uiTexture = new PIXI.Texture(tiles,new PIXI.Rectangle(0,0,60,60));
var wallTexture = new PIXI.Texture(tiles,new PIXI.Rectangle(60,0,60,60));
var groundTexture = new PIXI.Texture(tiles,new PIXI.Rectangle(120,0,60,60));
var redTexture = new PIXI.Texture(tiles,new PIXI.Rectangle(180,0,20,20));
var blueTexture = new PIXI.Texture(tiles,new PIXI.Rectangle(241,0,20,20));
var whiteTexture= new PIXI.Texture(tiles,new PIXI.Rectangle(300,0,60,60));


var uiContainer = new PIXI.DisplayObjectContainer();
var sideBoard  = new PIXI.Sprite(uiTexture);
sideBoard.height=h;
sideBoard.width = 240;
sideBoard.position.x=w;
uiContainer.addChild(sideBoard);
var minimapContainer = new PIXI.DisplayObjectContainer();
minimapContainer.position.x=w+20;
minimapContainer.position.y=20;
var minipieceContainer = new PIXI.DisplayObjectContainer();
minipieceContainer.position.x=w+20;
minipieceContainer.position.y=20;

var mapContainer = new PIXI.DisplayObjectContainer();
var pieceContainer = new PIXI.DisplayObjectContainer();


// create map
var mapRef = {x:0,y:0};
var mapMax= {x:1800,y:1800};
//scale?
var i;
var j;
var side = 60;
var createTile = function(i,j,texture){
    var sprite = new PIXI.Sprite(texture);
    sprite.width=side;
    sprite.height=side;
    sprite.position.x= i*side;
    sprite.position.y= mapMax.y-side-j*side;
    mapContainer.addChild(sprite);

    var miniSprite = new PIXI.Sprite(texture);
    miniSprite.width=side/10;
    miniSprite.height=side/10;
    miniSprite.position.x= i*miniSprite.width;
    miniSprite.position.y= 180-((1+j)*miniSprite.height);
    minimapContainer.addChild(miniSprite);
};
for (i = 0; i<30; i++ ) {
    for (j = 0; j<30; j++ ) {
        if ((i == 0)||(j == 0)||(i == 29)||(j == 29)){
           createTile(i,j,tileTexture);
        } else {
          createTile(i,j,grassTexture);
        }
    }
}
var mapPointToPosition = function(point){
    return {
        x:point.x,
        y:mapMax.y -point.y//inverted axis
    }
};

//create stage
var stage = new PIXI.Stage();
var animate = function () {
    renderer.render(stage);
    requestAnimationFrame(animate);
};
stage.addChild(mapContainer);
stage.addChild(pieceContainer);
stage.addChild(uiContainer);
stage.addChild(minimapContainer);
stage.addChild(minipieceContainer);




var createPiece = function(conf){
    var sprite= new PIXI.Sprite(conf.texture||bunnyTexture);
    sprite.width=conf.width||26;
    sprite.height=conf.height||37;
    if(conf.team){
        var tt = (conf.team===2)?blueTexture:redTexture;
        var ts = new PIXI.Sprite(tt);
        ts.height=3;
        ts.width=14;
        ts.position.x=6;
        ts.position.y=7;
        sprite.addChild(ts);
    }
    var miniSprite;
    if(conf.miniTexture){
        miniSprite = new PIXI.Sprite(bunnyTexture);
        miniSprite.height=6;
        miniSprite.width=6;
        minipieceContainer.addChild(miniSprite);
    }

    var spriteCenter = {
        x:sprite.width/2,
        y:sprite.height*0.7
    };
    var move = function(target){
        var dm = mapPointToPosition(target);
        sprite.position.x = dm.x-spriteCenter.x;
        sprite.position.y = dm.y-spriteCenter.y;
        if(miniSprite){
            miniSprite.position.x =(sprite.position.x/10)-1;
            miniSprite.position.y =(sprite.position.y/10)-1;
        }
    };
    pieceContainer.addChild(sprite);

    if(conf.point){
        move(conf.point);
    }

    console.log('new piece '+conf);
    return {
        sprite:sprite,
        miniSprite:miniSprite,
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

//AKA camera+piece
var createPlayer = function(player){
    var piece= new createPiece({
        texture:bunnyTexture,
        width:26,
        height:37,
        point:player.point,
        team:player.team,
        miniTexture:redTexture
    });

    var movePiece = piece.moveToPoint;
    piece.moveToPoint = function(point){

        piece.sprite.position.x = point.x-(piece.sprite.width/2);
        piece.sprite.position.y = (mapMax.y-point.y)-(piece.sprite.height*0.7);

        piece.miniSprite.position.x = piece.sprite.position.x/10;
        piece.miniSprite.position.y = piece.sprite.position.y/10;

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
    loadMap:function(walls){
      walls.forEach(function(wall){
          createTile(wall.x,wall.y,tileTexture);
      });
    },
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
                        pieces[player.id]=(player.id===myId)?createPlayer(player):createPiece({id:player.id,point:player.point,team:player.team,miniTexture:whiteTexture});
                    }
                });
            } else if (msg.action === 'remove'){
                if (pieces[msg.target]){
                    minipieceContainer.removeChild(pieces[msg.target].miniSprite);
                    pieceContainer.removeChild(pieces[msg.target].sprite);
                    delete pieces[msg.target];
                }
            }
        });
    },
    start: function() {
        requestAnimationFrame(animate);
    }
};

