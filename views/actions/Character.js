import ACTIONS from '../actions';
import { nextPositionByOrientation } from '../helpers/Movement';

export const characterMoveSuccess = (characterNextPosition) => ({
  type: ACTIONS.CHARACTER.WALK,
  characterNextPosition: characterNextPosition
});

export const characterMove = orientation => (dispatch, getState) => {
  if (!orientation) {
    return;
  }

  const { Character } = getState();

  const characterNextPosition = nextPositionByOrientation(
    Character.position, orientation, Character.config.speed
  );
  
  dispatch(characterMoveSuccess(characterNextPosition));
};

export default characterMove;
