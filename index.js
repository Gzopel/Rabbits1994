var PIXI  = require('pixi');
var Game = require('./game').Game;


var w=window.innerWidth*0.98;
var h=window.innerHeight*0.98;

var renderer = PIXI.autoDetectRenderer(w,h);

document.body.appendChild(renderer.view);

var game = new Game(w,h);

var animate = function () {
    game.tick();
    renderer.render(game);
    requestAnimationFrame(animate);
};

requestAnimationFrame(animate);

