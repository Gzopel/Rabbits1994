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
var msg_type = 'action';
var lastMovement = 0;

function getOrientationVector() {

    function normalizeVector(v){
        const n = Math.sqrt((v.x)*(v.x)  + (v.z)*(v.z));
        return { x: v.x / n, z: v.z / n };
    }

    var orientation = { x:0, z:0};
    if (controls.up && !controls.down) {
        orientation.z = 1;
    } else if (controls.down && !controls.up) {
        orientation.z = -1;
    }
    if (controls.left && !controls.right) {
        orientation.x = -1;
    } else if (controls.right && !controls.left) {
        orientation.x = 1;
    }
    return normalizeVector(orientation);
}

var buildMsg = function(){
  return {
    character: id,
    //action: 'walk',
    type: 'walk',
    orientation: getOrientationVector(),
  };
};


var movementUpdate = function(){
    if ((ticks-lastMovement) > moveLimit ) {
        lastMovement = ticks;
        socket.emit(msg_type,buildMsg() );
    }
};

var actions = [];
actions['W']={
    down:function () {
        controls.up=true;
        movementUpdate();
    },
    up:function () {
        controls.up=false;
    }
};
actions['S']={
    down:function () {
        controls.down=true;
        movementUpdate();
    },
    up:function () {
    controls.down=false;
    }
};
actions['A']={
    down:function () {
        controls.left = true;
        movementUpdate();
    },
    up:function () {
        controls.left=false;
    }
};
actions['D']= {
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
            socket.emit(msg_type, {action: 'basicAttack',character:id});
        }
    }
};
actions['K']={
    'down':function () {
        if ((ticks-lastAttack) > attackLimit ) {
            lastAttack = ticks;
            socket.emit(msg_type, {type: 'shoot',character:id});
        }
    }
};
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

module.exports.detach = function () {
  for(key in actions){
    kd[key].unbindDown(key,actions[key].down);
    kd[key].unbindUp(key,actions[key].up);
  }
  kd.stop();
}


