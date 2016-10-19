import React from 'react';
import { connect } from 'react-redux';
const ReactPIXI = require('react-pixi');
const PIXI = require('pixi.js');

const TilingSprite = ReactPIXI.TilingSprite;

class MapComponent extends React.Component {
  render() {
    return <TilingSprite image={'./resources/grass.jpg'}
                         tileScale={new PIXI.Point(.25,.25)}
                         width={this.props.size.x}
                         height={this.props.size.y} />
  }
}

MapComponent.propTypes = {
  size: React.PropTypes.shape({
    width: React.PropTypes.number,
    height: React.PropTypes.number,
  }),
};


const mapStateToProps = state => ({
  size: state.Map.size,
});

const Map = connect(mapStateToProps)(MapComponent);

export default Map;
