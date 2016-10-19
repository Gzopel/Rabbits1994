import React from 'react';
import Map from './Map';
const ReactPIXI = require('react-pixi');
const PIXI = require('pixi.js');

const Sprite = React.createFactory(ReactPIXI.Sprite);

class Game extends React.Component {
  render() {
    return <Sprite image={'./resources/bunny.png'}  x={this.props.position.x} y={this.props.position.y} />
  }
}

Game.propTypes = {
  position: React.PropTypes.shape({
    x: React.PropTypes.number,
    y: React.PropTypes.number,
  }),
};

export default Game;