import ACTIONS from '../actions';

const InitialState = {
  size: { x: 0, y: 0},
  spawnLocations: [],
};

const Map = (state = InitialState, action) => {
  switch (action.type) {
    case ACTIONS.GAME.SNAPSHOT:
      return {
        size: action.map.size,
        spawnLocations: action.map.spawnLocations,
      };
    default:
      return state;
  }
};

export default Map;
