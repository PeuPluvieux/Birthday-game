// ============================================================
// CELEBRATION FINALE
// Characters enter, cake appears, candles blow out, confetti, message
// ============================================================

const Celebration = {
    candlesBlown: 0,
    totalCandles: 0,
    confettiGeneration: 0,

    start() {
        this.candlesBlown = 0;
        this.totalCandles = CONFIG.celebration.candleCount;
        this.confettiGeneration = 0;

        // Create stars background
        this.createStars();

        // Sequence: characters enter → cake → candles → prompt
        this.enterCharacters();
    },

    createStars() {
        const container = document.querySelector('.celebration-stars');
        if (!container) return;
        container.innerHTML = '';

        for (let i = 0; i < 40; i++) {
            const star = document.createElement('div');
            star.className = 'celebration-star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 50 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            star.style.animationDuration = (1 + Math.random() * 2) + 's';
            container.appendChild(star);
        }
    },

    enterCharacters() {
        const chars = document.querySelectorAll('.celeb-char');
        const names = ['nhu', 'bulbasaur', 'slowpoke', 'psyduck', 'pompompurin', 'patrick'];

        chars.forEach((el, i) => {
            // Render sprite
            const sprite = createSpriteElement(names[i], 2);
            if (sprite) {
                el.innerHTML = '';
                el.appendChild(sprite);
            }

            // Staggered entrance
            setTimeout(() => {
                el.classList.add('entered');
            }, 800 + i * 600);
        });

        // After all characters entered, show cake
        setTimeout(() => {
            this.showCake();
        }, 800 + names.length * 600 + 500);
    },

    showCake() {
        // Render cake sprite
        const cakeContainer = document.querySelector('.cake-sprite');
        if (cakeContainer) {
            const sprite = createSpriteElement('cake', 5);
            if (sprite) {
                cakeContainer.innerHTML = '';
                cakeContainer.appendChild(sprite);
            }
        }

        const cake = document.querySelector('.celebration-cake');
        if (cake) {
            cake.classList.add('visible');
        }

        // Setup candles
        this.setupCandles();

        // Show blow prompt
        setTimeout(() => {
            const prompt = document.querySelector('.blow-prompt');
            if (prompt) prompt.style.display = 'block';
        }, 1200);
    },

    setupCandles() {
        const container = document.querySelector('.candles-container');
        if (!container) return;
        container.innerHTML = '';

        for (let i = 0; i < this.totalCandles; i++) {
            const candle = document.createElement('div');
            candle.className = 'candle';
            candle.innerHTML = `
                <div class="candle-flame" id="flame-${i}"></div>
                <div class="candle-stick"></div>
                <div class="candle-smoke" id="smoke-${i}"></div>
            `;

            candle.addEventListener('click', () => this.blowCandle(i));
            candle.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.blowCandle(i);
            });

            container.appendChild(candle);
        }
    },

    blowCandle(index) {
        const flame = document.getElementById('flame-' + index);
        const smoke = document.getElementById('smoke-' + index);

        if (!flame || flame.classList.contains('blown')) return;

        if (typeof Music !== 'undefined') Music.playSFX('blow');
        flame.classList.add('blown');
        if (smoke) {
            smoke.classList.add('active');
        }

        this.candlesBlown++;

        if (this.candlesBlown >= this.totalCandles) {
            // All candles blown!
            setTimeout(() => {
                this.allCandlesBlown();
            }, 600);
        }
    },

    allCandlesBlown() {
        // Hide prompt
        const prompt = document.querySelector('.blow-prompt');
        if (prompt) prompt.style.display = 'none';

        // Show Happy Birthday text
        const hbdText = document.querySelector('.happy-birthday-text');
        if (hbdText) {
            hbdText.textContent = `HAPPY BIRTHDAY, ${CONFIG.birthdayGirl.toUpperCase()}!!! 🎉`;
            hbdText.classList.add('visible');
        }

        // Confetti!
        this.createConfetti(this.confettiGeneration);

        // Floating hearts
        this.createFloatingHearts();

        // Birthday message (typewriter, line by line)
        setTimeout(() => {
            this.showBirthdayMessage();
        }, 1500);

        // Show credits
        setTimeout(() => {
            const credits = document.querySelector('.celebration-credits');
            if (credits) credits.style.opacity = '1';
        }, CONFIG.birthdayMessage.length * 1200 + 3000);
    },

    createConfetti(generation) {
        // Stop spawning new waves if a new celebration has started or max waves reached
        if (generation !== this.confettiGeneration) return;

        const container = document.querySelector('.confetti-container');
        if (!container) return;

        const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'];

        for (let i = 0; i < CONFIG.celebration.confettiCount; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.setProperty('--delay', (Math.random() * 1) + 's');
            piece.style.setProperty('--duration', (2 + Math.random() * 3) + 's');
            piece.style.setProperty('--rotation', (Math.random() * 720) + 'deg');
            piece.style.setProperty('--drift', (-60 + Math.random() * 120) + 'px');
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.width = (6 + Math.random() * 8) + 'px';
            piece.style.height = (6 + Math.random() * 8) + 'px';

            if (Math.random() > 0.5) {
                piece.style.borderRadius = '50%';
            }

            container.appendChild(piece);

            // Remove after animation
            piece.addEventListener('animationend', () => piece.remove());
        }

        // Spawn more confetti in waves (up to 5 waves total)
        this.confettiGeneration++;
        if (this.confettiGeneration < 5) {
            const nextGen = this.confettiGeneration;
            setTimeout(() => this.createConfetti(nextGen), 3000);
        }
    },

    createFloatingHearts() {
        const container = document.querySelector('.floating-hearts');
        if (!container) return;
        container.innerHTML = '';

        const hearts = ['💕', '❤️', '💖', '💗', '✨', '🌟'];
        for (let i = 0; i < 12; i++) {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = Math.random() * 90 + 5 + '%';
            heart.style.top = Math.random() * 60 + 20 + '%';
            heart.style.animationDelay = Math.random() * 4 + 's';
            heart.style.animationDuration = (3 + Math.random() * 3) + 's';
            container.appendChild(heart);
        }
    },

    showBirthdayMessage() {
        const container = document.querySelector('.birthday-message');
        if (!container) return;
        container.innerHTML = '';

        CONFIG.birthdayMessage.forEach((line, i) => {
            const lineEl = document.createElement('p');
            lineEl.className = 'msg-line';
            lineEl.textContent = line;
            container.appendChild(lineEl);

            setTimeout(() => {
                lineEl.classList.add('visible');
            }, i * 1200);
        });
    }
};
