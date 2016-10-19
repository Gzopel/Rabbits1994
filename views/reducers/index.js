import { combineReducers } from 'redux';
import Browser from './Browser';
// import Camera from './Camera';
import Character from './Character';
import Map from './Map';

const rootReducer = combineReducers({
  Browser,
  // Camera,
  Character,
  Map,
});

export default rootReducer;