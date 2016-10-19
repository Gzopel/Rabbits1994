import React from 'react';
import Map from './Map';
import Character from './Character';
const ReactPIXI = require('react-pixi');
const PIXI = require('pixi.js');

const Stage = React.createFactory(ReactPIXI.Stage);
const MapFactory = React.createFactory(Map);
const CharacterFactory = React.createFactory(Character);

const Game = React.createClass({
  displayName: 'Game',
  render() {
    return Stage(
        { width: this.props.size.width, height: this.props.size.height},
        MapFactory(),
        CharacterFactory({ position : { x: 400, y: 400}})
      );
  }
})

//Game.propTypes = {
//  size: React.PropTypes.shape({
//    width: React.PropTypes.number,
//    height: React.PropTypes.number,
//  }),
//};

export default Game;
