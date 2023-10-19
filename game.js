// Mole States
// ready | out | idle | miss | hit
const globalScores = {
    bestScore: 0,
    lastScore: 0
}
class Menu extends Phaser.Scene {
    constructor() {
        super('Menu');
    }
    preload() {
        this.load.image('background2', 'startbg.png')
        this.load.image('background3', 'gameover.png')
        this.load.image('background', 'bg.png')
        this.load.spritesheet('mole_out', 'mole_out.png', { frameWidth: 120, frameHeight: 92 });
        this.load.spritesheet('mole_idle', 'mole_idle.png', { frameWidth: 120, frameHeight: 92 });
        this.load.spritesheet('mole_hit', 'mole_hit.png', { frameWidth: 120, frameHeight: 92 });
        this.load.spritesheet('mole_miss', 'mole_miss.png', { frameWidth: 120, frameHeight: 92 });
        this.load.spritesheet('hole', 'hole.png', { frameWidth: 160, frameHeight: 140 });
        this.load.spritesheet('playButton', 'play_button.png', { frameWidth: 202, frameHeight: 91 });
    }

    create() {
        this.add.image(0, 0, 'background2').setOrigin(0, 0)
        const play = this.add.sprite(640 / 2, 260, 'playButton').setOrigin(0.5, 0.5).setInteractive().setScale(.8);

        play.on('pointerover', () => {
            play.setFrame(1);
        })
        play.on('pointerout', () => {
            play.setFrame(0);
        })
        play.once('pointerdown', () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0)
        });
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('MainGame')
        })

    }
}


class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }
    create() {
        this.add.image(0, 0, 'background3').setOrigin(0, 0)
        const play = this.add.sprite(640 / 2, 60 + 260, 'playButton').setOrigin(0.5, 0.5).setInteractive().setScale(.8);

        this.add.text(640 / 2, 100 + 80, "game over", { fontFamily: 'consolas', fontSize: 22 }).setOrigin(0.5, 0.5);
        this.add.text(640 / 2, 100 + 120, "your score was: ".concat(globalScores.lastScore), { fontFamily: 'consolas' }).setOrigin(0.5, 0.5);
        this.add.text(640 / 2, 100 + 140, "your best score was: ".concat(globalScores.bestScore), { fontFamily: 'consolas' }).setOrigin(0.5, 0.5);

        play.on('pointerover', () => {
            play.setFrame(1);
        })
        play.on('pointerout', () => {
            play.setFrame(0);
        })

        play.once('pointerdown', () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0)
        });
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('Menu')
        })
    }
}

class Play extends Phaser.Scene {
    MAX_MISSED = 3;

    constructor() {
        super('MainGame');
        this.moles = [];
        this.score = {
            instance: null,
            points: 0,
            missed: 0,
        };
        this.gameState = 'play';
        this.moleSpawnTimer = null;
    }

    create() {
        this.gameState = 'play'
        this.add.image(0, 0, 'background').setOrigin(0, 0)
        this.anims.create({
            key: 'hole',
            frames: this.anims.generateFrameNumbers('hole', { start: 0, end: 2 }),
            frameRate: 9,
            repeat: -1
        });
        this.anims.create({
            key: 'out',
            frames: this.anims.generateFrameNumbers('mole_out', { start: 0, end: 5 }),
            frameRate: 9,
            repeat: 0
        });
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('mole_idle', { start: 0, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'hit',
            frames: this.anims.generateFrameNumbers('mole_hit', { start: 0, end: 9 }),
            frameRate: 10,
            repeat: 0
        });
        this.anims.create({
            key: 'miss',
            frames: this.anims.generateFrameNumbers('mole_miss', { start: 0, end: 11 }),
            frameRate: 10,
            repeat: 0
        });

        this.score.instance = this.add.text(640 / 2, 20, 0, { fontFamily: 'consolas' }).setOrigin(0.5, 0.5);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const hole = this.add.sprite(160 + i * 160, 20 + j * 140, 'hole').setOrigin(0.5, 0).setDepth(1);
                hole.anims.play('hole', true);
                const mole = this.add.sprite(160 + i * 160, 76 + j * 140, 'mole_out').setOrigin(0.5, 0.5).setAlpha(0);
                mole.blendMode = Phaser.BlendModes.MULTIPLY;
                mole.setInteractive();
                const id = String(i).concat('-', j)
                this.moles.push({
                    id,
                    instance: mole,
                    state: 'ready',
                    spawned: null
                })

                mole.on('pointerdown', () => {
                    this.moleWasHit(id);
                });
            }
        }

        this.moleSpawnTimer = this.time.addEvent({
            delay: Phaser.Math.Between(1500, 3000),
            callback: this.spawnMole,
            callbackScope: this,
            loop: true
        });
    }

    moleWasHit(id) {
        const mole = this.moles.find(mole => mole.id === id);
        if (mole.state === 'ready' || mole.state === 'miss' || mole.state === 'hit') return;
        mole.instance.anims.play('hit', true);
        mole.state = 'hit';
        const reactionTime = (Date.now() - mole.spawned) / 1000;
        this.score.points += Math.round(reactionTime * 10)
        this.updateScore();
        mole.spawned = null;
        this.time.delayedCall(mole.instance.anims.currentAnim.duration + 1500, () => {
            mole.state = 'ready';
        });
    }

    moleWasMissed(mole) {
        if (mole.state !== 'idle') return;
        mole.instance.play('miss', true)
        mole.state = 'miss'
        this.score.missed++;
        this.time.delayedCall(mole.instance.anims.currentAnim.duration, () => {
            if (this.score.missed >= this.MAX_MISSED) {
                this.gameOver();
                return;
            }
        })
        this.time.delayedCall(mole.instance.anims.currentAnim.duration + 1500, () => {
            mole.state = 'ready';
        });
    }

    gameOver() {
        this.gameState = 'over';
        globalScores.lastScore = this.score.points;
        if (this.score.points >= globalScores.bestScore) {
            globalScores.bestScore = this.score.points;
        }
        this.moles = [];
        this.score = {
            instance: null,
            points: 0,
            missed: 0,
        };
        this.gameState = 'play';
        this.moleSpawnTimer = null;
        this.scene.start('GameOver')
    }

    spawnMole() {
        if (this.gameState !== 'play') return;
        const readyMoleIndices = this.moles.filter(mole => mole.state === 'ready')
        const mole = readyMoleIndices[Math.floor(Math.random() * readyMoleIndices.length)];
        mole.instance.setAlpha(1)
        mole.instance.play('out', true);
        mole.state = 'out';
        mole.spawned = Date.now();
        this.time.delayedCall(mole.instance.anims.currentAnim.duration, () => {
            if (mole.state === 'hit') return;
            mole.instance.play('idle', true);
            mole.state = 'idle';
        });
        this.time.delayedCall(1500, () => this.moleWasMissed(mole));
    }

    updateScore() {
        this.score.instance.text = String(this.score.points)
    }
}

const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    backgroundColor: '#fff',
    scene: [Menu, Play, GameOver]
};
const game = new Phaser.Game(config);