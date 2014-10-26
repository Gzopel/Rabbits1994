var PIXI = require('pixi');
var kd = require('keydrown');
var Player = require('./player').Player;
var Dummy = require('./player').Dummy;
var Map = require('./map').Map;


var Game = module.exports.Game = function (w, h) {
    PIXI.Stage.call(this);
    this.tsize = 64;
    this.map = new Map(10,10,this.tsize,this.tsize);
    this.map.position.x = (w - this.map.width)/2;
    this.map.position.y = (h - this.map.height)/2;
    this.addChild(this.map);

    this.player = new Player('UP','LEFT','DOWN','RIGHT');
    this.map.add(this.player,1,1);

    this.players = new PIXI.DisplayObjectContainer();
    this.players.addChild(this.player);

    var p2 = new Dummy();
    this.map.add(p2,1,8);
    p2.tint = Math.random() * 0xFFFFFF;
    this.players.addChild(p2);

    var p3 = new Dummy();
    this.map.add(p3,8,1);
    p3.tint = Math.random() * 0xFFFFFF;
    this.players.addChild(p3);

    var p4 = new Dummy();
    this.map.add(p4,8,8);
    p4.tint = Math.random() * 0xFFFFFF;
    this.players.addChild(p4);

    this.addChild(this.players);

};
Game.prototype = Object.create(PIXI.Stage.prototype);
/*
Game.prototype.playersInArea = function(x,y,r){
    var players = [];
    var i;
    for (i = 0; i<this.players.length; i++){
        var player = this.players[i];
        var distance = Math.sqrt(Math.pow(player.position.x-x)+Math.pow(player.position.y-y));
        if (distance < r) {
            players.push(player);
        }
    }
    return players;
};

Game.prototype.checkColitions = function(){
    var i;
    for (i = 0; i<this.players.length-1; i++){
        var e1 = this.players[i];
        for (j = 1; i<this.players.length; i++){
            var e2 = this.players[j];

            var distance = Math.sqrt(Math.pow(e1.position.x-e2.position.x)+Math.pow(e1.position.y-e2.position.y));
            if (distance < e1.r+e2.r) {
                //handle collision
            }

        }

    }
};*/

Game.prototype.tick = function() {
    kd.tick();
    var i;
    var j;
    for (i = 0; i<this.players.children.length; i++){
        var p1 = this.players.children[i];
        var e1 = p1.getTargetLocation();
        for (j = 0; j<this.players.children.length; j++){
            if ( j !==  i ) {
                var e2 = this.players.children[j];

                var dx =e1.x - e2.position.x;
                var dy = e1.y - e2.position.y;
                var distance = Math.sqrt((dx*dx)+(dy*dy));
                console.log(distance);
                if (distance < (p1.r + e2.r)) {


                    p1.moveV.x = 0;
                    p1.moveV.y = 0;
                }
            }
        }
        p1.move();
    }
};

