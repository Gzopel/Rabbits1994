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
        this.props.size,
        MapFactory({ size: this.props.size}),
        CharacterFactory()
      );
  }
})

export default Game;
