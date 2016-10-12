var kd = require('keydrown');
var socket = null;
var id;
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



//module.exports.attach
//module.exports.deattach
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

var actions = [];
var moveUpKey = {
    down:function () {
        controls.up=true;
        movementUpdate();
    },
    up:function () {
        controls.up=false;
    }
};
var moveDownKey = {
    down:function () {
        controls.down=true;
        movementUpdate();
    },
    up:function () {
        controls.down=false;
    }
};
var  moveLeftKey = {
    down:function () {
        controls.left = true;
        movementUpdate();
    },
    up:function () {
        controls.left=false;
    }
};
var moveRightKey = {
    'down': function () {
        controls.right = true;
        movementUpdate();
    },
    'up': function () {
        controls.right = false;
    }
};
actions['J']={
    'down':function () {
        if ((ticks-lastAttack) > attackLimit ) {
            lastAttack = ticks;
            socket.emit(msg_type, {action: 'attack',owner:id});
        }
    }
};
var shootKey = {
    'down':function () {
        if ((ticks-lastAttack) > attackLimit ) {
            lastAttack = ticks;
            socket.emit(msg_type, {action: 'shoot',owner:id,orientation:getOrientation()});
        }
    }
};

actions['W'] = moveUpKey;
actions['S'] = moveDownKey;
actions['A'] = moveLeftKey;
actions['D'] = moveRightKey;
actions['UP'] = moveUpKey;
actions['LEFT'] = moveLeftKey;
actions['RIGHT'] = moveRightKey;
actions['DOWN'] = moveDownKey;
actions['K'] = shootKey;
actions['ENTER'] = shootKey;
actions['SPACE'] = shootKey;

module.exports.actions =actions;

/*
* TODO:
*   - provide support for mouse, touchscreen, joysticks, etc.
*   - should be disabled when user has to type
*
* */
module.exports.attach = function(clientSocket,ownerId,actions){
    id=ownerId;
    socket=clientSocket;
    for(key in actions){
        kd[key].down(actions[key].down);
        kd[key].up(actions[key].up);
    }
    kd.run(function () {
        ticks++;
        kd.tick();
    });

};


