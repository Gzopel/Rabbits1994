import React from 'react';
const ReactPIXI = require('react-pixi');
const PIXI = require('pixi.js');

var TilingSprite = ReactPIXI.TilingSprite;

class Map extends React.Component {
  render() {
    return <TilingSprite image={'./resources/grass.jpg'} width={800} height={800} />
  }
}

export default Map;