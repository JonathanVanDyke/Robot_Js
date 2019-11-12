var express = require('express'); //OK
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);

const port = process.env.PORT || 8080

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


http.listen(port, function () {
  console.log(`listening on PORT:${port}`);
});


io.sockets.on('connection', function (socket) {
  socket.userData = { x: 0, y: 0, z: 0, heading: 0 };//Default values;

  socket.emit('setId', { id: socket.id });

  let delayData = { id: null, x: 0, y: 0, z: 0, h: 0, pb: 0 };
  socket.on('updatedPos', function(data) {

      socket.userData.id = data.id;
      socket.userData.x = data.x;
      socket.userData.y = data.y;
      socket.userData.z = data.z;
      socket.userData.h = data.h;
      socket.userData.pb = data.z;
      socket.userData.firing = data.firing;
      socket.userData.hp = data.hp;
      // servoFunc(data.firing);
  })
  
  socket.on('init', function(data) {
    io.sockets.emit('init', data);
    console.log(`Spawn: ${socket.id}`)
    console.log(data)
  })



  // //Arduino
  // const { Board, Servo } = require("johnny-five");
  // const keypress = require("keypress");

  // keypress(process.stdin);

  // const board = new Board({
  //   port: '/dev/tty.usbmodem14101'
  // });
  
  // const servoFunc = (firing) => {

  //   board.on("ready", () => {
  //     console.log(board.port)
  
  //     console.log("Use Up and Down arrows for CW and CCW respectively. Space to stop.");
  
  //     const servo = new Servo.Continuous(10);
      
  
  //     process.stdin.resume();
  //     process.stdin.setEncoding("utf8");
  //     // process.stdin.setRawMode(true);

  //     if (firing) {
  //       servo.to(90);
  //     } else {
  //       servo.to(70);
  //     }
  //     servo.stop();
      
  
  //     // servo.ccw();
  
  //     process.stdin.on("keypress", (ch, key) => {
  
  //       if (!key) {
  //         return;
  //       }
  
  //       if (key.name === "q") {
  //         console.log("Quitting");
  //         process.exit();
  //       } else if (key.name === "up") {
  //         console.log("CW");
  //         servo.cw();
  //       } else if (key.name === "down") {
  //         console.log("CCW");
  //         servo.ccw();
  //       } else if (key.name === "space") {
  //         console.log("Stopping");
  //         servo.stop();
  //       }
  //     });
  //   });
  // }



});


setInterval(function () {
  const nsp = io.of('/');
  let pack = [];
  console.log('------------------------------------')

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
        firing: socket.userData.firing,
        hp: socket.userData.hp,
        // action: socket.userData.action
      });
    }
  }
  console.log(`pack length: ${pack.length}`)
  console.log(`pack contents: ${pack}`)
  if (pack.length > 0) io.emit('otherSpawn', pack);
}, 15);


