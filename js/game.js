// ============================================================
// GAME STATE MACHINE
// Controls all screen transitions and game flow
// ============================================================

const GameState = {
    current: 'START',
    // timestamp (ms) until which global click/touch events should be ignored
    ignoreClicksUntil: 0,
    berriesCollected: 0,
    quizScore: 0,
    dialogIndex: 0,

    screens: {
        'START': 'screen-start',
        'OPENING': 'screen-opening',
        'WORLD1_INTRO': 'screen-world1-intro',
        'WORLD1_GAME': 'screen-world1-game',
        'WORLD1_COMPLETE': 'screen-world1-complete',
        'MAZE1': 'screen-maze',
        'WORLD2_INTRO': 'screen-world2-intro',
        'WORLD2_GAME': 'screen-world2-game',
        'WORLD2_COMPLETE': 'screen-world2-complete',
        'MAZE2': 'screen-maze',
        'WORLD3_INTRO': 'screen-world3-intro',
        'WORLD3_GAME': 'screen-world3-game',
        'WORLD3_COMPLETE': 'screen-world3-complete',
        'MAZE3': 'screen-maze',
        'CELEBRATION': 'screen-celebration'
    },

    transition(nextState) {
        const currentEl = document.getElementById(this.screens[this.current]);
        const nextEl = document.getElementById(this.screens[nextState]);

        if (!nextEl) {
            console.error('Screen not found:', nextState);
            return;
        }

        if (currentEl) {
            currentEl.classList.add('screen-exit');
            setTimeout(() => {
                currentEl.style.display = 'none';
                currentEl.classList.remove('screen-exit', 'screen-active');
            }, 600);
        }

        // Prevent accidental click events from immediately advancing the newly-shown screen
        this.ignoreClicksUntil = Date.now() + 700;

        setTimeout(() => {
            nextEl.style.display = 'flex';
            // Force reflow
            nextEl.offsetHeight;
            nextEl.classList.add('screen-active');
            this.current = nextState;
            this.onEnter(nextState);
        }, currentEl ? 400 : 0);
    },

    onEnter(state) {
        switch(state) {
            case 'OPENING':
                Opening.start();
                if (typeof Music !== 'undefined') Music.play('opening');
                break;
            case 'WORLD1_INTRO':
                this.showIntro('world1', CONFIG.world1.intro, 'WORLD1_GAME');
                if (typeof Music !== 'undefined') Music.play('world1');
                break;
            case 'WORLD1_GAME':
                World1.start();
                break;
            case 'WORLD1_COMPLETE':
                this.showComplete(CONFIG.world1.complete, 'MAZE1');
                if (typeof Music !== 'undefined') Music.playSFX('victory');
                break;
            case 'MAZE1':
                if (typeof Music !== 'undefined') Music.play('opening');
                if (typeof Maze !== 'undefined') Maze.start('maze1', 'WORLD2_INTRO');
                break;
            case 'WORLD2_INTRO':
                this.showIntro('world2', CONFIG.world2.intro, 'WORLD2_GAME');
                if (typeof Music !== 'undefined') Music.play('world2');
                break;
            case 'WORLD2_GAME':
                World2.start();
                break;
            case 'WORLD2_COMPLETE':
                this.showComplete(CONFIG.world2.complete, 'MAZE2');
                if (typeof Music !== 'undefined') Music.playSFX('victory');
                break;
            case 'MAZE2':
                if (typeof Music !== 'undefined') Music.play('world2');
                if (typeof Maze !== 'undefined') Maze.start('maze2', 'WORLD3_INTRO');
                break;
            case 'WORLD3_INTRO':
                this.showIntro('world3', CONFIG.world3.intro, 'WORLD3_GAME');
                if (typeof Music !== 'undefined') Music.play('world3');
                break;
            case 'WORLD3_GAME':
                World3.start();
                break;
            case 'WORLD3_COMPLETE':
                this.showComplete(CONFIG.world3.complete, 'MAZE3');
                break;
            case 'MAZE3':
                if (typeof Music !== 'undefined') Music.play('celebration');
                if (typeof Maze !== 'undefined') Maze.start('maze3', 'CELEBRATION');
                break;
            case 'CELEBRATION':
                Celebration.start();
                if (typeof Music !== 'undefined') Music.play('celebration');
                break;
        }
    },

    showIntro(world, text, nextState) {
        const screen = document.getElementById(this.screens[this.current]);
        const textEl = screen.querySelector('.intro-text');
        const btnEl = screen.querySelector('.intro-btn');

        if (textEl) {
            textEl.textContent = '';
            typewriterText(textEl, text, 30);
        }
        if (btnEl) {
            btnEl.onclick = () => this.transition(nextState);
        }
    },

    showComplete(text, nextState) {
        const screen = document.getElementById(this.screens[this.current]);
        const textEl = screen.querySelector('.complete-text');
        const btnEl = screen.querySelector('.complete-btn');

        if (textEl) {
            textEl.textContent = '';
            typewriterText(textEl, text, 30);
        }
        if (btnEl) {
            btnEl.onclick = () => this.transition(nextState);
        }
    }
};

// ============================================================
// TYPEWRITER TEXT EFFECT
// ============================================================
function typewriterText(element, text, speed = 30, callback) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    }
    type();
}

// ============================================================
// OPENING SEQUENCE (Pokémon-style multi-screen intro)
// ============================================================
const Opening = {
    currentStep: 0,
    isTyping: false,
    currentLineIndex: 0,
    skipToEnd: false,

    start() {
        this.currentStep = 0;
        this.showStep(0);
    },

    showStep(index) {
        const dialog = CONFIG.openingDialog[index];
        if (!index && index !== 0) return;
        if (!dialog) return;

        const screen = document.getElementById('screen-opening');
        const bgEl = screen.querySelector('.opening-bg');
        const textContainer = screen.querySelector('.opening-text');
        const charContainer = screen.querySelector('.opening-characters');
        const indicator = screen.querySelector('.opening-indicator');
        const startBtn = screen.querySelector('.opening-start-btn');
        const nameReveal = screen.querySelector('.opening-name-reveal');
        const worldMap = screen.querySelector('.opening-world-map');

        // Set background
        bgEl.className = 'opening-bg bg-' + dialog.bg;

        // Clear previous
        textContainer.innerHTML = '';
        charContainer.innerHTML = '';
        if (startBtn) startBtn.style.display = 'none';
        if (nameReveal) nameReveal.style.display = 'none';
        if (worldMap) worldMap.style.display = 'none';
        if (indicator) indicator.style.display = 'none';

        // Show characters with entrance animations
        dialog.characters.forEach((char, i) => {
            const charEl = document.createElement('div');
            charEl.className = `opening-char char-${char}`;
            charEl.style.animationDelay = (i * 0.3) + 's';
            charContainer.appendChild(charEl);
        });

        // Funny moment animations
        if (dialog.funnyMoment) {
            setTimeout(() => {
                const slowpoke = charContainer.querySelector('.char-slowpoke');
                const psyduck = charContainer.querySelector('.char-psyduck');
                if (slowpoke) slowpoke.classList.add('yawn');
                if (psyduck) psyduck.classList.add('confused');
            }, 500);
        }

        // Show name reveal effect
        if (dialog.nameReveal && nameReveal) {
            setTimeout(() => {
                nameReveal.style.display = 'block';
                nameReveal.querySelector('.name-text').textContent = CONFIG.birthdayGirl;
                nameReveal.classList.add('sparkle');
            }, 1000);
        }

        // Show world map
        if (dialog.showMap && worldMap) {
            setTimeout(() => {
                worldMap.style.display = 'block';
                worldMap.classList.add('fade-in');
            }, 500);
        }

        // Type out text lines sequentially
        this.currentLineIndex = 0;
        this.isTyping = true;
        this.skipToEnd = false;
        this.typeLines(dialog.text, textContainer, () => {
            this.isTyping = false;
            // Show indicator or start button
            if (dialog.showStartButton && startBtn) {
                startBtn.style.display = 'block';
                startBtn.classList.add('fade-in');
                startBtn.onclick = () => {
                    GameState.transition('WORLD1_INTRO');
                };
            } else if (indicator) {
                indicator.style.display = 'block';
            }
        });
    },

    typeLines(lines, container, onComplete) {
        if (this.currentLineIndex >= lines.length) {
            if (onComplete) onComplete();
            return;
        }

        const lineEl = document.createElement('p');
        lineEl.className = 'dialog-line';
        container.appendChild(lineEl);

        if (this.skipToEnd) {
            // Show all remaining lines instantly
            lineEl.textContent = lines[this.currentLineIndex];
            this.currentLineIndex++;
            this.typeLines(lines, container, onComplete);
            return;
        }

        typewriterText(lineEl, lines[this.currentLineIndex], 40, () => {
            this.currentLineIndex++;
            setTimeout(() => {
                this.typeLines(lines, container, onComplete);
            }, 300);
        });
    },

    advance() {
        if (this.isTyping) {
            // Skip to end of current dialog
            this.skipToEnd = true;
            return;
        }

        this.currentStep++;
        if (this.currentStep < CONFIG.openingDialog.length) {
            this.showStep(this.currentStep);
        }
    }
};

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Start button on title screen
    // Do NOT auto-play music here — start audio on a user gesture instead

    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (typeof Music !== 'undefined') Music.playSFX('click');
            GameState.transition('OPENING');
        });
    }

    // Opening screen click-to-advance
    const openingScreen = document.getElementById('screen-opening');
    if (openingScreen) {
        openingScreen.addEventListener('click', (e) => {
            // Ignore clicks that happen immediately after a transition
            if (GameState.ignoreClicksUntil && Date.now() < GameState.ignoreClicksUntil) return;
            // Don't advance if clicking the start button
            if (e.target.classList.contains('opening-start-btn')) return;
            Opening.advance();
        });
        openingScreen.addEventListener('touchend', (e) => {
            if (GameState.ignoreClicksUntil && Date.now() < GameState.ignoreClicksUntil) return;
            if (e.target.classList.contains('opening-start-btn')) return;
            // Prevent double-firing
            e.preventDefault();
            Opening.advance();
        });
    }

    // Music toggle
    const musicBtn = document.getElementById('music-toggle');
    let musicMuted = false;
    if (musicBtn) {
        musicBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            musicMuted = !musicMuted;
            if (typeof Music !== 'undefined') {
                if (musicMuted) {
                    Music.masterGain && (Music.masterGain.gain.value = 0);
                    musicBtn.textContent = '🔇';
                } else {
                    Music.masterGain && (Music.masterGain.gain.value = Music.volume);
                    musicBtn.textContent = '🔊';
                }
            }
        });
    }

    // Show start screen
    const startScreen = document.getElementById('screen-start');
    if (startScreen) {
        startScreen.style.display = 'flex';
        startScreen.classList.add('screen-active');
    }
});
