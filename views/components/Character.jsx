import React from 'react';
const ReactPIXI = require('react-pixi');
const PIXI = require('pixi.js');

const Sprite = ReactPIXI.Sprite;

const Character = React.createClass({
  displayName: 'Character',
  render() {
    return <Sprite image={'./resources/bunny.png'}  x={this.props.position.x} y={this.props.position.y} anchor={new PIXI.Point(0.5,0.5)} key='character' />
  }
});

export default Character;