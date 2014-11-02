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
var players = [];
/*var player = new PIXI.Sprite(playerTexture);
player.width=20;
player.height=30;
player.id=0;
player.visible=false;
players[0]=player;*/
//create stage
var stage = new PIXI.Stage();
stage.addChild(map);

var animate = function () {
   // game.tick();
    renderer.render(stage);
    requestAnimationFrame(animate);
};
var myId;
module.exports ={
    attach :function(socket,id) {
        myId = id;
        socket.on('piece update', function (msg) {
            console.log('move',msg);
            if (msg.type ==='walk' && players[msg.pieceId]){
                var p = players[msg.pieceId];
                p.position.x = msg.to.x-p.width/2;
                p.position.y = (h - msg.to.y ) -p.height/2; // eje y invertido
            }
        });

        socket.on('players update', function (msg) {
            console.log('add',msg);
            if (msg.action === 'add'){
                msg.all.forEach( function(player){
                    if (!players[player.id]){
                        players[player.id] = new PIXI.Sprite(playerTexture);
                        players[player.id].width=20;
                        players[player.id].height=30;
                        players[player.id].visible=true;
                        players[player.id].position.x = player.point.x-20;
                        players[player.id].position.y = (h - player.point.y ) -15; // eje y invertido
                        players[player.id].id=player.id;
                        stage.addChild(players[player.id]);
                    }
                });
            } else if (msg.action === 'remove'){
                if (players[msg.target]){
                    stage.removeChild(players[msg.target]);
                    players.splice(msg.target,1);
                }
            }
        });
    },
    start: function() {
        requestAnimationFrame(animate);
    }
};

