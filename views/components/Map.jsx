import React from 'react';
const ReactPIXI = require('react-pixi');
const PIXI = require('pixi.js');

const TilingSprite = ReactPIXI.TilingSprite;

class Map extends React.Component {
  render() {
    return <TilingSprite image={'./resources/grass.jpg'}
                         tileScale={new PIXI.Point(.25,.25)}
                         width={this.props.size.width}
                         height={this.props.size.height} />
  }
}

Map.propTypes = {
  size: React.PropTypes.shape({
    width: React.PropTypes.number,
    height: React.PropTypes.number,
  }),
};

export default Map;
