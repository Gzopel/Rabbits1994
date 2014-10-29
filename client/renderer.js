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
var player = new PIXI.Sprite(playerTexture);
//create stage
var stage = new PIXI.Stage();
stage.addChild(map);
stage.addChild(player);

var animate = function () {
   // game.tick();
    renderer.render(stage);
    requestAnimationFrame(animate);
};

module.exports ={
    attach :function(socket) {
        socket.on('piece update', function (msg) {
            player.position.x = msg.to.x;
            player.position.y = msg.to.y;
        });
    },
    start: function() {
        requestAnimationFrame(animate);
    }
};

