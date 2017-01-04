var express = require('express')
var app = express()
var io = require('socket.io')();

app.listen(80, function(){console.log('Listening on port 80')});

app.use(express.static('client'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + 'client/index.html');
});
