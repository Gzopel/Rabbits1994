var PIXI  = require('pixi');

var w=700;//
var h=700;//

console.log('creating renderer '+window.innerWidth+','+window.innerHeight);
var renderer = PIXI.autoDetectRenderer(window.innerWidth,800);
document.body.appendChild(renderer.view);



// create map
var mapRef = {x:0,y:0};
var mapMax= {x:1800,y:1800};
var mapPointToPosition = function(point){
    return {
        x:point.x,
        y:(mapMax.y -point.y)//inverted axis
    }
};

var tileTexture = PIXI.Texture.fromImage('resources/tile.jpg');
var tiles = PIXI.Texture.fromImage('resources/tiles.png');
var uiTexture = new PIXI.Texture(tiles,new PIXI.Rectangle(0,0,60,60));
var wallTexture = new PIXI.Texture(tiles,new PIXI.Rectangle(60,0,60,60));
var groundTexture = new PIXI.Texture(tiles,new PIXI.Rectangle(120,0,60,60));
var redTexture = new PIXI.Texture(tiles,new PIXI.Rectangle(180,0,60,60));
var grayTexture = new PIXI.Texture(tiles,new PIXI.Rectangle(240,0,60,60));
var whiteTexture= new PIXI.Texture(tiles,new PIXI.Rectangle(300,0,60,60));

var uiContainer = new PIXI.DisplayObjectContainer();

var sideBoard  = new PIXI.Sprite(uiTexture);
sideBoard.height=800;
sideBoard.width = 400;
var realW  = window.innerWidth-400;
sideBoard.position.x=realW;
uiContainer.addChild(sideBoard);


var mapContainer = new PIXI.DisplayObjectContainer();
var minimapContainer = new PIXI.DisplayObjectContainer();
minimapContainer.position.x=window.innerWidth-300;
minimapContainer.position.y=50;
var minipieceContainer = new PIXI.DisplayObjectContainer();
minipieceContainer.position.x=window.innerWidth-300;
minipieceContainer.position.y=50;

var pieceContainer = new PIXI.DisplayObjectContainer();
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
          createTile(i,j,groundTexture);
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
stage.addChild(pieceContainer);
stage.addChild(uiContainer);
stage.addChild(minimapContainer);
stage.addChild(minipieceContainer);




var bunnyTexture = PIXI.Texture.fromImage('resources/bunny.png');
var createPiece = function(conf){
    var sprite= new PIXI.Sprite(conf.texture||bunnyTexture);
    sprite.width=conf.width||26;
    sprite.height=conf.height||37;

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
        point:player.point,
        miniTexture:redTexture
    });

    var movePiece = piece.moveToPoint;
    piece.moveToPoint = function(point){

        piece.sprite.position.x = point.x-(piece.sprite.width/2);
        piece.sprite.position.y = (mapMax.y-point.y)-(piece.sprite.height*0.7);

        piece.miniSprite.position.x = piece.sprite.position.x/10;
        piece.miniSprite.position.y = piece.sprite.position.y/10;

        mapRef.x=point.x-(realW/2);
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
                        pieces[player.id]=(player.id===myId)?createPlayer(player):createPiece({id:player.id,point:player.point,miniTexture:whiteTexture});
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

