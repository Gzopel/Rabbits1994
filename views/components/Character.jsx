import React from 'react';
import { connect } from 'react-redux';
import controller from '../controller';
import { characterMove } from '../actions/Character';
const ReactPIXI = require('react-pixi');
const PIXI = require('pixi.js');

const Sprite = ReactPIXI.Sprite;

class CharacterComponent extends React.Component {
  constructor() {
    super();
    this.displayName = 'Character';
  }

  componentDidMount() {
    controller.attach((orientation) => this.props.dispatch(characterMove(orientation)))
  }

  componentWillUnmount() {
    controller.detach();
  }

  render() {
    return <Sprite image={'./resources/bunny.png'}
                   x={this.props.position.x}
                   y={this.props.maxY - this.props.position.y}
                   anchor={new PIXI.Point(0.5,0.5)}
                   key='character' />
  }
};

CharacterComponent.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  position: React.PropTypes.shape({
    x: React.PropTypes.number,
    y: React.PropTypes.number,
  }),
};

const mapStateToProps = state => ({
  position: state.Character.position,
  maxY: state.Browser.size.height,
});

const mapDispatchToProps = dispatch => ({
  dispatch: dispatch,
});

const Character = connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterComponent);

export default Character;
