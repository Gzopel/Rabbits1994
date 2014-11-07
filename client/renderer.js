var PIXI  = require('pixi');

var w=600;//window.innerWidth;
var h=600;//window.innerHeight;

var renderer = PIXI.autoDetectRenderer(w,h);

document.body.appendChild(renderer.view);

// create map
var tileTexture = PIXI.Texture.fromImage('resources/tile.jpg');
var map = new PIXI.DisplayObjectContainer();
var i;
var j;
var side = 60;
for (i = 0; i<10; i++ ) {
    for (j = 0; j<10; j++ ) {
        if ((i == 0)||(j == 0)||(i == 9)||(j == 9)){
            var sprite = new PIXI.Sprite(tileTexture);
            sprite.width=side;
            sprite.height=side;
            sprite.position.x= i*side;
            sprite.position.y= j*side;
            map.addChild(sprite);
        }
    }
}
//create players
var playerTexture = PIXI.Texture.fromImage('resources/bunny.png');
var hitTexture = PIXI.Texture.fromImage('resources/hit.png');
var players = [];

//create stage
var stage = new PIXI.Stage();
stage.addChild(map);

var animate = function () {
   // game.tick();
    players.forEach(function(player){
        if(player.gotHit){

            //animate player
        }
    });
    renderer.render(stage);
    requestAnimationFrame(animate);
};
var myId;
module.exports ={
    attach :function(socket,id) {
        myId = id;
        socket.on('piece update', function (msg) {
            console.log('piece update',msg);
            if (msg.type ==='walk' && players[msg.pieceId]){
                var p = players[msg.pieceId];
                p.position.x = msg.to.x-p.width/2;
                p.position.y = (h - msg.to.y ) -30; // eje y invertido
            } else if (msg.type ==='hit'){
                var player = players[msg.pieceId];
                var hit =  new PIXI.Sprite(hitTexture);
                hit.scale.x=2;
                hit.scale.y=2;
                hit.position.x=player.position.x;
                hit.position.y=player.position.y+10;
                stage.addChild(hit);
                setTimeout(function(){
                    hit.visible=false;
                    stage.removeChild(hit);
                    delete hit;
                },250);
            }
        });

        socket.on('players update', function (msg) {
            console.log('player update',msg);
            if (msg.action === 'add'){
                msg.all.forEach( function(player){
                    if (!players[player.id]){
                        players[player.id] = new PIXI.Sprite(playerTexture);
                        players[player.id].width=26;
                        players[player.id].height=37;
                        players[player.id].visible=true;
                        players[player.id].position.x = player.point.x-13;
                        players[player.id].position.y = (h - player.point.y ) -30; // eje y invertido
                        players[player.id].id=player.id;
                        stage.addChild(players[player.id]);
                    }
                });
            } else if (msg.action === 'remove'){
                if (players[msg.target]){
                    stage.removeChild(players[msg.target]);
                    delete players[msg.target];
                }
            }
        });
    },
    start: function() {
        requestAnimationFrame(animate);
    }
};

