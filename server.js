"use strict";

var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 4000);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
server.listen(app.settings.port, () => {
    console.log("Starting server on port:", app.settings.port);
});

io.on('connection', (socket) => {
});

var players = {};
io.on('connection', (socket) => {
    socket.on('new player', () => {
        players[socket.id] = {
            x: 300,
            y: 300
        };
    });
    socket.on('movement', (data) => {
        var player = players[socket.id] || {};
        if (data.left) {
            player.x -= 5;
        }
        if (data.up) {
            player.y -= 5;
        }
        if (data.right) {
            player.x += 5;
        }
        if (data.down) {
            player.y += 5;
        }
    });
});
setInterval(() => {
    io.sockets.emit('state', players);
}, 1000 / 60);