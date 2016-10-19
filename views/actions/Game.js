import ACTIONS from '../actions';
import { convertCoordinates, convertMapCoordinates } from '../helpers/MapAdapter';

const io = require('socket.io-client');
const uuid = require('uuid');;
const jq = require('jquery');

const options = {
  transports: ['websocket'],
  'force new connection': true,
};

let mapId = 1;
let prevMapId = 2;
const characterId = uuid.v4();
export const join = () => (dispatch) => {
  jq.ajax({
    method: 'GET',
    data: { id: mapId},
    dataType: 'jsonp',
    url: 'http://maps.rabbits:8000/mapInstanceUrl'
  }).done((result) => {
    console.log('logueado ',result);
    const url = result.url;//.replace('maps.rabbits','172.18.0.2')
    const type = 'anonymous';
    console.log('URL',url);
    const socket = io(url,options);
    const reconnect = function (){
      //renderer.stop();
      socket.disconnect();
      join();
    };
    socket.on('snapshot', (snapshot) => {
      const size = convertMapCoordinates(snapshot.map.size);
      const convertPosition = (element) => ({
        ...element,
        position: convertCoordinates(element.position, size.y),
      });
      dispatch({
        type: ACTIONS.GAME.SNAPSHOT,
        map: {
          size : size,
          spawnLocations : snapshot.map.spawnLocations.map(convertPosition),
          characters : Object.entries(snapshot.characters).map(entry => convertPosition(entry[1])),
        },
      });
    });
    socket.on('characterUpdate', function (msg) {
     // console.log('piece update',msg);
      if(msg.result === 'damaged' && msg.remainingHealth <= 0 && characterId === msg.character) {
        const swap = mapId;
        mapId = prevMapId;
        prevMapId = swap;
        reconnect();
      } else if ( msg.result === 'spawn' && characterId === msg.character ) {
        //renderer.spawn(msg);
      } else if ( msg.result === 'warp' && characterId === msg.character ) {
        prevMapId = mapId;
        mapId = msg.destination;
        reconnect();
      }// else renderer.update(msg);
    });
    socket.on('rmCharacter', function(msg) {
      //renderer.removeCharacter(msg.character);
    });
    socket.emit('join',{ character: characterId, type: type, origin: prevMapId });
  });
}

