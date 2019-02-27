"use strict";

/*Doc on game config found here: https://photonstorm.github.io/phaser3-docs/global.html#GameConfig*/
var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
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
    this.load.image('ship', 'assets/spaceShips_001.png');
}

function create() {
    this.socket = io();
    this.socket.on('currentPlayers', (players) => {
        Object.keys(players).forEach((id) => {
            if(players[id].playerId === this.socket.id) {
                addPlayer(this, players[id]);
            }
        })
    })
}

function update() {}

function addPlayer(self, playerInfo) {
    self.ship = self.physics.add
        .image(playerInfo.x, playerInfo.y, 'ship')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(53, 40);
    self.ship.setDrag(100);
    self.ship.setAngularDrag(100);
    self.ship.setMaxVelocity(200);
}