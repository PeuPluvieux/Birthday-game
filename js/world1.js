// ============================================================
// WORLD 1: BERRY COLLECTING GAME
// Như (player) walks around collecting berries across 3 levels.
// Bulbasaur follows as a companion. Slowpoke and Psyduck wander.
// Canvas-based top-down game with timer, obstacles, moving berries.
// ============================================================

const World1 = {
    canvas: null,
    ctx: null,
    animationId: null,
    gameActive: false,

    // Game dimensions
    W: 320,
    H: 400,

    // Level definitions
    LEVELS: [
        {
            berriesToCollect: 5,
            timeLimit: 60,
            obstacleCount: 6,
            berrySpeed: 0.4,
            berryFlee: false,
            tallGrass: false
        },
        {
            berriesToCollect: 7,
            timeLimit: 75,
            obstacleCount: 10,
            berrySpeed: 0.9,
            berryFlee: false,
            tallGrass: true
        },
        {
            berriesToCollect: 8,
            timeLimit: 90,
            obstacleCount: 14,
            berrySpeed: 1.4,
            berryFlee: true,
            tallGrass: true
        }
    ],

    // Current level index (0-based)
    currentLevel: 0,

    // Player (Như)
    player: {
        x: 0, y: 0,
        speed: 2.5,
        frame: 0, frameTimer: 0,
        moving: false
    },

    // Companion (Bulbasaur follows Như)
    companion: {
        x: 0, y: 0,
        frame: 0, frameTimer: 0,
        facingRight: false
    },

    // Entities
    berries: [],
    obstacles: [],
    tallGrassZones: [],
    npcs: [],

    // Per-level state
    collected: 0,
    timeLeft: 0,
    keys: {},
    sparkles: [],
    speechBubble: null,
    speechTimer: 0,

    // Transition state
    transitioning: false,
    transitionTimer: 0,
    transitionMessage: '',

    start() {
        // Ensure any previous run is fully cleaned up to avoid duplicate loops/intervals
        try { this.cleanup(); } catch (e) {}

        // Prevent double-starts (debounce if start triggered twice quickly)
        if (this._isRunning) return;
        this._isRunning = true;
        if (typeof CONFIG !== 'undefined' && CONFIG.debug) console.log('World1.start called');

        this.canvas = document.getElementById('world1-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.W;
        this.canvas.height = this.H;

        this.scaleCanvas();

        // Reset all state for a fresh game
        this.currentLevel = 0;
        this.keys = {};
        this.gameActive = true;
        this.transitioning = false;

        this._startLevel();
        this.bindControls();

        // initialize lastTime and start RAF-driven loop
        this._lastTime = performance.now();
        this.animationId = requestAnimationFrame((t) => this.loop(t));
    },

    scaleCanvas() {
        const wrap = this.canvas.parentElement;
        if (!wrap) return;
        const scale = Math.min(wrap.clientWidth / this.W, (wrap.clientHeight - 10) / this.H);
        this.canvas.style.width = (this.W * scale) + 'px';
        this.canvas.style.height = (this.H * scale) + 'px';
    },

    // -------------------------------------------------------
    // Level setup
    // -------------------------------------------------------
    _startLevel() {
        const lvl = this.LEVELS[this.currentLevel];

        this.collected = 0;
        this.timeLeft = lvl.timeLimit;
        this.sparkles = [];
        this.speechBubble = null;
        this.speechTimer = 0;
        this.transitioning = false;

        // Place Như in centre
        this.player.x = this.W / 2 - 8;
        this.player.y = this.H / 2 - 8;
        this.player.frame = 0;
        this.player.frameTimer = 0;
        this.player.moving = false;

        // Companion starts just behind Như
        this.companion.x = this.player.x - 20;
        this.companion.y = this.player.y + 4;
        this.companion.frame = 0;
        this.companion.frameTimer = 0;

        this._generateObstacles(lvl.obstacleCount);
        this._generateTallGrass(lvl.tallGrass);
        this._generateBerries(lvl.berriesToCollect, lvl.berrySpeed);
        this._setupNPCs();

        this.updateHUD();

        // Per-level timer
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (!this.gameActive || this.transitioning) return;
            this.timeLeft--;
            this.updateHUD();
            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    },

    // -------------------------------------------------------
    // World generation
    // -------------------------------------------------------
    _generateObstacles(count) {
        this.obstacles = [];
        const cx = this.W / 2;
        const cy = this.H / 2;
        const CLEAR_RADIUS = 55; // keep centre clear for player spawn

        for (let i = 0; i < count; i++) {
            let ox, oy, ow, oh, valid;
            let attempts = 0;
            do {
                ow = 18 + Math.random() * 16;
                oh = 14 + Math.random() * 10;
                ox = Math.floor(Math.random() * (this.W - ow - 20)) + 10;
                oy = Math.floor(Math.random() * (this.H - oh - 20)) + 10;
                valid = true;

                // Keep spawn area clear
                if (ox < cx + CLEAR_RADIUS && ox + ow > cx - CLEAR_RADIUS &&
                    oy < cy + CLEAR_RADIUS && oy + oh > cy - CLEAR_RADIUS) {
                    valid = false;
                }

                // Don't overlap existing obstacles (with padding)
                for (const o of this.obstacles) {
                    if (ox < o.x + o.w + 8 && ox + ow + 8 > o.x &&
                        oy < o.y + o.h + 8 && oy + oh + 8 > o.y) {
                        valid = false;
                        break;
                    }
                }

                attempts++;
            } while (!valid && attempts < 80);

            if (valid) {
                this.obstacles.push({
                    x: ox, y: oy, w: ow, h: oh,
                    type: Math.random() > 0.5 ? 'rock' : 'bush'
                });
            }
        }
    },

    _generateTallGrass(enabled) {
        this.tallGrassZones = [];
        if (!enabled) return;

        // A few rectangular tall-grass patches that slow the player
        const patches = [
            { x: 20,  y: 20,  w: 60, h: 40 },
            { x: 200, y: 60,  w: 70, h: 40 },
            { x: 40,  y: 300, w: 80, h: 50 },
            { x: 210, y: 280, w: 70, h: 60 }
        ];

        for (const p of patches) {
            // Check it doesn't fully overlap player spawn
            const cx = this.W / 2;
            const cy = this.H / 2;
            if (p.x < cx + 40 && p.x + p.w > cx - 40 &&
                p.y < cy + 40 && p.y + p.h > cy - 40) continue;
            this.tallGrassZones.push(p);
        }
    },

    _generateBerries(total, speed) {
        this.berries = [];
        const spriteKeys = ['berry', 'berryBlue', 'berryPink'];

        for (let i = 0; i < total; i++) {
            let bx, by, valid;
            let attempts = 0;
            do {
                bx = Math.floor(Math.random() * (this.W - 40)) + 20;
                by = Math.floor(Math.random() * (this.H - 40)) + 20;
                valid = true;

                // Don't overlap obstacles
                for (const o of this.obstacles) {
                    if (bx + 8 > o.x && bx < o.x + o.w + 4 &&
                        by + 8 > o.y && by < o.y + o.h + 4) {
                        valid = false;
                        break;
                    }
                }

                // Don't overlap other berries
                for (const b of this.berries) {
                    if (Math.abs(bx - b.x) < 22 && Math.abs(by - b.y) < 22) {
                        valid = false;
                        break;
                    }
                }

                // Keep away from player spawn
                if (Math.abs(bx - this.W / 2) < 40 && Math.abs(by - this.H / 2) < 40) {
                    valid = false;
                }

                attempts++;
            } while (!valid && attempts < 120);

            const angle = Math.random() * Math.PI * 2;
            this.berries.push({
                x: bx, y: by,
                spriteKey: spriteKeys[i % 3],
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                bob: Math.random() * Math.PI * 2,
                baseSpeed: speed
            });
        }
    },

    _setupNPCs() {
        this.npcs = [
            {
                name: 'slowpoke',
                x: 55, y: 70,
                dx: 0.3, dy: 0.2,
                changeTimer: 0,
                changeInterval: 130 + Math.random() * 70,
                messages: CONFIG.world1.slowpokeMessages,
                msgIndex: 0,
                frame: 0, frameTimer: 0,
                facingRight: true
            },
            {
                name: 'psyduck',
                x: 230, y: 290,
                dx: -0.4, dy: 0.3,
                changeTimer: 0,
                changeInterval: 100 + Math.random() * 70,
                messages: CONFIG.world1.psyduckMessages,
                msgIndex: 0,
                frame: 0, frameTimer: 0,
                facingRight: false
            }
        ];
    },

    // -------------------------------------------------------
    // Controls
    // -------------------------------------------------------
    bindControls() {
        this._onKeyDown = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
                 'w', 'a', 's', 'd'].includes(e.key)) {
                e.preventDefault();
                this.keys[e.key] = true;
            }
        };
        this._onKeyUp = (e) => {
            this.keys[e.key] = false;
        };
        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup', this._onKeyUp);

        ['up', 'down', 'left', 'right'].forEach(dir => {
            const btn = document.getElementById('dpad-' + dir);
            if (!btn) return;
            const keyOn  = () => { this.keys['dpad_' + dir] = true; };
            const keyOff = () => { this.keys['dpad_' + dir] = false; };
            btn.addEventListener('touchstart',  (e) => { e.preventDefault(); keyOn(); });
            btn.addEventListener('touchend',    (e) => { e.preventDefault(); keyOff(); });
            btn.addEventListener('touchcancel', (e) => { e.preventDefault(); keyOff(); });
            btn.addEventListener('mousedown',  keyOn);
            btn.addEventListener('mouseup',    keyOff);
            btn.addEventListener('mouseleave', keyOff);
        });
    },

    unbindControls() {
        document.removeEventListener('keydown', this._onKeyDown);
        document.removeEventListener('keyup', this._onKeyUp);
    },

    // -------------------------------------------------------
    // AABB helper – returns true if rect A overlaps rect B
    // -------------------------------------------------------
    _rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
        return ax < bx + bw && ax + aw > bx &&
               ay < by + bh && ay + ah > by;
    },

    // Check whether a proposed player rectangle collides with any obstacle.
    // Returns true if blocked.
    _collidesWithObstacle(px, py) {
        const PW = 20, PH = 20; // player hitbox (smaller than 64px sprite for feel)
        const PAD = 2;           // extra safety padding on obstacles
        for (const o of this.obstacles) {
            if (this._rectsOverlap(
                px + 3, py + 6, PW, PH,
                o.x - PAD, o.y - PAD, o.w + PAD * 2, o.h + PAD * 2
            )) {
                return true;
            }
        }
        return false;
    },

    // -------------------------------------------------------
    // Game loop
    // -------------------------------------------------------
    loop(ts) {
        if (!this.gameActive) return;

        // Timestamp handling and frameStep (normalize to 60fps baseline)
        if (!ts) ts = performance.now();
        const last = this._lastTime || ts;
        let dt = ts - last;
        if (dt < 0) dt = 16.67;
        // frameStep = how many 60Hz frames passed (1 = 1/60s)
        const frameStep = Math.min(Math.max(dt / (1000 / 60), 0.01), 4);
        this._lastTime = ts;
        this._frameStep = frameStep;

        // Re-entrancy guard: if loop is already running, bail out
        if (this._inLoop) {
            if (typeof CONFIG !== 'undefined' && CONFIG.debug) console.warn('World1 loop re-entrant - skipping frame');
            return;
        }
        this._inLoop = true;

        // Frame counter for debugging (log when CONFIG.debug is true)
        this._frameCount = (this._frameCount || 0) + 1;
        const now = ts;
        if (!this._lastFpsTime) this._lastFpsTime = now;
        if (now - this._lastFpsTime >= 1000) {
            if (typeof CONFIG !== 'undefined' && CONFIG.debug) console.log('World1 FPS:', this._frameCount);
            this._frameCount = 0;
            this._lastFpsTime = now;
        }

        this.update();
        this.render();

        this._inLoop = false;
        this.animationId = requestAnimationFrame((t) => this.loop(t));
    },

    // -------------------------------------------------------
    // Update
    // -------------------------------------------------------
    update() {
        if (this.transitioning) {
            const fs = this._frameStep || 1;
            this.transitionTimer -= fs;
            if (this.transitionTimer <= 0) {
                this._advanceLevel();
            }
            return;
        }

        // --- Player movement intent ---
        let dx = 0, dy = 0;
        if (this.keys['ArrowUp']    || this.keys['w'] || this.keys['dpad_up'])    { dy = -1; }
        if (this.keys['ArrowDown']  || this.keys['s'] || this.keys['dpad_down'])  { dy =  1; }
        if (this.keys['ArrowLeft']  || this.keys['a'] || this.keys['dpad_left'])  { dx = -1; }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['dpad_right']) { dx =  1; }

        this.player.moving = (dx !== 0 || dy !== 0);

        // Normalise diagonal
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        // Check tall grass – slow down
        let speed = this.player.speed;
        for (const tg of this.tallGrassZones) {
            if (this._rectsOverlap(
                this.player.x + 2, this.player.y + 6, 12, 10,
                tg.x, tg.y, tg.w, tg.h
            )) {
                speed *= 0.45;
                break;
            }
        }

        const fs = this._frameStep || 1;
        const moveX = dx * speed * fs;
        const moveY = dy * speed * fs;

        // --- AABB collision with wall-sliding ---
        // Try full move first
        let newX = this.player.x + moveX;
        let newY = this.player.y + moveY;

        // Clamp to canvas boundary (sprite is 32x32 at scale 2 = 64px, but hitbox is smaller)
        newX = Math.max(0, Math.min(this.W - 32, newX));
        newY = Math.max(0, Math.min(this.H - 32, newY));

        if (!this._collidesWithObstacle(newX, newY)) {
            // Full move succeeds
            this.player.x = newX;
            this.player.y = newY;
        } else {
            // Try X-axis only (slide along Y wall)
            const tryX = Math.max(0, Math.min(this.W - 32, this.player.x + moveX));
            if (!this._collidesWithObstacle(tryX, this.player.y)) {
                this.player.x = tryX;
            }
            // Try Y-axis only (slide along X wall)
            const tryY = Math.max(0, Math.min(this.H - 32, this.player.y + moveY));
            if (!this._collidesWithObstacle(this.player.x, tryY)) {
                this.player.y = tryY;
            }
            // If both single-axis moves are also blocked, player stays put.
        }

        // Walk animation for Như
        if (this.player.moving) {
            this.player.frameTimer += fs;
            if (this.player.frameTimer >= 10) {
                this.player.frame = (this.player.frame + 1) % 2;
                this.player.frameTimer = 0;
            }
        } else {
            this.player.frame = 0;
            this.player.frameTimer = 0;
        }

        // --- Companion Bulbasaur follows Như with lerp lag ---
        const compLerp = 0.07;
        const targetX = this.player.x - 18;
        const targetY = this.player.y + 4;
        const prevCX = this.companion.x;
        const prevCY = this.companion.y;
        this.companion.x += (targetX - this.companion.x) * compLerp;
        this.companion.y += (targetY - this.companion.y) * compLerp;

        const compMoving = Math.abs(this.companion.x - prevCX) > 0.3 ||
                           Math.abs(this.companion.y - prevCY) > 0.3;
        // Track facing direction (with cooldown to prevent flickering)
        if (!this.companion.faceCooldown) this.companion.faceCooldown = 0;
        if (this.companion.faceCooldown > 0) {
            this.companion.faceCooldown -= fs;
        } else {
            const cdx = this.companion.x - prevCX;
            if (cdx > 0.3 && !this.companion.facingRight) { this.companion.facingRight = true; this.companion.faceCooldown = 15; }
            else if (cdx < -0.3 && this.companion.facingRight) { this.companion.facingRight = false; this.companion.faceCooldown = 15; }
        }
        if (compMoving) {
            this.companion.frameTimer += fs;
            if (this.companion.frameTimer >= 12) {
                this.companion.frame = (this.companion.frame + 1) % 2;
                this.companion.frameTimer = 0;
            }
        } else {
            this.companion.frame = 0;
            this.companion.frameTimer = 0;
        }

        // --- Berry movement ---
        const lvl = this.LEVELS[this.currentLevel];
        this.berries = this.berries.filter(b => {
            b.bob += 0.06 * fs;

            if (lvl.berryFlee) {
                // Level 3: berries flee from Như when close
                const fdx = b.x - (this.player.x + 8);
                const fdy = b.y - (this.player.y + 8);
                const fdist = Math.sqrt(fdx * fdx + fdy * fdy);
                if (fdist < 70 && fdist > 0.1) {
                    b.dx += ((fdx / fdist) * 0.18) * fs;
                    b.dy += ((fdy / fdist) * 0.18) * fs;
                    // Clamp flee speed
                    const bspd = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
                    const maxSpd = b.baseSpeed * 2.2;
                    if (bspd > maxSpd) {
                        b.dx = (b.dx / bspd) * maxSpd;
                        b.dy = (b.dy / bspd) * maxSpd;
                    }
                } else {
                    // Gentle friction when not fleeing so berries don't coast forever
                    b.dx *= Math.pow(0.97, fs);
                    b.dy *= Math.pow(0.97, fs);
                    // Minimum wander speed
                    const bspd = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
                    if (bspd < b.baseSpeed * 0.3) {
                        const ang = Math.random() * Math.PI * 2;
                        b.dx = Math.cos(ang) * b.baseSpeed * 0.4;
                        b.dy = Math.sin(ang) * b.baseSpeed * 0.4;
                    }
                }
            }

            b.x += b.dx * fs;
            b.y += b.dy * fs;

            // Bounce off walls
            if (b.x < 6)          { b.x = 6;          b.dx = Math.abs(b.dx); }
            if (b.x > this.W - 14) { b.x = this.W - 14; b.dx = -Math.abs(b.dx); }
            if (b.y < 6)          { b.y = 6;          b.dy = Math.abs(b.dy); }
            if (b.y > this.H - 14) { b.y = this.H - 14; b.dy = -Math.abs(b.dy); }

            // Bounce off obstacles
            for (const o of this.obstacles) {
                if (this._rectsOverlap(b.x, b.y, 8, 8, o.x - 4, o.y - 4, o.w + 8, o.h + 8)) {
                    b.dx *= -1;
                    b.dy *= -1;
                    b.x += b.dx * 2;
                    b.y += b.dy * 2;
                    break;
                }
            }

            // Check collection (Như centre vs berry centre)
            const px = this.player.x + 8;
            const py = this.player.y + 8;
            const bcx = b.x + 4;
            const bcy = b.y + 4;
            const dist = Math.sqrt((px - bcx) * (px - bcx) + (py - bcy) * (py - bcy));

            if (dist < 16) {
                this.collected++;
                if (typeof Music !== 'undefined') Music.playSFX('collect');
                this.sparkles.push({
                    x: b.x, y: b.y,
                    timer: 24,
                    particles: Array.from({ length: 7 }, () => ({
                        dx: (Math.random() - 0.5) * 4.5,
                        dy: (Math.random() - 0.5) * 4.5,
                        life: 1.0
                    }))
                });
                this.updateHUD();

                if (this.collected >= lvl.berriesToCollect) {
                    this._levelComplete();
                }
                return false; // Remove berry
            }
            return true;
        });

        // --- NPC movement ---
        this.npcs.forEach(npc => {
            npc.x += npc.dx * fs;
            npc.y += npc.dy * fs;

            if (npc.x < 8)          { npc.x = 8;          npc.dx =  Math.abs(npc.dx); }
            if (npc.x > this.W - 64) { npc.x = this.W - 64; npc.dx = -Math.abs(npc.dx); }
            if (npc.y < 8)          { npc.y = 8;          npc.dy =  Math.abs(npc.dy); }
            if (npc.y > this.H - 64) { npc.y = this.H - 64; npc.dy = -Math.abs(npc.dy); }

            // Bounce off obstacles
            for (const o of this.obstacles) {
                if (this._rectsOverlap(npc.x, npc.y, 32, 32, o.x - 10, o.y - 10, o.w + 20, o.h + 20)) {
                    npc.dx *= -1;
                    npc.dy *= -1;
                    break;
                }
            }

            // Random direction change
            npc.changeTimer += fs;
            if (npc.changeTimer >= npc.changeInterval) {
                const ang = Math.random() * Math.PI * 2;
                const sp = 0.25 + Math.random() * 0.45;
                npc.dx = Math.cos(ang) * sp;
                npc.dy = Math.sin(ang) * sp;
                npc.changeTimer = 0;
                npc.changeInterval = 90 + Math.random() * 100;
            }

            // Track facing direction (with cooldown to prevent flickering)
            if (!npc.faceCooldown) npc.faceCooldown = 0;
            if (npc.faceCooldown > 0) {
                npc.faceCooldown -= fs;
            } else if (npc.dx > 0.15) {
                if (!npc.facingRight) { npc.facingRight = true; npc.faceCooldown = 20; }
            } else if (npc.dx < -0.15) {
                if (npc.facingRight) { npc.facingRight = false; npc.faceCooldown = 20; }
            }

            // Walk frame
            npc.frameTimer += fs;
            if (npc.frameTimer >= 14) {
                npc.frame = (npc.frame + 1) % 2;
                npc.frameTimer = 0;
            }

            // Speech bubble when Như is nearby
            const ddx = this.player.x - npc.x;
            const ddy = this.player.y - npc.y;
            const ndist = Math.sqrt(ddx * ddx + ddy * ddy);
            if (ndist < 65 && this.speechTimer <= 0) {
                this.speechBubble = {
                    text: npc.messages[npc.msgIndex % npc.messages.length],
                    x: npc.x + 32,
                    y: npc.y - 10
                };
                npc.msgIndex++;
                this.speechTimer = 130;
            }
        });

        // Speech timer
        if (this.speechTimer > 0) {
            this.speechTimer -= fs;
            if (this.speechTimer <= 0) this.speechBubble = null;
        }

        // Sparkles
        this.sparkles = this.sparkles.filter(s => {
            s.timer -= fs;
            s.particles.forEach(p => { p.life -= 0.055 * fs; });
            return s.timer > 0;
        });
    },

    // -------------------------------------------------------
    // Render
    // -------------------------------------------------------
    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.W, this.H);

        // Background grass
        ctx.fillStyle = '#4a8b3f';
        ctx.fillRect(0, 0, this.W, this.H);

        // Grass tufts
        ctx.fillStyle = '#3d7a35';
        for (let gx = 0; gx < this.W; gx += 20) {
            for (let gy = 0; gy < this.H; gy += 20) {
                if ((gx + gy) % 40 === 0) {
                    ctx.fillRect(gx, gy, 3, 6);
                    ctx.fillRect(gx + 6, gy + 2, 3, 5);
                }
            }
        }

        // Tall grass zones (drawn before obstacles so obstacles render on top)
        for (const tg of this.tallGrassZones) {
            ctx.fillStyle = 'rgba(30, 100, 20, 0.55)';
            ctx.fillRect(tg.x, tg.y, tg.w, tg.h);
            // Squiggly grass marks
            ctx.fillStyle = '#2e7a24';
            for (let gx = tg.x + 4; gx < tg.x + tg.w - 4; gx += 8) {
                for (let gy = tg.y + 4; gy < tg.y + tg.h - 4; gy += 8) {
                    ctx.fillRect(gx, gy, 2, 5);
                    ctx.fillRect(gx + 3, gy + 1, 2, 4);
                }
            }
        }

        // Obstacles
        this.obstacles.forEach(o => {
            if (o.type === 'rock') {
                ctx.fillStyle = '#7f8c8d';
                ctx.fillRect(o.x, o.y, o.w, o.h);
                ctx.fillStyle = '#95a5a6';
                ctx.fillRect(o.x + 2, o.y + 2, o.w - 6, o.h - 6);
                ctx.fillStyle = '#bdc3c7';
                ctx.fillRect(o.x + 3, o.y + 3, 4, 3);
            } else {
                ctx.fillStyle = '#27ae60';
                ctx.fillRect(o.x, o.y + 4, o.w, o.h - 4);
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(o.x + 2, o.y, o.w - 4, o.h - 2);
                ctx.fillStyle = '#58d68d';
                ctx.fillRect(o.x + 4, o.y + 2, 4, 4);
            }
        });

        // Berries
        this.berries.forEach(b => {
            const bobY = Math.sin(b.bob) * 2.5;
            drawSprite(ctx, SPRITES[b.spriteKey], 2, b.x, b.y + bobY);
        });

        // NPCs (flip horizontally when facing right, since sprites default to facing left)
        this.npcs.forEach(npc => {
            const npcFrame = npc.frame === 0 ? 'idle' : 'walk';
            const spriteData = SPRITES[npc.name];
            const spriteW = ((spriteData && spriteData.width) || 32) * 2;
            if (npc.facingRight) {
                ctx.save();
                ctx.translate(npc.x + spriteW, npc.y);
                ctx.scale(-1, 1);
                drawSprite(ctx, spriteData, 2, 0, 0, npcFrame);
                ctx.restore();
            } else {
                drawSprite(ctx, spriteData, 2, npc.x, npc.y, npcFrame);
            }
        });

        // Companion Bulbasaur (flip when facing right)
        const compFrame = this.companion.frame === 0 ? 'idle' : 'walk';
        const compW = 32 * 2; // bulbasaur width * scale
        if (this.companion.facingRight) {
            ctx.save();
            ctx.translate(this.companion.x + compW, this.companion.y);
            ctx.scale(-1, 1);
            drawSprite(ctx, SPRITES.bulbasaur, 2, 0, 0, compFrame);
            ctx.restore();
        } else {
            drawSprite(ctx, SPRITES.bulbasaur, 2, this.companion.x, this.companion.y, compFrame);
        }

        // Player: Như
        const nhuFrame = (this.player.moving && this.player.frame === 1) ? 'walk' : 'idle';
        drawSprite(ctx, SPRITES.nhu, 2, this.player.x, this.player.y, nhuFrame);

        // Speech bubble
        if (this.speechBubble) {
            this._drawSpeechBubble(this.speechBubble);
        }

        // Sparkles
        this.sparkles.forEach(s => {
            s.particles.forEach(p => {
                if (p.life > 0) {
                    ctx.fillStyle = `rgba(255, 230, 50, ${p.life})`;
                    ctx.fillRect(
                        s.x + p.dx * (1 - p.life) * 12,
                        s.y + p.dy * (1 - p.life) * 12,
                        3, 3
                    );
                }
            });
        });

        // Level-transition overlay
        if (this.transitioning) {
            const alpha = Math.min(1, (120 - this.transitionTimer) / 40);
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.6})`;
            ctx.fillRect(0, 0, this.W, this.H);

            ctx.fillStyle = '#ffe066';
            ctx.font = 'bold 14px "Pixelify Sans", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.transitionMessage, this.W / 2, this.H / 2);
            ctx.textAlign = 'left';
        }
    },

    _drawSpeechBubble(sb) {
        const ctx = this.ctx;
        ctx.font = '9px "Pixelify Sans", monospace';
        const tw = ctx.measureText(sb.text).width;
        const bw = Math.min(tw + 18, 160);
        const bh = 20;
        const bx = Math.max(4, Math.min(this.W - bw - 4, sb.x - bw / 2));
        const by = sb.y - 24;

        ctx.fillStyle = 'white';
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(bx, by, bw, bh, 4);
        } else {
            ctx.rect(bx, by, bw, bh);
        }
        ctx.fill();
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Tail
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(sb.x - 4, by + bh);
        ctx.lineTo(sb.x, by + bh + 6);
        ctx.lineTo(sb.x + 4, by + bh);
        ctx.fill();

        ctx.fillStyle = '#222';
        ctx.font = '9px "Pixelify Sans", monospace';
        ctx.fillText(sb.text, bx + 6, by + 13, bw - 10);
    },

    // -------------------------------------------------------
    // HUD
    // -------------------------------------------------------
    updateHUD() {
        const lvl = this.LEVELS[this.currentLevel];
        const berryEl = document.querySelector('.hud-berries');
        const timerEl = document.querySelector('.hud-timer');

        if (berryEl) {
            berryEl.textContent =
                `\uD83E\uDED0 ${this.collected}/${lvl.berriesToCollect} (Level ${this.currentLevel + 1}/3)`;
        }
        if (timerEl) {
            timerEl.textContent = `\u23F1\uFE0F ${this.timeLeft}s`;
            if (this.timeLeft <= 15) {
                timerEl.classList.add('warning');
            } else {
                timerEl.classList.remove('warning');
            }
        }
    },

    // -------------------------------------------------------
    // Level progression
    // -------------------------------------------------------
    _levelComplete() {
        if (this.transitioning) return;
        this.transitioning = true;
        clearInterval(this.timerInterval);

        if (typeof Music !== 'undefined') Music.playSFX('victory');

        const levelNum = this.currentLevel + 1;
        if (levelNum < this.LEVELS.length) {
            this.transitionMessage = `Level ${levelNum} complete! Get ready for Level ${levelNum + 1}!`;
        } else {
            this.transitionMessage = 'All berries collected! Amazing! \uD83C\uDF89';
        }

        this.transitionTimer = 150; // ~2.5 seconds at 60fps
    },

    _advanceLevel() {
        this.transitioning = false;

        if (this.currentLevel < this.LEVELS.length - 1) {
            this.currentLevel++;
            this._startLevel();
        } else {
            // All 3 levels done
            this._win();
        }
    },

    // -------------------------------------------------------
    // Win / Time up
    // -------------------------------------------------------
    _win() {
        this.gameActive = false;
        cancelAnimationFrame(this.animationId);
        clearInterval(this.timerInterval);
        this.unbindControls();
        GameState.berriesCollected = this.collected;

        setTimeout(() => {
            GameState.transition('WORLD1_COMPLETE');
        }, 1200);
    },

    timeUp() {
        this.gameActive = false;
        cancelAnimationFrame(this.animationId);
        clearInterval(this.timerInterval);
        this.unbindControls();

        const lvl = this.LEVELS[this.currentLevel];
        const retry = document.querySelector('.retry-overlay');
        if (retry) {
            retry.classList.add('active');
            const textEl = retry.querySelector('.retry-text');
            const btnEl  = retry.querySelector('.retry-btn');
            if (textEl) {
                textEl.textContent =
                    `Time's up on Level ${this.currentLevel + 1}! ` +
                    `You collected ${this.collected}/${lvl.berriesToCollect} berries. Try again!`;
            }
            if (btnEl) {
                btnEl.onclick = () => {
                    retry.classList.remove('active');
                    this.start();
                };
            }
        }
    },

    cleanup() {
        this._isRunning = false;
        this.gameActive = false;
        if (this.animationId) { cancelAnimationFrame(this.animationId); this.animationId = null; }
        if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
        this.unbindControls();
    }
};
