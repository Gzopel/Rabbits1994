import React from 'react';
import LoadingScreen from './LoadingScreen';
import Game from './Game';


class GameLoader extends React.Component {
  constructor() {
    super();
    this.didLoad = false;
  }

  componentDidMount() {
    this.timeout = setTimeout(() => {
      this.didLoad = true;
      this.forceUpdate();// fake server load
      clearTimeout(this.timeout);
    }, 2000);
  }

  render() {
    if (!this.didLoad) {
      return <LoadingScreen size={ { width: 800, height: 800 } }/>
    }
    return <Game size={ { width: 800, height: 800 } }/>
  }
}

export default GameLoader;
