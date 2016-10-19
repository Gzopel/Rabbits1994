import keydrown from 'keydrown';

let dispatch = null;

const controls = {
  up : false,
  down : false,
  left : false,
  right : false
};

const getOrientationVector = () => {

  const normalizeVector = (v) => {
    const n = Math.sqrt((v.x)*(v.x)  + (v.y)*(v.y));
    return { x: v.x / n, y: v.y / n };
  }

  const orientation = { x:0, y:0};
  if (controls.up && !controls.down) {
    orientation.y = 1;
  } else if (controls.down && !controls.up) {
    orientation.y = -1;
  }
  if (controls.left && !controls.right) {
    orientation.x = -1;
  } else if (controls.right && !controls.left) {
    orientation.x = 1;
  }
  return normalizeVector(orientation);
}

const actions = [];
const buildKeyController = (key) => {
  return {
    down() {
      controls[key]=true;
      dispatch && dispatch(getOrientationVector());
    },
    up() {
      controls[key]=false;
    }
  }
};

// const shootKey = {
//   'down':function () {
//     if ((ticks-lastAttack) > attackLimit ) {
//       lastAttack = ticks;
//       socket.emit(msg_type, {type: 'shoot',character:id});
//     }
//   }
// };

actions['UP'] = buildKeyController('up');
actions['LEFT'] = buildKeyController('left');
actions['RIGHT'] = buildKeyController('right');
actions['DOWN'] = buildKeyController('down');
// actions['SPACE'] = shootKey;


export const controller = {
  attach(dispatcher) {
    dispatch = dispatcher;
    for(const key in actions){
      keydrown[key].down(actions[key].down);
      keydrown[key].up(actions[key].up);
    }
    keydrown.run(() => {
      keydrown.tick();
    });
  },
  detach() {
    dispatch = null;
    for(const key in actions){
      keydrown[key].unbindDown(key,actions[key].down);
      keydrown[key].unbindUp(key,actions[key].up);
    }
    keydrown.stop();
  }
}

export default controller;
