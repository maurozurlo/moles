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
const moles = []

function preload() {
    // Load the spritesheets for each mole animation
    this.load.spritesheet('mole_out', 'mole_out.png', { frameWidth: 120, frameHeight: 92 });
    this.load.spritesheet('mole_idle', 'mole_idle.png', { frameWidth: 120, frameHeight: 92 });
    this.load.spritesheet('mole_hit', 'mole_hit.png', { frameWidth: 120, frameHeight: 92 });
    this.load.spritesheet('mole_miss', 'mole_miss.png', { frameWidth: 120, frameHeight: 92 });
    this.load.image('hole', 'hole.png'); // Hole image
}

function create() {
    // Create a 3x3 grid of holes
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            this.add.image(160 + i * 160, 92 + j * 92, 'hole').setOrigin(0.5, 0);

            // Create moles and add them to the grid
            const mole = this.add.sprite(160 + i * 160, 92 + j * 92, 'mole_idle').setOrigin(0.5, -0.3);

            mole.setInteractive();

            const id = String(i).concat('-', j)

            moles.push({
                id,
                instance: mole,
                state: null
            })
            // Define mole animations (out, idle, hit)
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

    //mole.anims.play('out', true);
    setInterval(() => {
        spawnMole();
    }, 1000);
}

function moleWasHit(id) {
    const mole = moles.find(mole => mole.id === id);
    if (mole.state !== 'hit') {
        mole.instance.anims.play('hit', true);
        mole.state = 'hit';
    }
}

function spawnMole() {
    const emptyMoleIndices = moles.reduce((acc, state, index) => {
        if (state !== 'idle') acc.push(index);
        return acc;
    }, []);

    if (emptyMoleIndices.length === 0) {
        // All moles have been hit; reset moleStates
        console.error('do something')
    } else {
        const randomIndex = emptyMoleIndices[Math.floor(Math.random() * emptyMoleIndices.length)];
        const mole = moles[randomIndex];

        mole.instance.play('out', true);
        mole.state = 'out'
        setTimeout(() => {
            mole.instance.play('idle', true);
            mole.state = 'idle'

            setTimeout(() => {
                mole.instance.play('miss', true)
                mole.state = null
            }, 1500)
        }, 500)


        //missMole(mole, randomIndex);
    }
}