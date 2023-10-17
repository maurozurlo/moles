document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const moles = [];
    const animationTimes = {
        out: 1000,
        idle: 2000,
        hit: 500,
        miss: 2000
    };

    // Array to track mole states (hit or not)
    const moleStates = Array(9).fill(false);

    // Function to control mole animations
    const animateMole = (mole, index) => {
        mole.src = 'out.gif';
        mole.style.display = 'block';
        setTimeout(() => {
            mole.src = 'idle.gif';
        }, animationTimes.out);

        setTimeout(() => {
            animateMole(mole, index); // Loop idle animation
        }, animationTimes.idle);
    };

    // Function to handle miss animation
    const missMole = (mole, index) => {
        setTimeout(() => {
            if (!moleStates[index]) {
                mole.src = 'miss.gif'; // Set miss state only if not previously hit
                setTimeout(() => {
                    mole.src = 'idle.gif';
                }, animationTimes.miss);
            }
        }, animationTimes.out);
    };

    // Function to randomly select and animate a mole
    const startRandomMoleAnimation = () => {
        const emptyMoleIndices = moleStates.reduce((acc, state, index) => {
            if (!state) acc.push(index);
            return acc;
        }, []);

        if (emptyMoleIndices.length === 0) {
            // All moles have been hit; reset moleStates
            moleStates.fill(false);
        } else {
            const randomIndex = emptyMoleIndices[Math.floor(Math.random() * emptyMoleIndices.length)];
            const mole = moles[randomIndex];
            animateMole(mole, randomIndex);
            moleStates[randomIndex] = false; // Mark as not hit
            missMole(mole, randomIndex);
        }
    };

    // Create the grid of mole holes and add moles to the array
    for (let i = 0; i < 9; i++) {
        const hole = document.createElement('div');
        hole.classList.add('mole-hole');
        const mole = document.createElement('img');
        mole.classList.add('mole');
        mole.src = 'idle.gif';
        mole.style.display = 'none';

        // Event listener for clicking a mole
        mole.addEventListener('click', () => {
            mole.src = 'hit.gif';
            setTimeout(() => {
                mole.src = 'idle.gif';
            }, animationTimes.hit);
            moleStates[moles.indexOf(mole)] = true; // Mark as hit
        });

        hole.appendChild(mole);
        grid.appendChild(hole);
        moles.push(mole);
    }

    // Initialize the interval ID to null
    let intervalID = null;

    // Start/Restart button event listener
    const startButton = document.getElementById('startButton');
    startButton.addEventListener('click', () => {
        // Reset moleStates array and stop any existing animations
        moleStates.fill(false);
        moles.forEach(mole => {
            mole.src = 'idle.gif';
            mole.style.display = 'none';
        });

        // Clear the existing interval if it exists
        if (intervalID !== null) {
            clearInterval(intervalID);
        }

        // Start a new interval for mole appearances
        intervalID = setInterval(() => {
            startRandomMoleAnimation();
        }, 3000);
    });

    // Initial setup to start the game
    startButton.click();
});
