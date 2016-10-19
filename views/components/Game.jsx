import React from 'react';
import Map from './Map';
const ReactPIXI = require('react-pixi');
const PIXI = require('pixi.js');

const Stage = ReactPIXI.Stage;

class Game extends React.Component {
  render() {
    return <Stage width={this.props.size.width} height={this.props.size.height}>
          <Map />
        </Stage>;
  }
}

Game.propTypes = {
  size: React.PropTypes.shape({
    width: React.PropTypes.number,
    height: React.PropTypes.number,
  }),
};

export default Game;