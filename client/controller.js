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



var Controller = module.exports.Controller = function(socket,id){

    var buildMsg = function(){
        var msg = {
            action: 'move',
            movement:{
                owner:id,
                orientation:0
            }
        };

        if (controls.up ) {
            if (controls.left){
                msg.movement.orientation = 315;
            } else if (controls.right) {
                msg.movement.orientation = 45;
            } else {
                msg.movement.orientation = 0;
            }
        } else if (controls.down ) {
            if (controls.left){
                msg.movement.orientation = 225;
            } else if (controls.right) {
                msg.movement.orientation = 135;
            } else {
                msg.movement.orientation = 180;
            }
        } else if (controls.left) {
            msg.movement.orientation = 270;
        } else if (controls.right) {
            msg.movement.orientation = 90;
        }

        return msg;
    };
    var movementUpdate = function(){
        if ((ticks-lastMovement) > moveLimit ) {
            lastMovement = ticks;
            socket.emit(msg_type,buildMsg() );
        }
    };

    kd['UP'].down(function () {
        controls.up=true;
        movementUpdate();
    });
    kd['UP'].up(function () {
        controls.up=false;
    });
    kd['DOWN'].down(function () {
        controls.down=true;
        movementUpdate();
    });
    kd['DOWN'].up(function () {
        controls.down=false;
    });
    kd['LEFT'].down(function () {
        controls.left=true;
        movementUpdate();
    });
    kd['LEFT'].up(function () {
        controls.left=false;
    });
    kd['RIGHT'].down(function () {
        controls.right=true;
        movementUpdate();
    });
    kd['RIGHT'].up(function () {
        controls.right=false;
    });

    kd['Q'].down(function () {
        if ((ticks-lastAttack) > attackLimit ) {
            lastAttack = ticks;
            socket.emit(msg_type, {action: 'attack',owner:id});
        }
    });
    kd['W'].down(function () {
        if ((ticks-lastAttack) > attackLimit ) {
            lastAttack = ticks;
            socket.emit(msg_type, {action: 'shoot',owner:id});
        }
    });
    kd['E'].down(function () {
        console.log('block');
        if ((ticks-lastAttack) > attackLimit ) {
            lastAttack = ticks;
            socket.emit(msg_type, {action: 'block',owner:id});
        }
    });
    //kd['R'].down(function () {
    //});

    kd.run(function () {
        ticks++;
        kd.tick();
    });

};
Controller.prototype=Object.create(Object.prototype);


