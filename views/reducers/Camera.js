import ACTIONS from '../actions';

const InitialState = {
  position: { x: 0, y: 0},
};

const Character = (state = InitialState, action) => {
  switch (action.type) {
    case ACTIONS.CAMERA.MOVE:
      return {
        position: action.nextPosition,
      };
    default:
      return state;
  }
};

export default Character;
