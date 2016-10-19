import React from 'react';
import Map from './Map';
import Character from './Character';

const ReactPIXI = require('react-pixi');
const PIXI = require('pixi.js');

const Stage = React.createFactory(ReactPIXI.Stage);
const MapFactory = React.createFactory(Map);
const CharacterFactory = React.createFactory(Character);

class GameComponent  extends React.Component {
  constructor() {
    super();
    this.displayName= 'Game';
  }
  
  render() {
    console.log("Size",this.props.size);
    return Stage(
        this.props.size,
        MapFactory({ size: this.props.size}),
        CharacterFactory({ position: { x: this.props.size.width / 2, y: this.props.size.height / 2}})
      );
  }
};
GameComponent.propTypes = {
  size: React.PropTypes.shape({
    width: React.PropTypes.number,
    height: React.PropTypes.number,
  }),
};

export default GameComponent;
