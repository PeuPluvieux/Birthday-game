// ============================================================
// WORLD 3: POMPOMPURIN QUIZ
// DOM-based quiz with cute reactions
// ============================================================

const World3 = {
    currentQuestion: 0,
    score: 0,
    answered: false,

    start() {
        this.currentQuestion = 0;
        this.score = 0;
        this.showQuestion(0);

        // Render Pompompurin sprite in quiz host
        const host = document.querySelector('.quiz-host');
        if (host) {
            const sprite = createSpriteElement('pompompurin', 3);
            if (sprite) {
                host.innerHTML = '';
                host.appendChild(sprite);
            }
        }
    },

    showQuestion(index) {
        const q = CONFIG.quizQuestions[index];
        if (!q) return;

        this.answered = false;

        // Update progress dots
        const dots = document.querySelectorAll('.progress-dot');
        dots.forEach((dot, i) => {
            dot.className = 'progress-dot';
            if (i === index) dot.classList.add('active');
            if (i < index) dot.classList.add('completed');
        });

        // Set question text
        const questionEl = document.querySelector('.quiz-question');
        if (questionEl) {
            questionEl.textContent = '';
            typewriterText(questionEl, q.question, 30);
        }

        // Set options
        const optionsEl = document.querySelector('.quiz-options');
        optionsEl.innerHTML = '';

        q.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = opt;
            btn.addEventListener('click', () => this.handleAnswer(i));
            optionsEl.appendChild(btn);
        });

        // Hide fun fact
        const funfact = document.querySelector('.quiz-funfact');
        if (funfact) {
            funfact.classList.remove('active');
        }

        // Reset host animation
        const host = document.querySelector('.quiz-host');
        if (host) {
            host.className = 'quiz-host';
        }
    },

    handleAnswer(selectedIndex) {
        if (this.answered) return;
        this.answered = true;

        const q = CONFIG.quizQuestions[this.currentQuestion];
        const isCorrect = q.correct === -1 || selectedIndex === q.correct;

        // Disable all options
        const options = document.querySelectorAll('.quiz-option');
        options.forEach((opt, i) => {
            opt.classList.add('disabled');

            if (q.correct === -1) {
                // All correct
                opt.classList.add('correct');
            } else if (i === q.correct) {
                opt.classList.add('correct');
            } else if (i === selectedIndex && !isCorrect) {
                opt.classList.add('wrong');
            }
        });

        // Update progress dot
        const dots = document.querySelectorAll('.progress-dot');
        if (dots[this.currentQuestion]) {
            dots[this.currentQuestion].classList.remove('active');
            dots[this.currentQuestion].classList.add(isCorrect ? 'completed' : 'wrong');
        }

        // Pompompurin reaction
        const host = document.querySelector('.quiz-host');
        if (host) {
            host.classList.add(isCorrect ? 'happy' : 'comfort');
        }

        if (isCorrect) {
            this.score++;
            if (typeof Music !== 'undefined') Music.playSFX('correct');
        } else {
            if (typeof Music !== 'undefined') Music.playSFX('wrong');
        }

        // Show fun fact
        const funfact = document.querySelector('.quiz-funfact');
        if (funfact) {
            funfact.querySelector('p').textContent = q.funFact;
            setTimeout(() => {
                funfact.classList.add('active');
            }, 500);
        }

        // Auto advance after delay
        setTimeout(() => {
            this.currentQuestion++;
            if (this.currentQuestion < CONFIG.quizQuestions.length) {
                this.showQuestion(this.currentQuestion);
            } else {
                this.complete();
            }
        }, 2500);
    },

    complete() {
        GameState.quizScore = this.score;

        // Show score briefly
        const card = document.querySelector('.quiz-card');
        if (card) {
            const total = CONFIG.quizQuestions.length;
            const stars = this.score >= total ? '⭐⭐⭐' :
                         this.score >= total * 0.6 ? '⭐⭐' : '⭐';

            card.innerHTML = `
                <div class="quiz-score">
                    <p class="quiz-score-text">You got ${this.score}/${total} correct!</p>
                    <p class="quiz-score-stars">${stars}</p>
                    <p class="quiz-score-text" style="font-size: 10px; margin-top: 10px;">Great job! 🎉</p>
                </div>
            `;
        }

        setTimeout(() => {
            GameState.transition('WORLD3_COMPLETE');
        }, 3000);
    }
};
