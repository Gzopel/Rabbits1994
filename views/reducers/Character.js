import ACTIONS from '../actions';

const InitialState = {
  position: { x: 400, y: 400},
  config: {
    speed: 20,
  },
};

const Character = (state = InitialState, action) => {
  switch (action.type) {
    case ACTIONS.CHARACTER.WALK:
      return {
        position: action.characterNextPosition,
        config: state.config,
      };
    default:
      return state;
  }
};

export default Character;
