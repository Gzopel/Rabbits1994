/**
 * Created by G on 25/10/2014.
 */
var PIXI = require('pixi');


var tileTexture = PIXI.Texture.fromImage('tile.jpg');

var Tile = function (height,width) {
    PIXI.Sprite.call(this, tileTexture);
    this.height=height;
    this.width=width;
    this.players = new Array();
};
Tile.prototype = Object.create(PIXI.Sprite.prototype);


var Map = module.exports.Map = function (w, h,theight,twidth) {
    PIXI.DisplayObjectContainer.call(this);
    this.board = new Array(w);
    this.width = w*twidth;
    this.height = h*theight;
    var i;
    var j;
    for (i = 0; i<w; i++ ) {
        this.board[i]= new Array(h);
        for (j = 0; j<w; j++ ) {
            var tile = new Tile(theight,twidth);
            tile.position.x= i*tile.width;
            tile.position.y= j*tile.height;
            this.board[i][j]=tile;
            this.addChild(tile);
        }
    }
};
Map.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Map.prototype.add = function(player,x,y){
    var tile = this.board[x][y];
    tile.players.push(player);

    player.position.x = this.position.x+tile.width*(x+0.5);
    player.position.y = this.position.y+tile.height*(y+0.5);
}
