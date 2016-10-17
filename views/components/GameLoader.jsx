var React = require('react');
var ReactPIXI = require('react-pixi');
var PIXI = require('pixi.js');

var Stage = ReactPIXI.Stage;
var Text = ReactPIXI.Text;

class GameLoader extends React.Component {
  render() {
    const fontstyle = {font:'40px Times'};
    return <Stage width={800} height={800}>
      <Text text='Loading' x={10} y={10} style={fontstyle} anchor={new PIXI.Point(0.5,0)} key='2' />
    </Stage>;
  }
}

export default GameLoader;
