var express = require('express');
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/js', express.static(__dirname + "/js"))
app.use('/lib', express.static(__dirname + "/lib"))
app.use('/dist', express.static(__dirname + "/dist"))
app.use('/assets', express.static(__dirname + "/assets"))
app.use('/textures', express.static(__dirname + "/textures"))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log('user connected', socket.id);
  socket.on('disconnect', function () {
    console.log('user disconnected');
  })
});

io.on('playerSpawn', function (data) {
  io.emit(console.log(data))
});


http.listen(3000, function () {
  console.log('listening on *:3000');
});


io.sockets.on('connection', function (socket) {
  socket.userData = { x: 0, y: 0, z: 0, heading: 0 };//Default values;

  console.log(`${socket.id} connected`);
  socket.emit('setId', { id: socket.id });
  // console.log(socket.userData)
  // socket.on('disconnect', function () {
  //   socket.broadcast.emit('deletePlayer', { id: socket.id });
  // });

  socket.on('updatedPos', function(data) {
    socket.emit('otherSpawn', data);
    if (data.y > 100) {
      console.log(`otherSpawn ${socket.id}`)
      // console.log(data)
      
    }
  })

  socket.on('spawn', function(data) {
    io.sockets.emit('spawn', data);
    if (data.y > 100) {
      console.log(`Spawn: ${socket.id}`)
      console.log(data)
      
    }
  })


});