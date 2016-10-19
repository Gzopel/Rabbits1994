import ACTIONS from '../actions';

export const cameraMoveSuccess = (nextPosition) => ({
  type: ACTIONS.CAMERA.MOVE,
  nextPosition: nextPosition
});

export const cameraMove = nextPosition => (dispatch) => {
  if (!nextPosition) {
    return;
  }
  dispatch(cameraMoveSuccess(nextPosition));
};

export default cameraMove;
