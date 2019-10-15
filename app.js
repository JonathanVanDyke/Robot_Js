var express = require('express');
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);
// console.log(io);
// app.get('/', function (req, res) {
//   res.sendFile(__dirname + '/index.html');
// });

io.on('connection', function (socket) {
  console.log('a user connected');
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});



app.use('/js', express.static(__dirname + "/js"))
app.use('/lib', express.static(__dirname + "/lib"))
app.use('/dist', express.static(__dirname + "/dist"))
app.use('/assets', express.static(__dirname + "/assets"))
app.use('/textures', express.static(__dirname + "/textures"))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


http.listen(3000, function () {
  console.log('listening on *:3000');
});
