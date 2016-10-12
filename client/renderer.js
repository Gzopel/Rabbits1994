var PIXI  = require('pixi');

var w=800;//game camera W x H
var h=600;//

console.log('creating renderer '+window.innerWidth+'x'+window.innerHeight);
var renderer = PIXI.autoDetectRenderer(1030,600);
document.body.appendChild(renderer.view);


var bunnyTexture = PIXI.Texture.fromImage('resources/bunny.png');
var hitTexture = PIXI.Texture.fromImage('resources/hit.png');
var grassTexture = PIXI.Texture.fromImage('resources/grass.jpg');
var tileTexture = PIXI.Texture.fromImage('resources/tile.jpg');
var tiles = PIXI.Texture.fromImage('resources/tiles.png');
var treesTexture = PIXI.Texture.fromImage('resources/trees.png');
var treeTextureOne = PIXI.Texture.fromImage('resources/tree1.png');
var treeTextureTwo = PIXI.Texture.fromImage('resources/tree2.png');
var treeTextureThree = PIXI.Texture.fromImage('resources/tree3.png');
var treeTextures = [treeTextureOne, treeTextureTwo, treeTextureThree];
var uiTexture = new PIXI.Texture(tiles,new PIXI.Rectangle(0,0,60,60));
var wallTexture = new PIXI.Texture(tiles,new PIXI.Rectangle(60,0,60,60));
var groundTexture = new PIXI.Texture(tiles,new PIXI.Rectangle(120,0,60,60));
var redTexture = new PIXI.Texture(tiles,new PIXI.Rectangle(200,0,20,20));
var blueTexture = new PIXI.Texture(tiles,new PIXI.Rectangle(241,0,20,20));
var whiteTexture= new PIXI.Texture(tiles,new PIXI.Rectangle(320,0,20,20));


var uiContainer = new PIXI.DisplayObjectContainer();
var sideBoard  = new PIXI.Sprite(uiTexture);
sideBoard.height=h;
sideBoard.width = 240;
sideBoard.position.x=w;
uiContainer.addChild(sideBoard);

var chatBackground = new PIXI.Sprite(whiteTexture);
chatBackground.height=h-310;
chatBackground.width=180;
chatBackground.position.x=w+20;
chatBackground.position.y=290;
uiContainer.addChild(chatBackground);

var minimapContainer = new PIXI.DisplayObjectContainer();
minimapContainer.position.x=w+20;
minimapContainer.position.y=20;
var minipieceContainer = new PIXI.DisplayObjectContainer();
minipieceContainer.position.x=w+20;
minipieceContainer.position.y=20;

var scoreContainer = new PIXI.DisplayObjectContainer();
scoreContainer.position.x=w+20;
scoreContainer.position.y=220;
var teamScore1 =  new PIXI.Sprite(redTexture);
teamScore1.width=85;
teamScore1.height=40;
scoreContainer.addChild(teamScore1);
var teamScore2 =  new PIXI.Sprite(blueTexture);
teamScore2.width=85;
teamScore2.height=40;
teamScore2.position.x=95;
scoreContainer.addChild(teamScore2);
var score1 = new PIXI.Text('0');
score1.position.x=10;
score1.position.y=10;
scoreContainer.addChild(score1);
var score2 = new PIXI.Text('0');
score2.position.x=95;
score2.position.y=10;
scoreContainer.addChild(score2);

var chatContainer = new PIXI.DisplayObjectContainer();
chatContainer.position.x=w+20;
chatContainer.position.y=h-40;
var lastPosition=0;
var chatHistory = [];
var addToChat = function(msg){
  var text = new PIXI.Text(msg,{font:'16px Arial'});
  text.setText(msg);
  text.position.y=lastPosition+text.height;
  chatContainer.addChild(text);
  chatHistory.push(text);
  lastPosition+=text.height;
  if (lastPosition>chatBackground.height){
    var old = chatHistory[0];
    chatHistory.splice(0,1);
    chatHistory.forEach(function(c){
        c.position.y-=old.height;
    });
    lastPosition-=old.height;
    chatContainer.position.y+=old.height;
    chatContainer.removeChild(old);
    delete old;
  }
  chatContainer.position.y-=text.height;//autoscroll
};

function getTreeTexture() {
  return treeTextures[Math.round(Math.random()*(treeTextures.length -1))];
}

var mapContainer = new PIXI.DisplayObjectContainer();
var pieceContainer = new PIXI.DisplayObjectContainer();

function sqr(x) { return x * x; };
function vectorDistanceToVector(v, w) { return Math.sqrt(sqr(v.x - w.x) + sqr(v.y - w.y)); };


var mapRef = {x:0,y: 0};
var mapMax = {x: 800,y:800};
// create map
function createMap(mapConfig) {
  mapMax = convertPosition(mapConfig.size);
  var i;
  var j;
  var side = 60;
  var usedMap = [];
  for (i = 0; i<mapMax.x/side; i++ ) {
    usedMap[i] = [];
  }
  var createTile = function(i,j,texture){
    if (usedMap[i] && usedMap[i][j]) return;
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
  function isAnExit(x,y) {
    if (mapConfig.exits) {
      for (var k = 0; k < mapConfig.exits.length; k++ ){
        var exit = mapConfig.exits[k];
        var center = convertPosition(exit.position);
        var distance = vectorDistanceToVector(center,{x:x,y:y});
        if (distance <= exit.radius)
          return true;
      }
    }
    return false;
  }
  var maxI = (mapMax.x/side);
  var maxJ = (mapMax.y/side);
  for (i = 0; i<=maxI; i++ ) {
    for (j = 0; j<=maxJ; j++ ) {
      if(isAnExit(i*side,j*side)) {
        createTile(i,j,tileTexture);
      } else {
        createTile(i,j,grassTexture);
      }
    }
  }

}

var mapPointToPosition = function(point){
  return {
    x:point.x,
    y: mapMax.y -point.y//inverted axis
  }
};

var animate;
var stage;
var running = true;
function createStage() {
    stage = new PIXI.Stage();
    animate = function () {
        if(!running) return;
        renderer.render(stage);
        requestAnimationFrame(animate);
    };
    stage.addChild(mapContainer);
    stage.addChild(pieceContainer);
    stage.addChild(uiContainer);
    stage.addChild(minimapContainer);
    stage.addChild(minipieceContainer);
    stage.addChild(scoreContainer);
    stage.addChild(chatContainer);
}

function addTree(msg) {
  var texture = getTreeTexture();
  pieces[msg.id] = createPiece({
    texture: texture,
    miniTexture: texture,
    id: msg.id,
    point: convertPosition(msg.position),
  });
}

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
  pieceContainer.addChild(sprite);
  var miniSprite;
  if(conf.miniTexture){
    miniSprite = new PIXI.Sprite(conf.texture||bunnyTexture);
    miniSprite.height=6;
    miniSprite.width=6;
    minipieceContainer.addChild(miniSprite);
  }

  var spriteCenter = {
    x:sprite.width/2,
    y: sprite.height*0.7
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

  if(conf.point){
    move(conf.point);
  }

  console.log('new piece ',conf);
  return {
    sprite:sprite,
    miniSprite:miniSprite,
    moveToPoint:move,
    getCenter: function(){
      return {
        x:sprite.position.x+spriteCenter.x,
        y: sprite.position.y+spriteCenter.y
      }
    },
    distanceTo: function(position){
      return {
        x:sprite.position.x+spriteCenter.x-position.x,
        y: sprite.position.y+spriteCenter.y-position.y
      }
    }
  }

};

var createShot = function(shot){
  var piece= new createPiece({
    texture:hitTexture,
    width:10,
    height:10,
    point: convertPosition(shot.position)
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
var createPlayer = function(position){
  console.log('creating player');
  var piece= new createPiece({
    texture:bunnyTexture,
    width:26,
    height:37,
    point:position,
    team:1,
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

  piece.moveToPoint(position);

  return piece;
};

function convertPosition(v) {
  return {
    x:v.x,
    y:v.z
  }
}

var pieces = [];

var spawn = function (msg) {
  pieces[msg.character] = createPlayer(convertPosition(msg.position));
}

var addCharacter = function (msg) {
  var id = msg.character || msg.id; // spawn vs snapshot
  pieces[id] = createPiece({
    id: id,
    point: convertPosition(msg.position),
    team: 2,
    miniTexture: whiteTexture
  });
};

var removeCharacter = function (id) {
  console.log('remove character',id)
  var piece = pieces[id];
  if (piece) {
    console.log('removing it for reals')
    delete pieces[id];
    if (pieceContainer.children.indexOf(piece.sprite) !== -1) {
      pieceContainer.removeChild(piece.sprite);
    }
    if (minipieceContainer.children.indexOf(piece.miniSprite) !== -1) {
      minipieceContainer.removeChild(piece.miniSprite);
    }
  }
};

function start(msg) {
  console.log('snapshot',msg);
  createMap(msg.map);
  Object.keys(msg.characters).forEach(function (key) {
    var character = msg.characters[key];
    if (character.type === 'tree') {
      addTree(character)
    } else {
      addCharacter(character);
    }
  });
  createStage();
  running = true;
  requestAnimationFrame(animate);
};

function update(msg) {
  if (msg.action ==='walk' ){
    var p = pieces[msg.character];
    if (p) {
      p.moveToPoint(convertPosition(msg.position));
    }
  } else if (msg.result ==='damaged'){
    var player = pieces[msg.character];
    createHit(player);
  } else if (msg.result === 'spawn') {
    addToChat('new player '+msg.character);
    addCharacter(msg);
  } else if (msg.result === 'shoot') {
    pieces[msg.id] = createShot(msg);
  } else if (msg.result === 'die') {
    removeCharacter(msg.character);
  } else {
    console.log('unhandled update',msg);
  }
}

module.exports = {
  stop: function () {
    running = false;
    Object.keys(pieces).forEach(function (id) {
      removeCharacter(id);
    });
    for (var i = stage.children.length - 1; i >= 0; i--) {	stage.removeChild(stage.children[i]);};
  },
  start:start,
  spawn: spawn,
  removeCharacter:removeCharacter,
  update:update,
};

