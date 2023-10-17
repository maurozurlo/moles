// Mole States
// ready | out | idle | miss | hit
const globalScore = 0;
class Menu extends Phaser.Scene {
    constructor() {
        super('Menu');
    }
    preload() {
        this.load.image('background2', 'startbg.png')
        this.load.image('background', 'bg.png')
        this.load.image('quitButton', 'quitButton.png')
        this.load.spritesheet('mole_out', 'mole_out.png', { frameWidth: 120, frameHeight: 92 });
        this.load.spritesheet('mole_idle', 'mole_idle.png', { frameWidth: 120, frameHeight: 92 });
        this.load.spritesheet('mole_hit', 'mole_hit.png', { frameWidth: 120, frameHeight: 92 });
        this.load.spritesheet('mole_miss', 'mole_miss.png', { frameWidth: 120, frameHeight: 92 });
        this.load.spritesheet('hole', 'hole.png', { frameWidth: 160, frameHeight: 140 }); // Hole image
        this.load.spritesheet('playButton', 'playButton.png', { frameWidth: 202, frameHeight: 91 });
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
        this.add.image(0, 0, 'background2').setOrigin(0, 0)
        const play = this.add.sprite(640 / 2, 260, 'playButton').setOrigin(0.5, 0.5).setInteractive().setScale(.8);

        play.on('pointerover', () => {
            play.setFrame(1);
        })
        play.on('pointerout', () => {
            play.setFrame(0);
        })

        play.once('pointerdown', () => {
            this.scene.transition({
                target: 'Menu',
                duration: 500,
                moveBelow: true,
            });
        });
    }
}

class Play extends Phaser.Scene {

    constructor() {
        super('MainGame');
        this.moles = []
        this.score = {
            instance: null,
            points: 0
        }
    }

    create() {
        this.add.image(0, 0, 'background').setOrigin(0, 0)
        this.anims.create({
            key: 'hole',
            frames: this.anims.generateFrameNumbers('hole', { start: 0, end: 2 }),
            frameRate: 9,
            repeat: -1
        });
        this.score.instance = this.add.text(640 / 2, 20, 0, { fontFamily: 'Georgia' }).setOrigin(0.5, 0.5);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const hole = this.add.sprite(160 + i * 160, 20 + j * 140, 'hole').setOrigin(0.5, 0).setDepth(1)
                hole.anims.play('hole', true);
                const mole = this.add.sprite(160 + i * 160, 76 + j * 140, 'mole_out').setOrigin(0.5, 0.5).setAlpha(0);
                mole.blendMode = Phaser.BlendModes.MULTIPLY
                mole.setInteractive();
                const id = String(i).concat('-', j)
                this.moles.push({
                    id,
                    instance: mole,
                    state: 'ready',
                    spawned: null
                })
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
                mole.on('pointerdown', () => {
                    this.moleWasHit(id);
                });
            }
        }
        this.spawnMole();
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
        setTimeout(() => {
            mole.state = 'ready'
        }, mole.instance.anims.currentAnim.duration + 1500)
    }

    moleWasMissed(mole) {
        if (mole.state !== 'idle') return;
        mole.instance.play('miss', true)
        mole.state = 'miss'
        this.score.points -= 10
        this.updateScore();
        setTimeout(() => {
            mole.state = 'ready'
        }, mole.instance.anims.currentAnim.duration + 1500)
    }

    spawnMole() {
        const readyMoleIndices = this.moles.filter(mole => mole.state === 'ready')
        if (readyMoleIndices.length === 0) {
            // This should never happen...
            // All moles are doing something, we wait some seconds and try again?
            setTimeout(() => this.spawnMole(), Phaser.Math.Between(1500, 3000));
            return;
        }
        const mole = readyMoleIndices[Math.floor(Math.random() * readyMoleIndices.length)];
        mole.instance.setAlpha(1)
        mole.instance.play('out', true);
        mole.state = 'out';
        mole.spawned = Date.now();
        setTimeout(() => {
            if (mole.state === 'hit') return;
            mole.instance.play('idle', true);
            mole.state = 'idle'
        }, mole.instance.anims.currentAnim.duration)
        setTimeout(() => { this.moleWasMissed(mole) }, 1500);
        // Spawn More Moles
        setTimeout(() => this.spawnMole(), Phaser.Math.Between(1500, 3000));
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
    scene: [Menu, Play]
};
const game = new Phaser.Game(config);
//game.state.add('start', start)

//game.state.add('end', end)