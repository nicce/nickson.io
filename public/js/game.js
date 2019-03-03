("use strict");
/*Doc on game config found here: https://photonstorm.github.io/phaser3-docs/global.html#GameConfig*/
var config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);

function preload() {
  this.load.image("ship", "assets/spaceShips_001.png");
  this.load.image("otherPlayer", "assets/enemyBlack5.png");
  this.load.image("hit", "assets/laserGreen_hit.png");
  this.load.image("shot", "assets/laserGreen_shot.png");
}

function create() {
  var self = this;
  this.socket = io();
  this.otherPlayers = this.physics.add.group();
  this.cursors = this.input.keyboard.createCursorKeys();

  this.socket.on("currentPlayers", function(players) {
    Object.keys(players).forEach(function(id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });
  this.socket.on("newPlayer", function(playerInfo) {
    addOtherPlayers(self, playerInfo);
  });
  this.socket.on("disconnect", function(playerId) {
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });

  this.socket.on("playerMoved", function(playerInfo) {
    self.otherPlayers.getChildren().forEach(function(otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });
}

function update() {
  if (this.ship) {
    this.input.keyboard.on("keydown_W", () => {
      this.physics.velocityFromRotation(
        this.ship.rotation,
        10,
        this.ship.body.acceleration
      );
    });
    this.input.keyboard.on("keydown_A", () => {
      this.ship.setAngularVelocity(-100);
    });
    this.input.keyboard.on("keydown_D", () => {
      this.ship.setAngularVelocity(100);
    });
    this.input.keyboard.on("keydown_S", () => {
      this.ship.setAngularVelocity(0);
    });

    //keyboard_SPACE not working so this is a workaround
    if (this.cursors.space.isDown) {
      // TODO Add shooting animation
    }

    // emit player movement
    var x = this.ship.x;
    var y = this.ship.y;
    var r = this.ship.rotation;
    if (
      this.ship.oldPosition &&
      (x !== this.ship.oldPosition.x ||
        y !== this.ship.oldPosition.y ||
        r !== this.ship.oldPosition.rotation)
    ) {
      this.socket.emit("playerMovement", {
        x: this.ship.x,
        y: this.ship.y,
        rotation: this.ship.rotation
      });
    }

    // save old position data
    this.ship.oldPosition = {
      x: this.ship.x,
      y: this.ship.y,
      rotation: this.ship.rotation
    };

    this.physics.world.wrap(this.ship, 0);
  }
}
