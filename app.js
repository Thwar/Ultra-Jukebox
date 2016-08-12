var express = require("express");
var bodyParser = require("body-parser");
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Serve static MP4 videos folder to use in nodejs app
app.use(express.static('videos contreras'));

//Serve static NODE SCRIPTS
app.use(express.static('node_modules'));

//Serve static NODE SCRIPTS
app.use(express.static('public'));
 
 //Routes
var routes = require("./routes.js")(app, io);
 
 //Listener
http.listen(49553, function () {
    console.log('listening on *:49553');
});

//Socket.io listener
io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
});
