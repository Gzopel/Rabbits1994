const scale = 20;

export const convertMapCoordinates= (size) => {
  return {
    x: size.x * scale,
    y: size.z * scale,
  }
};

export const convertCoordinates  = (position, maxY) => {
  const converted = convertMapCoordinates(position);
  return {
    x: converted.x,
    y: maxY - converted.y,
  }
};
