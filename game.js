const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    scene: {
        preload: preload,
        create: create
    },
    backgroundColor: '#fff',
};

const game = new Phaser.Game(config);
const moles = [];
const score = {
    instance: null,
    points: 0
}

function preload() {
    // Load the spritesheets for each mole animation
    this.load.image('background', 'bg.png')
    this.load.spritesheet('mole_out', 'mole_out.png', { frameWidth: 120, frameHeight: 92 });
    this.load.spritesheet('mole_idle', 'mole_idle.png', { frameWidth: 120, frameHeight: 92 });
    this.load.spritesheet('mole_hit', 'mole_hit.png', { frameWidth: 120, frameHeight: 92 });
    this.load.spritesheet('mole_miss', 'mole_miss.png', { frameWidth: 120, frameHeight: 92 });
    this.load.spritesheet('hole', 'hole.png', { frameWidth: 160, frameHeight: 140 }); // Hole image
}

function updateScore() {
    score.instance.text = String(score.points)
}
function create() {
    this.add.image(0, 0, 'background').setOrigin(0, 0)
    this.anims.create({
        key: 'hole',
        frames: this.anims.generateFrameNumbers('hole', { start: 0, end: 2 }),
        frameRate: 9,
        repeat: -1
    });

    score.instance = this.add.text(640 / 2, 20, String(score.points), { fontFamily: 'Georgia' }).setOrigin(0.5, 0.5);


    // Create a 3x3 grid of holes
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {

            const hole = this.add.sprite(160 + i * 160, 20 + j * 140, 'hole').setOrigin(0.5, 0).setDepth(1)
            hole.anims.play('hole', true);
            const mole = this.add.sprite(160 + i * 160, 76 + j * 140, 'mole_out').setOrigin(0.5, 0.5).setAlpha(0);
            mole.blendMode = Phaser.BlendModes.MULTIPLY
            mole.setInteractive();
            const id = String(i).concat('-', j)
            moles.push({
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
                moleWasHit(id);
            });
        }
    }
    spawnMole();
}

function moleWasHit(id) {
    const mole = moles.find(mole => mole.id === id);
    if (mole.state === 'ready' || mole.state === 'miss' || mole.state === 'hit') return;

    mole.instance.anims.play('hit', true);
    mole.state = 'hit';
    const reactionTime = (Date.now() - mole.spawned) / 1000;
    console.log('Mole was hit after: ', reactionTime)
    score.points += Math.round(reactionTime * 10)
    updateScore();
    mole.spawned = null;

    setTimeout(() => {
        mole.state = 'ready'
    }, mole.instance.anims.currentAnim.duration + 1500)
}
// Mole States
/*
ready    
out
idle
miss
hit
*/

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function missMole(mole) {
    if (mole.state !== 'idle') return;
    mole.instance.play('miss', true)
    mole.state = 'miss'
    // Time to reactivate

    score.points -= 10
    updateScore();
    setTimeout(() => {
        mole.state = 'ready'
    }, mole.instance.anims.currentAnim.duration + 1500)
}

function spawnMole() {
    const readyMoleIndices = moles.filter(mole => mole.state === 'ready')
    if (readyMoleIndices.length === 0) {
        // All moles are doing something, we wait some seconds and try again
        setTimeout(() => spawnMole(), getRandomInt(1500, 3000));
        return;
    }
    console.log(readyMoleIndices)

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

    setTimeout(() => { missMole(mole) }, 1500);
    // Spawn Moles
    setTimeout(() => spawnMole(), getRandomInt(1500, 3000));
}