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


http.listen(8080, function () {
  console.log('listening on *:3000');
});


io.sockets.on('connection', function (socket) {
  socket.userData = { x: 0, y: 0, z: 0, heading: 0 };//Default values;

  // console.log(`${socket.id} connected`);
  socket.emit('setId', { id: socket.id });
  // console.log(socket.userData)
  // socket.on('disconnect', function () {
  //   socket.broadcast.emit('deletePlayer', { id: socket.id });
  // });

  //SENDS DELTA POS TO SERVER FROM CLIENT
  //SERVER BROADCASTS TO CLIENTS... (? CHECK NOW)
  let delayData = { id: null, x: 0, y: 0, z: 0, h: 0, pb: 0 };
  socket.on('updatedPos', function(data) {

    //Emits all the data to other users... ALL THE TIME
    //Slow down with interval...?
    //Package... socket.userData?

    // socket.broadcast.emit('otherSpawn', data);

    // if (data.y > 100) {
      // console.log(`otherSpawn ${socket.id}`)
      // console.log(data)

      // //TESTING
      // delayData.id = data.id;
      // delayData.x = data.x;
      // delayData.y = data.y;
      // delayData.z = data.z;
      // delayData.h = data.h;
      // delayData.pb = data.ph;

      //Add to sockets so we can throttle socket emits outside of connect loop
      socket.userData.id = data.id;
      socket.userData.x = data.x;
      socket.userData.y = data.y;
      socket.userData.z = data.z;
      socket.userData.h = data.h;
      socket.userData.pb = data.z;

    // }
    // socket.id = data.id;
    // socket.userData.x = data.x;
    // socket.userData.y = data.y;
    // socket.userData.z = data.z;
    // // socket.userData.h = data.h;
    // socket.userData.pb = data.z;

  })
  
  //Interval is being set on every connection...?
  // setInterval(() => {
  //   socket.broadcast.emit('otherSpawn', delayData);
  // }, 6000)
  

  //SENDS INITIAL POSITION TO SERVER FROM CLIENT
  //WORKS
  // let delayData = {id: null, x: 0, y: 0, z: 0, h: 0, pb: 0};
  socket.on('init', function(data) {
    io.sockets.emit('init', data);
    console.log(`Spawn: ${socket.id}`)
    console.log(data)
  })
  setInterval(() => {
    // if (delayData.y > 200) {
      // io.sockets.emit('init', delayData);
      // console.log(delayData)
    // }
  }, 30)


});

// setInterval(() => {
//   if (io.sockets[0]) {
//     io.sockets[0].emit('otherSpawn', delayData);
//   }
// }, 6000)

setInterval(function () {
  const nsp = io.of('/');
  let pack = [];
  // console.log('heartbeat')
  console.log('------------------------------------')
  // debugger
  // console.log(nsp.connected)

  for (let id in io.sockets.sockets) {
    const socket = nsp.connected[id];
    // console.log(socket.id)
    console.log(socket.userData.id)
    //Only push sockets that have been initialised
    if (socket.userData.id !== undefined) {
      console.log('inside cond')
      pack.push({
        id: socket.id,
        // model: socket.userData.model,
        // colour: socket.userData.colour,
        x: socket.userData.x,
        y: socket.userData.y,
        z: socket.userData.z,
        h: socket.userData.h,
        // heading: socket.userData.heading,
        pb: socket.userData.pb,
        // action: socket.userData.action
      });
    }
  }
  console.log(`pack length: ${pack.length}`)
  console.log(`pack contents: ${pack}`)
  if (pack.length > 0) io.emit('otherSpawn', pack);
}, 20);

// setInterval(() => {

// }, 1000)