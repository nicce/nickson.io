var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

var players = {};

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    addPlayer(socket);
    socket.on('disconnect', () => {
        removePlayer(socket);
        console.log('user disconnected');
    });
});

server.listen(8080, () => {
    console.log(`Listening on ${server.address().port}`);
});

let addPlayer = (socket) => {
    players[socket.id] = {
        rotation: 0,
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 500) + 50,
        playerId: socket.id,
    };

    //Send the players object to the new player
    socket.emit('currentPlayers', players);
    //update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);
};

let removePlayer = (socket) => {
    delete players[socket.id];
    io.emit('disconnect', socket.id)

};