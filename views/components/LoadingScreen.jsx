import React from 'react';
const ReactPIXI = require('react-pixi');
const PIXI = require('pixi.js');

const Stage = ReactPIXI.Stage;
const Text = ReactPIXI.Text;

class LoadingScreen extends React.Component {
  render() {
    const fontstyle = {font:'40px Times'};
    return <Stage width={this.props.size.width} height={this.props.size.height}>
      <Text text='Loading' x={(this.props.size.width / 2) - 50 } y={this.props.size.height / 2}
            style={fontstyle} anchor={new PIXI.Point(0.5,0)} key='2' />
    </Stage>;
  }
}

LoadingScreen.propTypes = {
  size: React.PropTypes.shape({
    width: React.PropTypes.number,
    height: React.PropTypes.number,
  }),
};

export default LoadingScreen;
