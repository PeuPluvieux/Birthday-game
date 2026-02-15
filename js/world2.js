// ============================================================
// WORLD 2: FOREST DODGE RUN (IMPROVED)
// Nhu runs through the forest, Bulbasaur auto-jumps alongside.
// Slowpoke and Psyduck are comedic companions.
// 30 obstacles, double jump, 5 lives, screen shake, star FX.
// ============================================================

const World2 = {
    canvas: null,
    ctx: null,
    animationId: null,

    // Canvas dimensions
    W: 320,
    H: 400,

    // Ground Y: bottom of character sprite aligns here
    // Nhu sprite is 32 rows x 2 scale = 64px tall
    // We want feet at groundLine, so player.y = groundLine - 64
    groundLine: 0, // set in start()

    // Player (Nhu)
    player: {
        x: 55,
        y: 0,
        vy: 0,
        isJumping: false,
        canDoubleJump: false,
        hasDoubleJumped: false,
        frame: 'idle',
        frameTimer: 0,
        frameToggle: false
    },

    // Physics constants
    GRAVITY: 0.45,
    JUMP_VY: -9.5,
    DOUBLE_JUMP_VY: -7,

    // Game state
    gameActive: false,
    obstacles: [],
    dodged: 0,
    totalObstacles: 30,
    lives: 5,
    speed: 2.5,
    distance: 0,

    // Obstacle spawn queue - pre-planned pattern queue
    obstacleQueue: [],    // Array of spawn descriptors
    queueIndex: 0,
    spawnTimer: 0,
    nextSpawnAt: 0,

    // Background
    trees: [],
    groundTiles: [],

    // Companions
    bulbasaur: null,   // runs ahead, auto-jumps
    slowpoke: null,    // runs behind, jumps late
    psyduck: null,     // same level, occasionally trips

    // Feedback
    flashTimer: 0,     // blink Nhu on hit
    shakeTimer: 0,     // screen shake on hit
    shakeX: 0,
    shakeY: 0,
    stars: [],         // star particles on successful dodge

    // Companion speech
    companionMsg: null,
    companionMsgTimer: 0,

    // ---------------------------------------------------------------------------
    // START
    // ---------------------------------------------------------------------------
    start() {
        this.canvas = document.getElementById('world2-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.W;
        this.canvas.height = this.H;
        this.scaleCanvas();

        // Ensure previous run cleaned up and prevent double-starts
        try { this.cleanup(); } catch (e) {}
        if (this._isRunning) return;
        this._isRunning = true;
        if (typeof CONFIG !== 'undefined' && CONFIG.debug) console.log('World2.start called');

        // Ground line: 72px from bottom leaves room for ground art
        this.groundLine = this.H - 72;

        // Reset player
        const p = this.player;
        p.x = 55;
        p.y = this.groundLine - 64; // 64 = 32 rows * scale 2
        p.vy = 0;
        p.isJumping = false;
        p.canDoubleJump = false;
        p.hasDoubleJumped = false;
        p.frame = 'idle';
        p.frameTimer = 0;
        p.frameToggle = false;

        // Reset game vars
        this.obstacles = [];
        this.dodged = 0;
        this.lives = 5;
        this.speed = 2.5;
        this.distance = 0;
        this.gameActive = true;
        this.flashTimer = 0;
        this.shakeTimer = 0;
        this.shakeX = 0;
        this.shakeY = 0;
        this.stars = [];
        this.companionMsg = null;
        this.companionMsgTimer = 0;

        // Build the obstacle spawn queue (30 obstacles in groups)
        this._buildQueue();
        this.queueIndex = 0;
        this.spawnTimer = 0;
        this.nextSpawnAt = 90; // first obstacle after 90 frames

        // Companions
        // Bulbasaur: ahead of Nhu, scale 2 -> 64px wide, runs at groundLine - 64
        this.bulbasaur = {
            x: p.x + 50,          // slightly ahead
            y: this.groundLine - 64,
            vy: 0,
            isJumping: false,
            jumpDelay: 0,          // frames until it jumps (set when obstacle detected)
            frame: 'idle',
            frameTimer: 0,
            frameToggle: false,
            scale: 2
        };

        // Slowpoke: behind Nhu, scale 1 -> 32px tall, at groundLine - 32
        this.slowpoke = {
            x: p.x - 45,
            y: this.groundLine - 32,
            vy: 0,
            isJumping: false,
            frame: 'idle',
            frameTimer: 0,
            frameToggle: false,
            scale: 1,
            tripTimer: 0           // makes it jump late
        };

        // Psyduck: same level as player, scale 1, at groundLine - 32
        this.psyduck = {
            x: p.x - 20,
            y: this.groundLine - 32,
            vy: 0,
            isJumping: false,
            frame: 'idle',
            frameTimer: 0,
            frameToggle: false,
            scale: 1,
            bonkTimer: 0,          // comedic trip state
            bonkCooldown: 0
        };

        // Background trees
        this.trees = [];
        for (let i = 0; i < 10; i++) {
            this.trees.push({
                x: i * 40 + Math.random() * 20,
                h: 45 + Math.random() * 35,
                w: 22 + Math.random() * 12,
                layer: Math.random() > 0.5 ? 1 : 2 // 1 = far, 2 = near
            });
        }

        // Ground tiles (scrolling dash marks)
        this.groundTiles = [];
        for (let i = 0; i < Math.ceil(this.W / 16) + 2; i++) {
            this.groundTiles.push(i * 16);
        }

        this.bindControls();
        this.updateHUD();
        // initialize RAF loop with timestamp
        this._lastTime = performance.now();
        this.animationId = requestAnimationFrame((t) => this.loop(t));
    },

    // ---------------------------------------------------------------------------
    // BUILD OBSTACLE QUEUE
    // 30 obstacles total:
    //   [0..9]  - easy singles (rocks/logs)
    //   [10..19] - doubles and tall stumps
    //   [20..29] - hard groups of 2-3
    // Each entry: { type, gap } where gap = frames to wait after previous group
    // ---------------------------------------------------------------------------
    _buildQueue() {
        this.obstacleQueue = [];

        // Helper to push a single obstacle entry
        const single = (type, gap) => ({ pattern: 'single', type, gap });
        // Double = two obstacles close together
        const double = (t1, t2, gap) => ({ pattern: 'double', types: [t1, t2], innerGap: 18, gap });
        // Group = 2 or 3 with a short inner gap
        const group3 = (types, gap) => ({ pattern: 'group3', types, innerGap: 16, gap });

        // Phase 1: easy singles, wide gaps
        const phase1Types = ['rock', 'log', 'rock', 'log', 'rock', 'log', 'rock', 'log', 'rock', 'log'];
        const phase1Gaps  = [100,   90,    95,    100,  85,    90,   95,    100,  85,    90];
        for (let i = 0; i < 10; i++) {
            this.obstacleQueue.push(single(phase1Types[i], phase1Gaps[i]));
        }

        // Phase 2: doubles and stumps, medium gaps
        const phase2 = [
            double('rock', 'rock', 80),
            single('stump', 90),
            double('log', 'rock', 75),
            single('stump', 85),
            double('rock', 'stump', 80),
            single('log', 70),
            double('stump', 'rock', 75),
            single('stump', 80),
            double('log', 'stump', 70),
            single('rock', 75)
        ];
        for (const entry of phase2) this.obstacleQueue.push(entry);

        // Phase 3: groups of 3, tight gaps
        const phase3 = [
            group3(['rock', 'log', 'rock'], 70),
            double('stump', 'stump', 65),
            group3(['log', 'rock', 'stump'], 65),
            double('rock', 'stump', 60),
            group3(['stump', 'rock', 'log'], 60),
            double('log', 'log', 65),
            group3(['rock', 'stump', 'rock'], 58),
            double('stump', 'log', 60),
            group3(['log', 'stump', 'log'], 55),
            double('rock', 'rock', 60)
        ];
        for (const entry of phase3) this.obstacleQueue.push(entry);
    },

    // ---------------------------------------------------------------------------
    // SCALE CANVAS
    // ---------------------------------------------------------------------------
    scaleCanvas() {
        const wrap = this.canvas.parentElement;
        if (!wrap) return;
        const scale = Math.min(wrap.clientWidth / this.W, (wrap.clientHeight - 10) / this.H);
        this.canvas.style.width  = (this.W * scale) + 'px';
        this.canvas.style.height = (this.H * scale) + 'px';
    },

    // ---------------------------------------------------------------------------
    // CONTROLS
    // ---------------------------------------------------------------------------
    bindControls() {
        this._onKeyDown = (e) => {
            if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w') {
                e.preventDefault();
                this.jump();
            }
        };
        document.addEventListener('keydown', this._onKeyDown);

        const jumpBtn = document.getElementById('jump-btn');
        if (jumpBtn) {
            this._onJumpBtnTouch = (e) => { e.preventDefault(); this.jump(); };
            this._onJumpBtnMouse = () => this.jump();
            jumpBtn.addEventListener('touchstart', this._onJumpBtnTouch);
            jumpBtn.addEventListener('mousedown',  this._onJumpBtnMouse);
        }

        this._onCanvasTouch = (e) => { e.preventDefault(); this.jump(); };
        this.canvas.addEventListener('touchstart', this._onCanvasTouch);
    },

    unbindControls() {
        document.removeEventListener('keydown', this._onKeyDown);
        if (this._onCanvasTouch && this.canvas) {
            this.canvas.removeEventListener('touchstart', this._onCanvasTouch);
        }
        const jumpBtn = document.getElementById('jump-btn');
        if (jumpBtn) {
            if (this._onJumpBtnTouch) jumpBtn.removeEventListener('touchstart', this._onJumpBtnTouch);
            if (this._onJumpBtnMouse) jumpBtn.removeEventListener('mousedown',  this._onJumpBtnMouse);
        }
    },

    // ---------------------------------------------------------------------------
    // JUMP - player (Nhu)
    // ---------------------------------------------------------------------------
    jump() {
        if (!this.gameActive) return;
        const p = this.player;

        if (!p.isJumping) {
            // First jump from ground
            p.isJumping = true;
            p.canDoubleJump = true;
            p.hasDoubleJumped = false;
            p.vy = this.JUMP_VY;
            if (typeof Music !== 'undefined') Music.playSFX('jump');
        } else if (p.canDoubleJump && !p.hasDoubleJumped) {
            // Double jump in air
            p.vy = this.DOUBLE_JUMP_VY;
            p.hasDoubleJumped = true;
            p.canDoubleJump = false;
            if (typeof Music !== 'undefined') Music.playSFX('jump');
        }
    },

    // ---------------------------------------------------------------------------
    // GAME LOOP
    // ---------------------------------------------------------------------------
    loop(ts) {
        if (!this.gameActive) return;
        if (!ts) ts = performance.now();
        const last = this._lastTime || ts;
        let dt = ts - last;
        if (dt < 0) dt = 16.67;
        const frameStep = Math.min(Math.max(dt / (1000 / 60), 0.01), 4);
        this._lastTime = ts;
        this._frameStep = frameStep;

        // Re-entrancy guard and FPS counter for debugging
        if (this._inLoop) {
            if (typeof CONFIG !== 'undefined' && CONFIG.debug) console.warn('World2 loop re-entrant - skipping frame');
            return;
        }
        this._inLoop = true;

        this._frameCount = (this._frameCount || 0) + 1;
        const now = ts;
        if (!this._lastFpsTime) this._lastFpsTime = now;
        if (now - this._lastFpsTime >= 1000) {
            if (typeof CONFIG !== 'undefined' && CONFIG.debug) console.log('World2 FPS:', this._frameCount);
            this._frameCount = 0;
            this._lastFpsTime = now;
        }

        this.update();
        this.render();

        this._inLoop = false;
        this.animationId = requestAnimationFrame((t) => this.loop(t));
    },

    // ---------------------------------------------------------------------------
    // UPDATE
    // ---------------------------------------------------------------------------
    update() {
        const fs = this._frameStep || 1;
        this.distance += fs;

        // Speed ramp: 2.5 -> 6 over ~900 frames
        this.speed = 2.5 + Math.min(this.distance / 250, 3.5);

        // ---- Player physics ----
        this._updateCharacterPhysics(this.player, 64, this.GRAVITY);

        // Walking animation - alternate every 7 frames on ground, idle in air
        this.player.frameTimer += fs;
        if (this.player.frameTimer > 7) {
            this.player.frameToggle = !this.player.frameToggle;
            this.player.frameTimer = 0;
        }
        this.player.frame = this.player.isJumping ? 'idle' : (this.player.frameToggle ? 'walk' : 'idle');

        // ---- Obstacle spawning ----
        this.spawnTimer += fs;
        if (this.queueIndex < this.obstacleQueue.length && this.spawnTimer >= this.nextSpawnAt) {
            this._spawnFromQueue();
        }

        // ---- Move and check obstacles ----
        this.obstacles = this.obstacles.filter(o => {
            o.x -= this.speed * fs;

            // Score: obstacle passed player's right edge.
            // Only the last obstacle in each group counts as one dodge.
            if (!o.scored && o.x + o.w < this.player.x) {
                o.scored = true;
                if (o.isLastInGroup) {
                    this.dodged++;
                    this.updateHUD();
                    this._spawnStars(this.player.x + 32, this.player.y + 10);

                    // Companion message occasionally
                    if (Math.random() > 0.55 && this.companionMsgTimer <= 0) {
                        const msgs = CONFIG.world2.companionMessages;
                        this.companionMsg = msgs[Math.floor(Math.random() * msgs.length)];
                        this.companionMsgTimer = 80;
                    }

                    if (this.dodged >= this.totalObstacles) {
                        this.win();
                        return false;
                    }
                }
            }

            // Collision with player (32x32 sprite at scale 2 = 64px, hitbox slightly smaller)
            if (!o.hit && this._checkCollision(o, this.player.x + 8, this.player.y + 8, 48, 52)) {
                o.hit = true;
                this._hitObstacle();
            }

            return o.x > -60;
        });

        // ---- Auto-jump: Bulbasaur ----
        this._updateBulbasaur();

        // ---- Slowpoke (late jumper) ----
        this._updateSlowpoke();

        // ---- Psyduck (trip & recover) ----
        this._updatePsyduck();

        // ---- Background scroll ----
        this.trees.forEach(t => {
            const layerSpeed = t.layer === 1 ? 0.25 : 0.45;
            t.x -= this.speed * layerSpeed * fs;
            if (t.x < -40) {
                t.x = this.W + 10 + Math.random() * 30;
                t.h = 45 + Math.random() * 35;
                t.w = 22 + Math.random() * 12;
            }
        });

        this.groundTiles = this.groundTiles.map(x => {
            x -= this.speed * fs;
            if (x < -16) x += this.groundTiles.length * 16;
            return x;
        });

        // ---- Stars ----
        this.stars = this.stars.filter(s => {
            s.x += s.vx * fs;
            s.y += s.vy * fs;
            s.life -= fs;
            return s.life > 0;
        });

        // ---- Timers ----
        if (this.flashTimer > 0) this.flashTimer--;
        if (this.companionMsgTimer > 0) {
            const fs = this._frameStep || 1;
            this.companionMsgTimer -= fs;
            if (this.companionMsgTimer <= 0) this.companionMsg = null;
        }

        // Screen shake decay
        if (this.shakeTimer > 0) {
            const fs = this._frameStep || 1;
            this.shakeTimer -= fs;
            const mag = this.shakeTimer > 0 ? (this.shakeTimer / 20) * 4 : 0;
            this.shakeX = (Math.random() - 0.5) * mag;
            this.shakeY = (Math.random() - 0.5) * mag;
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }
    },

    // Generic character physics - charH = sprite pixel height
    _updateCharacterPhysics(ch, charH, gravity) {
        const fs = this._frameStep || 1;
        if (ch.isJumping || ch.y < this.groundLine - charH) {
            ch.vy += gravity * fs;
            ch.y += ch.vy * fs;
            if (ch.y >= this.groundLine - charH) {
                ch.y = this.groundLine - charH;
                ch.isJumping = false;
                ch.vy = 0;
            }
        }
    },

    // ---------------------------------------------------------------------------
    // SPAWN FROM QUEUE
    // ---------------------------------------------------------------------------
    _spawnFromQueue() {
        const entry = this.obstacleQueue[this.queueIndex];
        this.queueIndex++;

        // Schedule the gap for the next entry
        if (this.queueIndex < this.obstacleQueue.length) {
            this.nextSpawnAt = this.spawnTimer + entry.gap;
        }

        // Each queue entry = one "dodge" counted. Mark only the rightmost
        // obstacle in the group as the scoring obstacle (isLastInGroup).
        if (entry.pattern === 'single') {
            this._addObstacle(this.W + 10, entry.type, true);
        } else if (entry.pattern === 'double') {
            this._addObstacle(this.W + 10, entry.types[0], false);
            this._addObstacle(this.W + 10 + this._obstacleWidth(entry.types[0]) + entry.innerGap, entry.types[1], true);
        } else if (entry.pattern === 'group3') {
            let xOff = this.W + 10;
            for (let gi = 0; gi < entry.types.length; gi++) {
                const isLast = (gi === entry.types.length - 1);
                this._addObstacle(xOff, entry.types[gi], isLast);
                xOff += this._obstacleWidth(entry.types[gi]) + entry.innerGap;
            }
        }
    },

    _obstacleWidth(type) {
        if (type === 'rock')  return 24;
        if (type === 'log')   return 36;
        if (type === 'stump') return 18;
        return 24;
    },

    _addObstacle(x, type, isLastInGroup) {
        let w, h;
        switch (type) {
            case 'rock':  w = 24; h = 22; break;
            case 'log':   w = 36; h = 16; break;
            case 'stump': w = 18; h = 30; break;
            default:      w = 24; h = 22;
        }
        this.obstacles.push({
            x,
            y: this.groundLine - h,
            w, h, type,
            scored: false,
            hit: false,
            isLastInGroup: !!isLastInGroup // only this obstacle increments dodged
        });
    },

    // ---------------------------------------------------------------------------
    // BULBASAUR AUTO-JUMP
    // Runs 50px ahead of player; jumps when an obstacle is ~80px in front of it.
    // ---------------------------------------------------------------------------
    _updateBulbasaur() {
        const b = this.bulbasaur;
        const charH = b.scale * 32; // 64

        // Keep Bulbasaur slightly ahead of player
        const targetX = this.player.x + 50;
        if (b.x < targetX) b.x += 1;

        this._updateCharacterPhysics(b, charH, this.GRAVITY);

        // Check for upcoming obstacles
        if (!b.isJumping) {
            for (const o of this.obstacles) {
                if (o.x > b.x && o.x < b.x + 80) {
                    // Jump to clear
                    b.isJumping = true;
                    b.vy = this.JUMP_VY;
                    break;
                }
            }
        }

        // Animate
        b.frameTimer++;
        if (b.frameTimer > 7) {
            b.frameToggle = !b.frameToggle;
            b.frameTimer = 0;
        }
        b.frame = b.isJumping ? 'idle' : (b.frameToggle ? 'walk' : 'idle');
    },

    // ---------------------------------------------------------------------------
    // SLOWPOKE - runs 45px behind player, jumps at last moment (40px detection)
    // ---------------------------------------------------------------------------
    _updateSlowpoke() {
        const s = this.slowpoke;
        const charH = s.scale * 32; // 32

        // Keep slightly behind player
        const targetX = this.player.x - 45;
        if (s.x < targetX) s.x += 0.8;
        if (s.x > targetX + 5) s.x -= 0.5;

        this._updateCharacterPhysics(s, charH, this.GRAVITY);

        // Jumps very late: only when obstacle is 30px away
        if (!s.isJumping && s.tripTimer <= 0) {
            for (const o of this.obstacles) {
                if (o.x > s.x && o.x < s.x + 32) {
                    s.isJumping = true;
                    s.vy = this.JUMP_VY * 0.85; // a bit weaker - barely clears
                    s.tripTimer = 20; // short cooldown between jumps
                    break;
                }
            }
        }
        if (s.tripTimer > 0) s.tripTimer--;

        // Animate
        s.frameTimer++;
        if (s.frameTimer > 10) { // slower animation = lazier run
            s.frameToggle = !s.frameToggle;
            s.frameTimer = 0;
        }
        s.frame = s.isJumping ? 'idle' : (s.frameToggle ? 'walk' : 'idle');
    },

    // ---------------------------------------------------------------------------
    // PSYDUCK - at same level as player, sometimes bonks then recovers
    // ---------------------------------------------------------------------------
    _updatePsyduck() {
        const d = this.psyduck;
        const charH = d.scale * 32; // 32

        // Follow slightly behind player
        const targetX = this.player.x - 20;
        if (d.x < targetX) d.x += 0.9;
        if (d.x > targetX + 5) d.x -= 0.5;

        this._updateCharacterPhysics(d, charH, this.GRAVITY);

        if (d.bonkTimer > 0) {
            // In bonk state: Psyduck doesn't jump, just stumbles (handled visually)
            d.bonkTimer--;
        } else {
            // Jump when obstacle is 55px ahead, but randomly fail (10% chance = bonk)
            if (!d.isJumping && d.bonkCooldown <= 0) {
                for (const o of this.obstacles) {
                    if (o.x > d.x && o.x < d.x + 58) {
                        if (Math.random() < 0.12) {
                            // Psyduck bonks: skip the jump this obstacle
                            d.bonkTimer = 30;
                        } else {
                            d.isJumping = true;
                            d.vy = this.JUMP_VY * 0.9;
                        }
                        d.bonkCooldown = 25;
                        break;
                    }
                }
            }
        }
        if (d.bonkCooldown > 0) d.bonkCooldown--;

        // Animate
        d.frameTimer++;
        if (d.frameTimer > 8) {
            d.frameToggle = !d.frameToggle;
            d.frameTimer = 0;
        }
        // Use walk frame when bonking (arms up = holding head)
        d.frame = (d.bonkTimer > 0) ? 'walk' : (d.isJumping ? 'idle' : (d.frameToggle ? 'walk' : 'idle'));
    },

    // ---------------------------------------------------------------------------
    // COLLISION CHECK
    // ---------------------------------------------------------------------------
    _checkCollision(o, px, py, pw, ph) {
        return px < o.x + o.w &&
               px + pw > o.x &&
               py < o.y + o.h &&
               py + ph > o.y;
    },

    // ---------------------------------------------------------------------------
    // HIT OBSTACLE
    // ---------------------------------------------------------------------------
    _hitObstacle() {
        this.lives--;
        this.updateHUD();
        if (typeof Music !== 'undefined') Music.playSFX('hit');
        this.flashTimer = 40;
        this.shakeTimer = 20;

        if (this.lives <= 0) {
            this.gameOver();
        }
    },

    // ---------------------------------------------------------------------------
    // STAR PARTICLES (on successful dodge)
    // ---------------------------------------------------------------------------
    _spawnStars(x, y) {
        const colors = ['#ffd700', '#fffacd', '#fff', '#ffec8b'];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            this.stars.push({
                x, y,
                vx: Math.cos(angle) * (1.5 + Math.random()),
                vy: Math.sin(angle) * (1.5 + Math.random()) - 1,
                life: 25 + Math.floor(Math.random() * 15),
                maxLife: 40,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    },

    // ---------------------------------------------------------------------------
    // RENDER
    // ---------------------------------------------------------------------------
    render() {
        const ctx = this.ctx;
        ctx.save();

        // Screen shake
        if (this.shakeTimer > 0) {
            ctx.translate(this.shakeX, this.shakeY);
        }

        ctx.clearRect(-4, -4, this.W + 8, this.H + 8);

        this._drawBackground(ctx);
        this._drawGround(ctx);
        this._drawObstacles(ctx);
        this._drawCompanions(ctx);
        this._drawPlayer(ctx);
        this._drawStars(ctx);
        this._drawProgressBar(ctx);
        this._drawCompanionMsg(ctx);

        ctx.restore();
    },

    _drawBackground(ctx) {
        // Sky gradient (dark forest)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundLine);
        skyGrad.addColorStop(0, '#0d1a0d');
        skyGrad.addColorStop(1, '#1a3a1a');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, this.W, this.groundLine + 1);

        // Far trees (layer 1)
        this.trees.filter(t => t.layer === 1).forEach(t => {
            this._drawTree(ctx, t, '#0a2010', '#0d2a14');
        });

        // Near trees (layer 2)
        this.trees.filter(t => t.layer === 2).forEach(t => {
            this._drawTree(ctx, t, '#0e3018', '#145a20');
        });
    },

    _drawTree(ctx, t, trunkColor, leafColor) {
        const baseY = this.groundLine;
        // Trunk
        ctx.fillStyle = trunkColor;
        ctx.fillRect(t.x + t.w / 2 - 4, baseY - t.h, 8, t.h);
        // Foliage layers
        ctx.fillStyle = leafColor;
        ctx.beginPath();
        ctx.arc(t.x + t.w / 2, baseY - t.h - 8, t.w / 2 + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = leafColor;
        ctx.beginPath();
        ctx.arc(t.x + t.w / 2 - 4, baseY - t.h - 4, t.w / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(t.x + t.w / 2 + 4, baseY - t.h - 2, t.w / 3, 0, Math.PI * 2);
        ctx.fill();
    },

    _drawGround(ctx) {
        const gY = this.groundLine;

        // Dirt fill
        ctx.fillStyle = '#4a3020';
        ctx.fillRect(0, gY, this.W, this.H - gY);

        // Grass top strip
        ctx.fillStyle = '#2e7d32';
        ctx.fillRect(0, gY, this.W, 5);
        ctx.fillStyle = '#388e3c';
        ctx.fillRect(0, gY + 1, this.W, 2);

        // Ground detail lines
        ctx.fillStyle = '#5d4037';
        this.groundTiles.forEach(x => {
            ctx.fillRect(x, gY + 8, 12, 2);
        });

        // Deeper dirt texture
        ctx.fillStyle = '#3e2720';
        this.groundTiles.forEach((x, i) => {
            ctx.fillRect(x + 6, gY + 14 + (i % 2) * 4, 8, 2);
        });
    },

    _drawObstacles(ctx) {
        this.obstacles.forEach(o => {
            switch (o.type) {
                case 'rock':
                    // Rock body
                    ctx.fillStyle = '#6d7b7c';
                    ctx.beginPath();
                    ctx.roundRect(o.x, o.y + 4, o.w, o.h - 4, 4);
                    ctx.fill();
                    // Rock top highlight
                    ctx.fillStyle = '#8fa0a0';
                    ctx.beginPath();
                    ctx.roundRect(o.x + 2, o.y, o.w - 4, o.h - 8, 4);
                    ctx.fill();
                    // Shine
                    ctx.fillStyle = '#b0c4c4';
                    ctx.fillRect(o.x + 4, o.y + 3, 5, 3);
                    // Dark base
                    ctx.fillStyle = '#4a5a5b';
                    ctx.fillRect(o.x + 2, o.y + o.h - 4, o.w - 4, 3);
                    break;

                case 'log':
                    // Log body
                    ctx.fillStyle = '#5d4037';
                    ctx.fillRect(o.x, o.y, o.w, o.h);
                    // Wood grain
                    ctx.fillStyle = '#795548';
                    ctx.fillRect(o.x + 2, o.y + 2, o.w - 4, o.h - 4);
                    ctx.fillStyle = '#8d6e63';
                    ctx.fillRect(o.x + 4, o.y + 4, o.w - 8, o.h - 8);
                    // End rings
                    ctx.fillStyle = '#4e342e';
                    ctx.fillRect(o.x, o.y, 4, o.h);
                    ctx.fillRect(o.x + o.w - 4, o.y, 4, o.h);
                    ctx.fillStyle = '#6d4c41';
                    ctx.fillRect(o.x + 1, o.y + 1, 2, o.h - 2);
                    ctx.fillRect(o.x + o.w - 3, o.y + 1, 2, o.h - 2);
                    break;

                case 'stump':
                    // Stump body - taller, narrower
                    ctx.fillStyle = '#5d4037';
                    ctx.fillRect(o.x, o.y + 6, o.w, o.h - 6);
                    ctx.fillStyle = '#795548';
                    ctx.fillRect(o.x + 2, o.y + 8, o.w - 4, o.h - 10);
                    // Stump top (wider cap)
                    ctx.fillStyle = '#8d6e63';
                    ctx.beginPath();
                    ctx.roundRect(o.x - 2, o.y, o.w + 4, 10, 2);
                    ctx.fill();
                    ctx.fillStyle = '#a1887f';
                    ctx.beginPath();
                    ctx.roundRect(o.x, o.y + 2, o.w, 6, 2);
                    ctx.fill();
                    // Tree ring detail on top
                    ctx.fillStyle = '#6d4c41';
                    ctx.fillRect(o.x + o.w / 2 - 1, o.y + 2, 2, 5);
                    break;
            }
        });
    },

    _drawCompanions(ctx) {
        // Bulbasaur & Slowpoke face left by default, flip to face right.
        // Psyduck is front-facing, no flip needed.

        // Bulbasaur (flip + nudge down to align feet with ground)
        const b = this.bulbasaur;
        const bW = 32 * b.scale;
        ctx.save();
        ctx.translate(b.x + bW, b.y + 14);
        ctx.scale(-1, 1);
        drawSprite(ctx, SPRITES.bulbasaur, b.scale, 0, 0, b.frame);
        ctx.restore();

        // Slowpoke (flip to face right)
        const s = this.slowpoke;
        const sW = 48 * s.scale;
        ctx.save();
        ctx.translate(s.x + sW, s.y);
        ctx.scale(-1, 1);
        drawSprite(ctx, SPRITES.slowpoke, s.scale, 0, 0, s.frame);
        ctx.restore();

        // Psyduck (front-facing, no flip)
        const d = this.psyduck;
        const bonkOffX = d.bonkTimer > 0 ? Math.sin(d.bonkTimer * 1.2) * 2 : 0;
        drawSprite(ctx, SPRITES.psyduck, d.scale, d.x + bonkOffX, d.y, d.frame);
    },

    _drawPlayer(ctx) {
        // Blink on hit
        if (this.flashTimer > 0 && this.flashTimer % 4 < 2) return;

        const p = this.player;

        // Jump arc glow (subtle)
        if (p.isJumping) {
            ctx.fillStyle = 'rgba(255, 255, 200, 0.18)';
            ctx.beginPath();
            ctx.ellipse(p.x + 32, p.y + 60, 22, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Nudge down to align feet with ground (image has padding at bottom)
        drawSprite(ctx, SPRITES.nhu, 2, p.x, p.y + 10, p.frame);

        // Shadow on ground
        const shadowAlpha = p.isJumping ? Math.max(0, 0.3 - (this.groundLine - 64 - p.y) / 200) : 0.25;
        ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
        ctx.beginPath();
        const groundY = this.groundLine;
        const dist = groundY - (p.y + 64);
        const shadowW = Math.max(10, 36 - dist * 0.3);
        ctx.ellipse(p.x + 32, groundY + 2, shadowW / 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();
    },

    _drawStars(ctx) {
        this.stars.forEach(s => {
            const alpha = s.life / s.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = s.color;
            const size = 2 + alpha * 2;
            ctx.fillRect(s.x - size / 2, s.y - size / 2, size, size);
        });
        ctx.globalAlpha = 1;
    },

    _drawProgressBar(ctx) {
        const barX = 10;
        const barY = this.groundLine + 12;
        const barW = this.W - 20;
        const barH = 6;
        const progress = Math.min(this.dodged / this.totalObstacles, 1);

        // Track
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, 3);
        ctx.fill();

        // Fill
        if (progress > 0) {
            const grad = ctx.createLinearGradient(barX, 0, barX + barW * progress, 0);
            grad.addColorStop(0, '#ff8f00');
            grad.addColorStop(1, '#ffd700');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(barX, barY, barW * progress, barH, 3);
            ctx.fill();
        }

        // Progress text
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '8px "Pixelify Sans", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.dodged} / ${this.totalObstacles}`, this.W / 2, barY + 16);
        ctx.textAlign = 'left';
    },

    _drawCompanionMsg(ctx) {
        if (!this.companionMsg) return;
        const p = this.player;
        const msg = this.companionMsg;
        const tw = Math.min(msg.length * 5 + 16, 150);
        const bx = Math.min(p.x + 48, this.W - tw - 4);
        const by = p.y - 28;

        // Bubble
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(bx, by, tw, 20, 4);
        ctx.fill();
        ctx.stroke();

        // Tail
        ctx.beginPath();
        ctx.moveTo(bx + 10, by + 20);
        ctx.lineTo(bx + 6, by + 26);
        ctx.lineTo(bx + 16, by + 20);
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.fill();

        // Text
        ctx.fillStyle = '#222';
        ctx.font = '9px "Pixelify Sans", monospace';
        ctx.fillText(msg, bx + 6, by + 13, tw - 8);
    },

    // ---------------------------------------------------------------------------
    // HUD
    // ---------------------------------------------------------------------------
    updateHUD() {
        const obsEl   = document.querySelector('.hud-obstacles');
        const livesEl = document.querySelector('.hud-lives');
        if (obsEl)   obsEl.textContent   = `Run! ${this.dodged}/${this.totalObstacles}`;
        if (livesEl) livesEl.textContent = '❤️'.repeat(this.lives) + '🖤'.repeat(5 - this.lives);
    },

    // ---------------------------------------------------------------------------
    // WIN
    // ---------------------------------------------------------------------------
    win() {
        this.gameActive = false;
        cancelAnimationFrame(this.animationId);
        this.unbindControls();

        const portal = document.querySelector('.portal-overlay');
        if (portal) portal.classList.add('active');

        setTimeout(() => {
            if (portal) portal.classList.remove('active');
            GameState.transition('WORLD2_COMPLETE');
        }, 2500);
    },

    // ---------------------------------------------------------------------------
    // GAME OVER
    // ---------------------------------------------------------------------------
    gameOver() {
        this.gameActive = false;
        cancelAnimationFrame(this.animationId);
        this.unbindControls();

        const retry = document.querySelector('.world2-retry');
        if (retry) {
            retry.classList.add('active');
            const retryText = retry.querySelector('.retry-text');
            if (retryText) {
                retryText.textContent =
                    `Oh no! You dodged ${this.dodged}/${this.totalObstacles} obstacles. Almost there! Let's try again!`;
            }
            const retryBtn = retry.querySelector('.retry-btn');
            if (retryBtn) {
                retryBtn.onclick = () => {
                    retry.classList.remove('active');
                    this.start();
                };
            }
        }
    },

    // ---------------------------------------------------------------------------
    // CLEANUP
    // ---------------------------------------------------------------------------
    cleanup() {
        this._isRunning = false;
        this.gameActive = false;
        if (this.animationId) { cancelAnimationFrame(this.animationId); this.animationId = null; }
        this.unbindControls();
    }
};
