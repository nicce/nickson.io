var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io").listen(server);

var players = {};

app.use(express.static(__dirname + "/public"));

app.get("/phaser/phaser.js", (req, res) => {
  res.sendFile(__dirname + "/node_modules/phaser/dist/phaser.js");
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", socket => {
  console.log("a user connected");
  addPlayer(socket);
  socket.on("disconnect", () => {
    removePlayer(socket);
    console.log("user disconnected");
  });
  // when a player moves, update the player data
  socket.on("playerMovement", function(movementData) {
    // TODO validate movement data
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].rotation = movementData.rotation;
    // emit a message to all players about the player that moved
    socket.broadcast.emit("playerMoved", players[socket.id]);
  });
});

server.listen(8080, () => {
  console.log(`Listening on ${server.address().port}`);
});

let addPlayer = socket => {
  players[socket.id] = {
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id,
    team: Math.floor(Math.random() * 2) == 0 ? "red" : "blue"
  };

  //Send the players object to the new player
  socket.emit("currentPlayers", players);
  //update all other players of the new player
  socket.broadcast.emit("newPlayer", players[socket.id]);
};

let removePlayer = socket => {
  delete players[socket.id];
  io.emit("disconnect", socket.id);
};
