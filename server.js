var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var messageColor = false;

http.listen(2712, function(){console.log('Listening on port 2712')});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/client/index.html');
});

app.get('/:path', function (req, res) {
  res.sendFile(__dirname + '/client/' + req.params.path);
});

app.get('/source/:quality', function (req, res) {
  res.send('{error:"WIP",quality:"'+ req.params.quality +'"}');
});

app.get('/current', function (req, res) {
  res.send('{error:"WIP"}');
});

app.get('/info', function (req, res) {
  res.send('{error:"WIP"}');
});

io.on('connection', function(socket){
  console.log('User connected');
  socket.on('disconnect', function(){
    console.log('User disconnected');
  });
  socket.on('chatMessage', function(msg){
    if(messageColor){
      io.emit('chatMessage', '<span class="m1">'+ msg +"</span>");
    }else{
      io.emit('chatMessage', '<span class="m2">'+ msg +"</span>");
    }
    messageColor = !messageColor;
  });
});