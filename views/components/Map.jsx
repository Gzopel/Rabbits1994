import React from 'react';
const ReactPIXI = require('react-pixi');
const PIXI = require('pixi.js');

const TilingSprite = ReactPIXI.TilingSprite;

class Map extends React.Component {
  render() {
    return <TilingSprite image={'./resources/grass.jpg'} tileScale={new PIXI.Point(.25,.25)} width={800} height={800} />
  }
}

export default Map;
