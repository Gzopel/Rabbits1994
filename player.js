var PIXI  = require('pixi');
var kd = require('keydrown');


var Movable = function (Texture) {
    PIXI.Sprite.call(this, Texture);
    this.speed=5;
    this.moveV = {x:0,y:0};
};
Movable.prototype = Object.create(PIXI.Sprite.prototype);
Movable.prototype.move = function () {
    this.position.x += this.moveV.x*this.speed;
    this.position.y += this.moveV.y*this.speed;
};
Movable.prototype.getTargetLocation = function () {
    return {
        x:this.position.x + this.moveV.x*this.speed,
        y:this.position.y + this.moveV.y*this.speed
    }
};

var playerTexture = PIXI.Texture.fromImage('bunny.png');

var Dummy = module.exports.Dummy = function() {
    Movable.call(this, playerTexture);
    this.scale.x = 1;
    this.scale.y = 1;
    this.r=10;
};
Dummy.prototype = Object.create(Movable.prototype);

var Player =  module.exports.Player = function(up, left, down, right) {
    Dummy.call(this);

    var t = this;
    kd[up].down(function() {
        t.moveV.y=-1;
    });
    kd[down].down(function() {
        t.moveV.y=1;
    });
    kd[left].down(function() {
        t.moveV.x = -1;
    });
    kd[right].down(function () {
        t.moveV.x = 1;
    });
    kd[up].up(function() {
        t.moveV.y=0;
    });
    kd[down].up(function() {
        t.moveV.y=0;
    });
    kd[left].up(function() {
        t.moveV.x = 0;
    });
    kd[right].up(function () {
        t.moveV.x = 0;
    });
};
Player.prototype = Object.create(Dummy.prototype);
