
var Cell = function (x,y,walkable) {
    this.x=x;
    this.y=y;
    this.walkable=walkable;
    this.pieces = [];
};
Cell.prototype = Object.create(Object.prototype);


var Piece = module.exports.Piece = function (config) {
    this.point = config.point || {x:0,y:0};
    this.hitRadius= config.hitRadius || 15;
    this.orientation = config.orientation || 0;
    this.step = config.step || 15;
    this.sideStep = Math.sqrt((this.step*this.step)/2)
};
Piece.prototype = Object.create(Object.prototype);




var Board = module.exports.Board = function (config) {
    this.width = config.board.width || 600;
    this.height = config.board.height || 600;
    this.xMax = config.board.columns || 10;
    this.yMax = config.board.rows || 10;
    this.xScale=this.width/this.xMax;
    this.yScale=this.height/this.yMax;
    var xIndex;
    var yIndex;
    this.board = new Array(this.xMax);
    for (xIndex = 0; xIndex < this.xMax; xIndex++ ) {
        this.board[xIndex] = new Array(this.yMax);
        for (yIndex = 0; yIndex < this.yMax; yIndex++ ) {
            var w = ((xIndex>0)&&(yIndex>0)&&(xIndex <this.xMax)&& (yIndex<this.yMax-1));
            this.board[xIndex][yIndex] = new Cell(xIndex,yIndex,w);
        }
    }
};
Board.prototype = Object.create(Object.prototype);
Board.prototype.convertToCellCoordinate = function(point){
    return {
        x:Math.floor(point.x/this.xScale),
        y:Math.floor(point.y/this.yScale)
    };
};
Board.prototype.putPieceAtCell = function(piece,x,y){
    this.board[x][y].pieces.push(piece);
    piece.cell = this.board[x][y];
};
Board.prototype.putPieceAtCoordinate = function(piece,point){
    var c = this.convertToCellCoordinate(point);
    this.putPieceAtCell(piece,c.x, c.y);
};

function removeFromArray(e,a){
    var index = a.indexOf(e);
    if (index > -1) {
        a.splice(index,1);
    }
}

Board.prototype.movePiece = function (piece,destination) {
    removeFromArray(piece, piece.cell.pieces);
    this.putPieceAtCoordinate(piece,destination);
};

function sqr(x) { return x * x };
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) };
function distToSegmentSquared(p, v, w) {
    var l2 = dist2(v, w);
    if (l2 == 0) return dist2(p, v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    if (t < 0) return dist2(p, v);
    if (t > 1) return dist2(p, w);
    return dist2(p, { x: v.x + t * (w.x - v.x),
        y: v.y + t * (w.y - v.y) });
};

function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }

Board.prototype.collisionWalk = function(point1,point2,hitRadius){
    var c1 = this.convertToCellCoordinate(point1);
    var c2 = this.convertToCellCoordinate(point2);
    var x;
    var y;
    var dx = c1.x < c2.x ? 1 : -1;
    var dy = c1.y < c2.y ? 1 : -1;
    var xL = c1.x < c2.x ? c2.x+1 : c1.x-1;
    var yL = c1.y < c2.y ? c2.x+1 : c1.y-1;
    var colliding = {
        pieces : [],
        cells : []
    };
    var collidingDistance;
    //simple
    if (!c2 ||!this.board[c2.x] || !this.board[c2.x][c2.y]){
        console.log('debug this!');
        return null;
    }
    var targetCell = this.board[c2.x][c2.y];
    if(!targetCell.walkable){
        colliding.cells.push(targetCell);
    }
    /*
    for (x=c1.x; x!=xL;x=+dx){
        for (y=c1.y; y!=yL;y+=dy){
            var p;
            var cell = this.board[x][y];
            if ( cell.walkable ) {
               for (p=0; p< cell.pieces.length; p++){
                    var piece = cell.pieces[p];
                    var distance = distToSegment(point1,point2, piece.point);
                    var radiusGap = hitRadius + piece.hitRadius;
                    if (distance < radiusGap) {
                        //collision
                        var distToOrig = dist2(c1, piece.point) - radiusGap;
                        colliding.pieces.push(piece);
                        if (!colliding.closest || collidingDistance > distToOrig ){
                            colliding.closest=piece;
                            collidingDistance=distToOrig;
                        }
                    }
                }
            } else {
                colliding.cells.push(cell);
            }
        }
    }*/
    return colliding;
};