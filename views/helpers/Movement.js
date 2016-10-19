export const nextPositionByOrientation = (position, orientation, speed) => {
  return {
    x: position.x + (orientation.x * speed),
    y: position.y + (orientation.y * speed),
  }
}
