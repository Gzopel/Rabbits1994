export const nextPositionByOrientation = (position, orientation, speed) => {
  console.log(position,orientation,speed);
  return {
    x: position.x + (orientation.x * speed),
    y: position.y + (orientation.y * speed),
  }
}