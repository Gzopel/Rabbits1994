var Cell = function (x,y,walkable) {
    this.x=x;
    this.y=y;
    this.walkable=walkable;
    this.pieces = [];
};
Cell.prototype = Object.create(Object.prototype);


var Piece = module.exports.Piece = function (config) {
    this.point = config.point || {x:0,y:0};
    this.hitRadius= config.hitRadius || 10;
    this.orientation = config.orientation || 0;
    this.step = config.step || 10;
    this.sideStep = Math.sqrt((this.step*this.step)/2);
    this.collidable = config.collidable;
};
Piece.prototype = Object.create(Object.prototype);
Piece.prototype.distanceToPiece= function(target){
    return (Math.sqrt(dist2(this.point, target.point)))-(target.hitRadius + this.hitRadius);
};
Piece.prototype.calculateMovement = function(){
    var destination = {
        x : this.point.x,
        y : this.point.y
    };

    if ( this.orientation === 0 ){//UP
        destination.y+= this.step;
    } else if ( this.orientation === 45 ){ //UP RIGHT
        destination.y+= this.sideStep;
        destination.x+= this.sideStep;
    } else if ( this.orientation === 90 ){ //RIGHT
        destination.x+=this.step;
    } else if ( this.orientation === 135 ){ // DOWN RIGHT
        destination.y-= this.sideStep;
        destination.x+= this.sideStep;
    } else if ( this.orientation === 180 ){ // DOWN
        destination.y-=this.step;
    } else if ( this.orientation === 225 ){ // DOWN LEFT
        destination.y-= this.sideStep;
        destination.x-= this.sideStep;
    } else if ( this.orientation === 270 ){ // LEFT
        destination.x-=this.step;
    } else if ( this.orientation === 315 ){ //UP LEFT
        destination.y+= this.sideStep;
        destination.x-= this.sideStep;
    }
    return destination;
};



var Shot = module.exports.Shot = function (shooter) {
    Piece.call(this,{
        hitRadius:5,
        step:20,
        collidable:false,
        orientation : shooter.orientation,
        point : {x:shooter.point.x,y:shooter.point.y}
    });
    this.owner = shooter.id;
};
Shot.prototype = Object.create(Piece.prototype);




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
            var w = ((xIndex>0)&&(yIndex>0)&&(xIndex <(this.xMax-1))&& (yIndex<this.yMax-1));
            this.board[xIndex][yIndex] = new Cell(xIndex,yIndex,w);
        }
    }
};
Board.prototype = Object.create(Object.prototype);
Board.prototype.convertToCellCoordinate = function (point){
    return {//I SUCK
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

Board.prototype.removePiece = function (piece) {
    if(piece.cell) {
        removeFromArray(piece, piece.cell.pieces);
    }
};

function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
function distToSegmentSquared(p, v, w) {
    var l2 = dist2(v, w);
    if (l2 == 0) return dist2(p, v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    if (t < 0) return dist2(p, v);
    if (t > 1) return dist2(p, w);
    return dist2(p, { x: v.x + t * (w.x - v.x),
        y: v.y + t * (w.y - v.y) });
}

function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }

Board.prototype.collisionWalk = function(playerPiece,target){
    var colliding = {
        pieces : [],
        cells : []
    };

    var targets = [target,{
        x:target.x+playerPiece.hitRadius,
        y:target.y
    },{
        x:target.x-playerPiece.hitRadius,
        y:target.y
    },{
        x:target.x,
        y:target.y-playerPiece.hitRadius
    },{
        x:target.x,
        y:target.y+playerPiece.hitRadius
    }];
    var xScale = this.xScale;
    var yScale = this.yScale;
    var b=this.board;

    var checks = [];
    var check = function(t){
        var c = {
            x: Math.floor(t.x/xScale),
            y: Math.floor(t.y/yScale)
        };

        if (b[c.x] &&  b[c.x][c.y]) {
            var cell = b[c.x][c.y];
            var checked = false;
            checks.forEach(function(past){
                checked = checked ||( past === cell);
            });
            if (!checked) {
                checks.push(cell);
                if(!cell.walkable){
                    colliding.cells.push(c);
                }
                cell.pieces.forEach(function(piece){
                    if (piece.collidable && (piece.id !== playerPiece.id)){
                        var distance = Math.sqrt(dist2(target, piece.point));
                        var radiusGap = playerPiece.hitRadius + piece.hitRadius;
                        if (distance < radiusGap) {
                            console.log('collision '+playerPiece.point.x+','+playerPiece.point.y+'  '+target.x+','+target.y+' '+piece.point.x+','+piece.point.y+'  ');
                            colliding.pieces.push(piece);
                        }
                    }
                });
            }
        }
    };

    targets.forEach(check);



    return colliding;
};