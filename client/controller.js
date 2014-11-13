var kd = require('keydrown');
var socket = null;

var ticks = 0;
var lastAttack = 0;
var moveLimit = 4;
var attackLimit = 20;
var controls = {
    up : false,
    down : false,
    left : false,
    right : false
};
var msg_type = 'player action';
var lastMovement = 0;

var getOrientation = function(){
    var orientation;
    if (controls.up ) {
        if (controls.left){
            orientation = 315;
        } else if (controls.right) {
            orientation = 45;
        } else {
            orientation = 0;
        }
    } else if (controls.down ) {
        if (controls.left){
            orientation = 225;
        } else if (controls.right) {
            orientation = 135;
        } else {
            orientation = 180;
        }
    } else if (controls.left) {
        orientation = 270;
    } else if (controls.right) {
        orientation = 90;
    }
    return orientation;
};

var Controller = module.exports.Controller = function(socket,id){

    var buildMsg = function(){
        var msg = {
            action: 'move',
            movement:{
                owner:id,
                orientation:getOrientation()
            }
        };

        return msg;
    };
    var movementUpdate = function(){
        if ((ticks-lastMovement) > moveLimit ) {
            lastMovement = ticks;
            socket.emit(msg_type,buildMsg() );
        }
    };

    kd['W'].down(function () {
        controls.up=true;
        movementUpdate();
    });
    kd['W'].up(function () {
        controls.up=false;
    });
    kd['S'].down(function () {
        controls.down=true;
        movementUpdate();
    });
    kd['S'].up(function () {
        controls.down=false;
    });
    kd['A'].down(function () {
        controls.left=true;
        movementUpdate();
    });
    kd['A'].up(function () {
        controls.left=false;
    });
    kd['D'].down(function () {
        controls.right=true;
        movementUpdate();
    });
    kd['D'].up(function () {
        controls.right=false;
    });

    kd['J'].down(function () {
        if ((ticks-lastAttack) > attackLimit ) {
            lastAttack = ticks;
            socket.emit(msg_type, {action: 'attack',owner:id});
        }
    });
    kd['K'].down(function () {
        if ((ticks-lastAttack) > attackLimit ) {
            lastAttack = ticks;
            socket.emit(msg_type, {action: 'shoot',owner:id,orientation:getOrientation()});
        }
    });/*
    kd['E'].down(function () {
        console.log('block');
        if ((ticks-lastAttack) > attackLimit ) {
            lastAttack = ticks;
            socket.emit(msg_type, {action: 'block',owner:id});
        }
    });
     kd['R'].down(function () {
    });*/

    kd.run(function () {
        ticks++;
        kd.tick();
    });

};
Controller.prototype=Object.create(Object.prototype);


