var controller = require('./controller');
var io = require('socket.io-client');
var uuid = require('uuid');
var socket = null;
var renderer = require('./renderer');
var jq = require('jquery');

var options = {
  transports: ['websocket'],
  'force new connection': true,
};  

/*
jq(document).on('keypress',function(event){
   event.preventDefault();
});*/
var mapId = 1;
var prevMapId = 2;
var characterId = uuid.v4();
function joinMap() {
  jq.ajax({
    method: 'GET',
    data: { id: mapId},
    dataType: 'jsonp',
    url: 'http://maps.rabbits:8000/mapInstanceUrl'
  }).done(function (result) {
    console.log('logueado ',result);
    var url = result.url;//.replace('maps.rabbits','172.18.0.2')
    var type = 'anonymous';
    console.log('URL',url);
    socket = io(url,options);
    var reconnect = function (){
      renderer.stop();
      socket.disconnect();
      controller.detach();
      joinMap();
    };
    socket.on('snapshot', renderer.start);
    socket.on('characterUpdate', function (msg) {
      console.log('piece update',msg);
      if ( msg.result === 'warp' && characterId === msg.character ) {
        prevMapId = mapId;
        mapId = msg.destination;
        reconnect();
      } else renderer.update(msg);
    });
    socket.on('rmCharacter', function(msg) {
      if(characterId === msg.character) {
        var swap = mapId;
        mapId = prevMapId;
        prevMapId = swap;
        reconnect();
      } else renderer.removeCharacter(msg.character);
    });
    controller.attach(socket,characterId,controller.actions);
    renderer.attach(characterId);
    socket.emit('join',{ character: characterId, type: type, origin: prevMapId });
  });
}

joinMap();

