// ============================================================
// MAZE - TRANSITION WALKING AREAS BETWEEN WORLDS
// Top-down canvas area where Nhu walks a garden path
// to reach a glowing portal leading to the next world.
//
// Three maze variations:
//   maze1 - Forest Garden Path (World 1 -> World 2)
//   maze2 - Enchanted Forest Path (World 2 -> World 3)
//   maze3 - Celebration Path (World 3 -> Celebration)
//
// Camera-follow system (Pokemon-style):
//   World: 20 cols x 25 rows x 32px = 640 x 800 pixels
//   Viewport: 320 x 400 pixels (shows half the map)
//   Camera: Centered on player, clamped to map edges
//   Sprites: scale 1 (32x1 = 32px per tile, fits perfectly)
//   Paths: 2-3 tiles wide for comfortable movement
//
// Tile codes:
//   0 = open path / walkable
//   1 = wall / hedge
// ============================================================

const Maze = {

    // ---- Canvas & runtime ----
    canvas: null,
    ctx: null,
    animationId: null,
    active: false,

    // ---- Dimensions ----
    W: 320,
    H: 400,
    TILE: 32,
    COLS: 20,
    ROWS: 25,

    // ---- Camera ----
    mapW: 0,
    mapH: 0,
    camX: 0,
    camY: 0,

    // ---- Player (Nhu) ----
    player: {
        x: 0, y: 0,
        speed: 2.5,
        frame: 0,
        frameTimer: 0,
        dir: 'down',
        moving: false
    },

    // ---- Bulbasaur companion (follows with lag) ----
    companion: { x: 0, y: 0, facingRight: false, faceCooldown: 0 },

    // ---- Input ----
    keys: {},
    touch: { active: false, startX: 0, startY: 0, dx: 0, dy: 0 },

    // ---- Current maze data ----
    walls: [],          // array of { x, y, w, h } pixel rects (impassable)
    portal: { x: 0, y: 0, w: 0, h: 0, pulse: 0 },
    decorations: [],    // visual only: { type, x, y, phase }
    npcs: [],           // { name, x, y, messages, msgIndex, talkDist, bubbleTimer }
    particles: [],      // ambient sparkle particles for maze2

    // ---- Speech state ----
    speechBubble: null,
    speechTimer: 0,

    // ---- Transition ----
    currentMaze: null,
    nextState: null,
    transitioning: false,
    fadeAlpha: 0,       // 0 = clear, 1 = black

    // ============================================================
    // MAZE DEFINITIONS
    // Each cell is TILE (32px). Grid is COLS x ROWS (20 x 25).
    // Paths are 2-3 tiles wide for comfortable 32px character movement.
    // ============================================================
    mazes: {

        // ----------------------------------------------------------
        // MAZE 1: Forest Garden Path
        // Start at bottom-center, wind up to portal at top-center.
        // Green hedges, flowers, stone path.
        // ----------------------------------------------------------
        maze1: {
            theme: 'garden',
            bgColor: '#4a8b3f',
            pathColor: '#8B7355',
            wallColor: '#27ae60',
            wallAccent: '#1e8449',
            wallHighlight: '#58d68d',
            portalColor: '#00e5ff',
            portalGlow: '#80ffff',
            grid: [
                [1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1], // row 0 portal
                [1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1], // row 1
                [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1], // row 2
                [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1], // row 3
                [1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1], // row 4
                [1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1], // row 5
                [1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,1], // row 6
                [1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,1], // row 7
                [1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1], // row 8
                [1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1], // row 9
                [1,1,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,1,1], // row 10
                [1,1,1,1,1,1,0,0,0,0,0,0,1,1,0,0,0,0,1,1], // row 11
                [1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,1,1,1,1], // row 12
                [1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,1,1,1,1], // row 13
                [1,1,0,0,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1], // row 14
                [1,1,0,0,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1], // row 15
                [1,1,0,0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1], // row 16
                [1,1,0,0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1], // row 17
                [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1], // row 18
                [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1], // row 19
                [1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1], // row 20
                [1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1], // row 21
                [1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1], // row 22
                [1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1], // row 23
                [1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1], // row 24 start
            ],
            portalCell: { col: 9, row: 0 },
            startCell: { col: 9, row: 24 },
            npcs: [
                {
                    name: 'slowpoke',
                    cell: { col: 8, row: 18 },
                    messages: ['This way!', 'Almost there!', 'The forest is ahead!', 'So pretty here!'],
                    talkDist: 80
                }
            ],
            decorations: [
                { type: 'flower', cell: { col: 4, row: 2 }, color: '#ff80c0' },
                { type: 'flower', cell: { col: 10, row: 3 }, color: '#ffff80' },
                { type: 'flower', cell: { col: 15, row: 2 }, color: '#ff80c0' },
                { type: 'flower', cell: { col: 3, row: 7 }, color: '#ffffff' },
                { type: 'flower', cell: { col: 8, row: 6 }, color: '#ff80c0' },
                { type: 'flower', cell: { col: 7, row: 11 }, color: '#ffff80' },
                { type: 'flower', cell: { col: 3, row: 14 }, color: '#ffffff' },
                { type: 'flower', cell: { col: 13, row: 15 }, color: '#ff80c0' },
                { type: 'flower', cell: { col: 6, row: 19 }, color: '#ffff80' },
                { type: 'flower', cell: { col: 14, row: 18 }, color: '#ff80c0' },
                { type: 'bush', cell: { col: 12, row: 3 }, color: '#2ecc71' },
                { type: 'bush', cell: { col: 5, row: 15 }, color: '#27ae60' },
                { type: 'stone', cell: { col: 9, row: 10 } },
                { type: 'stone', cell: { col: 10, row: 19 } },
            ]
        },

        // ----------------------------------------------------------
        // MAZE 2: Enchanted Forest Path
        // Start at bottom-right, portal at top-left. Darker, magical.
        // Sparkle particle effects, mushrooms, Psyduck NPC.
        // ----------------------------------------------------------
        maze2: {
            theme: 'enchanted',
            bgColor: '#1a2a1a',
            pathColor: '#2d4a2d',
            wallColor: '#1a3d1a',
            wallAccent: '#0d2b0d',
            wallHighlight: '#3a6e3a',
            portalColor: '#bf5fff',
            portalGlow: '#e0a0ff',
            grid: [
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // row 0
                [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 1
                [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 2
                [1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1], // row 3
                [1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1], // row 4
                [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 5
                [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 6
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1], // row 7
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1], // row 8
                [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 9
                [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 10
                [1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // row 11
                [1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // row 12
                [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 13
                [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 14
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1], // row 15
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1], // row 16
                [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 17
                [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 18
                [1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // row 19
                [1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // row 20
                [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 21
                [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 22
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1], // row 23
                [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1], // row 24 start
            ],
            portalCell: { col: 2, row: 1 },
            startCell:  { col: 16, row: 24 },
            npcs: [
                {
                    name: 'psyduck',
                    cell: { col: 8, row: 13 },
                    messages: ['Watch your step!', 'So magical here!', 'Pompompurin is waiting!', 'Psy-yi-yi!'],
                    talkDist: 80
                }
            ],
            decorations: [
                { type: 'mushroom', cell: { col: 5, row: 1 }, color: '#e74c3c' },
                { type: 'mushroom', cell: { col: 12, row: 2 }, color: '#8e44ad' },
                { type: 'mushroom', cell: { col: 7, row: 5 }, color: '#e74c3c' },
                { type: 'mushroom', cell: { col: 14, row: 6 }, color: '#e74c3c' },
                { type: 'mushroom', cell: { col: 3, row: 9 }, color: '#8e44ad' },
                { type: 'mushroom', cell: { col: 10, row: 10 }, color: '#e74c3c' },
                { type: 'mushroom', cell: { col: 7, row: 14 }, color: '#8e44ad' },
                { type: 'mushroom', cell: { col: 5, row: 17 }, color: '#e74c3c' },
                { type: 'mushroom', cell: { col: 12, row: 18 }, color: '#8e44ad' },
                { type: 'mushroom', cell: { col: 2, row: 21 }, color: '#e74c3c' },
                { type: 'sparklespot', cell: { col: 8, row: 1 } },
                { type: 'sparklespot', cell: { col: 3, row: 6 } },
                { type: 'sparklespot', cell: { col: 17, row: 9 } },
                { type: 'sparklespot', cell: { col: 2, row: 13 } },
                { type: 'sparklespot', cell: { col: 11, row: 17 } },
                { type: 'sparklespot', cell: { col: 2, row: 22 } },
            ]
        },

        // ----------------------------------------------------------
        // MAZE 3: Celebration Path
        // Short path from bottom to top, festive decorations.
        // Balloons, streamers, both Slowpoke and Psyduck near portal.
        // ----------------------------------------------------------
        maze3: {
            theme: 'celebration',
            bgColor: '#3a0075',
            pathColor: '#7b2d8b',
            wallColor: '#5c1080',
            wallAccent: '#3d0060',
            wallHighlight: '#c060e0',
            portalColor: '#ffd700',
            portalGlow: '#fffacd',
            grid: [
                [1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1], // row 0 portal
                [1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1], // row 1
                [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1], // row 2
                [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1], // row 3
                [1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1], // row 4
                [1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1], // row 5
                [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1], // row 6
                [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1], // row 7
                [1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1], // row 8
                [1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1], // row 9
                [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1], // row 10
                [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1], // row 11
                [1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1], // row 12
                [1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1], // row 13
                [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1], // row 14
                [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1], // row 15
                [1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1], // row 16
                [1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1], // row 17
                [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1], // row 18
                [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1], // row 19
                [1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1], // row 20
                [1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1], // row 21
                [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1], // row 22
                [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1], // row 23
                [1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1], // row 24 start
            ],
            portalCell: { col: 9, row: 0 },
            startCell:  { col: 9, row: 24 },
            npcs: [
                {
                    name: 'slowpoke',
                    cell: { col: 5, row: 2 },
                    messages: ['The surprise is close!', 'Almost there!', 'So exciting!', 'Yaawn... keep going!'],
                    talkDist: 80
                },
                {
                    name: 'psyduck',
                    cell: { col: 13, row: 2 },
                    messages: ['Hurry! Hurry!', 'Best birthday ever!', 'Psy-yi-yi!', "You're almost there!"],
                    talkDist: 80
                }
            ],
            decorations: [
                { type: 'balloon', cell: { col: 4, row: 3 }, color: '#ff6b6b' },
                { type: 'balloon', cell: { col: 15, row: 2 }, color: '#ffd700' },
                { type: 'balloon', cell: { col: 3, row: 6 }, color: '#6bcfff' },
                { type: 'balloon', cell: { col: 14, row: 7 }, color: '#ff80c0' },
                { type: 'balloon', cell: { col: 8, row: 8 }, color: '#ffd700' },
                { type: 'balloon', cell: { col: 12, row: 9 }, color: '#ff6b6b' },
                { type: 'balloon', cell: { col: 5, row: 11 }, color: '#6bcfff' },
                { type: 'balloon', cell: { col: 14, row: 10 }, color: '#ff80c0' },
                { type: 'balloon', cell: { col: 3, row: 14 }, color: '#ffd700' },
                { type: 'balloon', cell: { col: 13, row: 15 }, color: '#ff6b6b' },
                { type: 'balloon', cell: { col: 7, row: 18 }, color: '#6bcfff' },
                { type: 'balloon', cell: { col: 15, row: 19 }, color: '#ff80c0' },
                { type: 'balloon', cell: { col: 3, row: 22 }, color: '#ffd700' },
                { type: 'balloon', cell: { col: 12, row: 23 }, color: '#ff6b6b' },
                { type: 'star', cell: { col: 9, row: 3 } },
                { type: 'star', cell: { col: 10, row: 7 } },
                { type: 'star', cell: { col: 9, row: 11 } },
                { type: 'star', cell: { col: 8, row: 15 } },
                { type: 'star', cell: { col: 10, row: 19 } },
                { type: 'star', cell: { col: 9, row: 23 } },
            ]
        }
    },

    // ============================================================
    // START
    // ============================================================
    start(mazeName, nextState) {
        // Ensure previous run cleaned up and prevent double-starts
        try { this.stop(); } catch (e) {}
        if (this._isRunning) return;
        this._isRunning = true;
        if (typeof CONFIG !== 'undefined' && CONFIG.debug) console.log('Maze.start called:', mazeName, this.nextState);

        this.currentMaze = mazeName;
        this.nextState = nextState;
        this.active = true;
        this.transitioning = false;
        this.fadeAlpha = 0;
        this.speechBubble = null;
        this.speechTimer = 0;
        this.particles = [];
        this.keys = {};
        this.touch = { active: false, startX: 0, startY: 0, dx: 0, dy: 0 };

        // Set up tile size and map dimensions
        this.TILE = 32;
        this.mapW = this.COLS * this.TILE; // 640
        this.mapH = this.ROWS * this.TILE; // 800

        // Get the maze canvas
        this.canvas = document.getElementById('maze-canvas');
        if (!this.canvas) {
            console.error('Maze canvas not found! Make sure #maze-canvas exists in HTML.');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.W;
        this.canvas.height = this.H;
        this.scaleCanvas();

        // Build wall rects and place entities from grid
        this.buildFromGrid(mazeName);

        // Initialize camera centered on player
        this.updateCamera();

        // Bind controls
        this.bindControls();

        // Start ambient particles for enchanted maze
        if (mazeName === 'maze2') {
            this.initParticles();
        }

        // Fade in
        this.fadeAlpha = 1;

        // Start loop
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this._lastTime = performance.now();
        this.animationId = requestAnimationFrame((t) => this.loop(t));
    },

    stop() {
        this.active = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.unbindControls();
        this._isRunning = false;
    },

    // ============================================================
    // SCALE CANVAS TO FIT CONTAINER
    // ============================================================
    scaleCanvas() {
        const wrap = this.canvas.parentElement;
        if (!wrap) return;
        const scale = Math.min(
            wrap.clientWidth / this.W,
            (wrap.clientHeight - 10) / this.H
        );
        this.canvas.style.width  = (this.W * scale) + 'px';
        this.canvas.style.height = (this.H * scale) + 'px';
    },

    // ============================================================
    // UPDATE CAMERA TO FOLLOW PLAYER
    // ============================================================
    updateCamera() {
        const halfW = this.W / 2;
        const halfH = this.H / 2;
        this.camX = Math.max(0, Math.min(this.mapW - this.W, this.player.x - halfW + this.TILE / 2));
        this.camY = Math.max(0, Math.min(this.mapH - this.H, this.player.y - halfH + this.TILE / 2));
    },

    // ============================================================
    // BUILD WALLS AND ENTITIES FROM GRID
    // ============================================================
    buildFromGrid(mazeName) {
        const mazeDef = this.mazes[mazeName];
        const grid = mazeDef.grid;
        const T = this.TILE;

        this.walls = [];
        this.npcs  = [];
        this.decorations = [];

        // Build wall list (pixel rects)
        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                if (grid[row][col] === 1) {
                    this.walls.push({ x: col * T, y: row * T, w: T, h: T });
                }
            }
        }

        // Place portal
        const pc = mazeDef.portalCell;
        this.portal = {
            x: pc.col * T - T / 2,
            y: pc.row * T,
            w: T * 2 + T,
            h: T * 2,
            pulse: 0
        };

        // Place player
        const sc = mazeDef.startCell;
        this.player.x = sc.col * T;
        this.player.y = sc.row * T;
        this.player.dir = 'up';
        this.player.frame = 0;
        this.player.frameTimer = 0;
        this.player.moving = false;

        // Companion starts slightly behind player
        this.companion.x = this.player.x;
        this.companion.y = this.player.y + T * 2;

        // Build NPCs
        mazeDef.npcs.forEach(npcDef => {
            this.npcs.push({
                name: npcDef.name,
                x: npcDef.cell.col * T,
                y: npcDef.cell.row * T,
                messages: npcDef.messages,
                msgIndex: 0,
                talkDist: npcDef.talkDist || 80,
                bubbleTimer: 0,
                facingRight: false
            });
        });

        // Build decorations (store pixel positions)
        mazeDef.decorations.forEach(dec => {
            this.decorations.push({
                type: dec.type,
                x: dec.cell.col * T,
                y: dec.cell.row * T,
                color: dec.color || '#ffffff',
                phase: Math.random() * Math.PI * 2
            });
        });
    },

    // ============================================================
    // AMBIENT PARTICLES (maze2 enchanted sparkles)
    // ============================================================
    initParticles() {
        this.particles = [];
        const mazeDef = this.mazes[this.currentMaze];
        const spots = mazeDef.decorations.filter(d => d.type === 'sparklespot');
        spots.forEach(spot => {
            for (let i = 0; i < 3; i++) {
                this.particles.push(this.newParticle(
                    spot.cell.col * this.TILE + Math.random() * this.TILE,
                    spot.cell.row * this.TILE + Math.random() * this.TILE
                ));
            }
        });
        // Also add some random floating ones along the path
        for (let i = 0; i < 15; i++) {
            const col = Math.floor(Math.random() * this.COLS);
            const row = Math.floor(Math.random() * this.ROWS);
            if (mazeDef.grid[row] && mazeDef.grid[row][col] === 0) {
                this.particles.push(this.newParticle(
                    col * this.TILE + Math.random() * this.TILE,
                    row * this.TILE + Math.random() * this.TILE
                ));
            }
        }
    },

    newParticle(x, y) {
        return {
            x, y,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -Math.random() * 0.6 - 0.2,
            life: Math.random(),
            maxLife: 0.7 + Math.random() * 0.8,
            size: 1 + Math.random() * 2,
            color: ['#bf5fff', '#e0a0ff', '#ffffff', '#aaffee'][Math.floor(Math.random() * 4)]
        };
    },

    updateParticles() {
        const mazeDef = this.mazes[this.currentMaze];
        const fs = this._frameStep || 1;
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * fs;
            p.y += p.vy * fs;
            p.life += 0.008 * fs;
            if (p.life >= p.maxLife) {
                // Respawn near a sparklespot
                const spots = mazeDef.decorations.filter(d => d.type === 'sparklespot');
                const spot = spots[Math.floor(Math.random() * spots.length)];
                if (spot) {
                    this.particles[i] = this.newParticle(
                        spot.cell.col * this.TILE + Math.random() * this.TILE,
                        spot.cell.row * this.TILE + Math.random() * this.TILE
                    );
                } else {
                    this.particles.splice(i, 1);
                }
            }
        }
    },

    // ============================================================
    // BIND / UNBIND CONTROLS
    // ============================================================
    bindControls() {
        this._onKeyDown = (e) => {
            const map = {
                'ArrowUp': true, 'ArrowDown': true,
                'ArrowLeft': true, 'ArrowRight': true,
                'w': true, 'a': true, 's': true, 'd': true,
                'W': true, 'A': true, 'S': true, 'D': true
            };
            if (map[e.key]) {
                e.preventDefault();
                this.keys[e.key] = true;
            }
        };
        this._onKeyUp = (e) => {
            this.keys[e.key] = false;
        };
        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup', this._onKeyUp);

        // Maze D-pad buttons (in maze screen HTML)
        ['up', 'down', 'left', 'right'].forEach(dir => {
            const btn = document.getElementById('maze-dpad-' + dir);
            if (!btn) return;
            const startKey = () => { this.keys['dpad_' + dir] = true; };
            const endKey   = () => { this.keys['dpad_' + dir] = false; };
            btn.addEventListener('touchstart',  (e) => { e.preventDefault(); startKey(); }, { passive: false });
            btn.addEventListener('touchend',    (e) => { e.preventDefault(); endKey(); },   { passive: false });
            btn.addEventListener('touchcancel', (e) => { e.preventDefault(); endKey(); },   { passive: false });
            btn.addEventListener('mousedown',   startKey);
            btn.addEventListener('mouseup',     endKey);
            btn.addEventListener('mouseleave',  endKey);
            // Store handlers so we can remove them
            btn._mazeStart = startKey;
            btn._mazeEnd   = endKey;
        });

        // Touch joystick on canvas itself
        this._onTouchStart = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect  = this.canvas.getBoundingClientRect();
            const scaleX = this.W / rect.width;
            const scaleY = this.H / rect.height;
            this.touch.active = true;
            this.touch.startX = (touch.clientX - rect.left) * scaleX;
            this.touch.startY = (touch.clientY - rect.top)  * scaleY;
            this.touch.dx = 0;
            this.touch.dy = 0;
        };
        this._onTouchMove = (e) => {
            if (!this.touch.active) return;
            e.preventDefault();
            const touch = e.touches[0];
            const rect  = this.canvas.getBoundingClientRect();
            const scaleX = this.W / rect.width;
            const scaleY = this.H / rect.height;
            const cx = (touch.clientX - rect.left) * scaleX;
            const cy = (touch.clientY - rect.top)  * scaleY;
            this.touch.dx = cx - this.touch.startX;
            this.touch.dy = cy - this.touch.startY;
        };
        this._onTouchEnd = (e) => {
            e.preventDefault();
            this.touch.active = false;
            this.touch.dx = 0;
            this.touch.dy = 0;
        };
        this.canvas.addEventListener('touchstart',  this._onTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove',   this._onTouchMove,  { passive: false });
        this.canvas.addEventListener('touchend',    this._onTouchEnd,   { passive: false });
        this.canvas.addEventListener('touchcancel', this._onTouchEnd,   { passive: false });
    },

    unbindControls() {
        if (this._onKeyDown) document.removeEventListener('keydown', this._onKeyDown);
        if (this._onKeyUp)   document.removeEventListener('keyup',   this._onKeyUp);
        if (this.canvas) {
            if (this._onTouchStart) this.canvas.removeEventListener('touchstart',  this._onTouchStart);
            if (this._onTouchMove)  this.canvas.removeEventListener('touchmove',   this._onTouchMove);
            if (this._onTouchEnd) {
                this.canvas.removeEventListener('touchend',    this._onTouchEnd);
                this.canvas.removeEventListener('touchcancel', this._onTouchEnd);
            }
        }
        ['up', 'down', 'left', 'right'].forEach(dir => {
            const btn = document.getElementById('maze-dpad-' + dir);
            if (!btn) return;
            if (btn._mazeStart) {
                btn.removeEventListener('touchstart',  btn._mazeStart);
                btn.removeEventListener('touchend',    btn._mazeEnd);
                btn.removeEventListener('touchcancel', btn._mazeEnd);
                btn.removeEventListener('mousedown',   btn._mazeStart);
                btn.removeEventListener('mouseup',     btn._mazeEnd);
                btn.removeEventListener('mouseleave',  btn._mazeEnd);
            }
        });
    },

    // ============================================================
    // GAME LOOP
    // ============================================================
    loop(t) {
        if (!this.active) return;

        // Re-entrancy guard and FPS counter
        if (this._inLoop) {
            if (typeof CONFIG !== 'undefined' && CONFIG.debug) console.warn('Maze loop re-entrant - skipping frame');
            return;
        }
        this._inLoop = true;
        this._frameCount = (this._frameCount || 0) + 1;

        // Timestamp and frameStep handling (normalize to 60Hz baseline)
        const now = (typeof t === 'number') ? t : performance.now();
        if (!this._lastTime) this._lastTime = now;
        const dt = Math.max(0, now - this._lastTime);
        const frameStep = Math.min(Math.max(dt / (1000 / 60), 0.01), 4);
        this._frameStep = frameStep;
        this._lastTime = now;

        if (!this._lastFpsTime) this._lastFpsTime = now;
        if (now - this._lastFpsTime >= 1000) {
            if (typeof CONFIG !== 'undefined' && CONFIG.debug) console.log('Maze FPS:', this._frameCount);
            this._frameCount = 0;
            this._lastFpsTime = now;
        }

        this.update();
        this.render();

        this._inLoop = false;
        this.animationId = requestAnimationFrame((ts) => this.loop(ts));
    },

    // ============================================================
    // UPDATE
    // ============================================================
    update() {
        if (this.transitioning) {
            // Fade to black, then transition
            this.fadeAlpha = Math.min(1, this.fadeAlpha + 0.04);
            if (this.fadeAlpha >= 1) {
                this.stop();
                GameState.transition(this.nextState);
            }
            return;
        }

        // Fade in at start
        if (this.fadeAlpha > 0) {
            this.fadeAlpha = Math.max(0, this.fadeAlpha - 0.03);
        }

        // ---- Determine movement direction ----
        const fs = this._frameStep || 1;
        let dx = 0, dy = 0;

        // Keyboard / D-pad
        if (this.keys['ArrowUp']    || this.keys['w'] || this.keys['W'] || this.keys['dpad_up'])    { dy = -1; }
        if (this.keys['ArrowDown']  || this.keys['s'] || this.keys['S'] || this.keys['dpad_down'])  { dy =  1; }
        if (this.keys['ArrowLeft']  || this.keys['a'] || this.keys['A'] || this.keys['dpad_left'])  { dx = -1; }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D'] || this.keys['dpad_right']) { dx =  1; }

        // Touch joystick
        if (this.touch.active) {
            const deadzone = 10;
            if (Math.abs(this.touch.dx) > deadzone || Math.abs(this.touch.dy) > deadzone) {
                if (Math.abs(this.touch.dx) > Math.abs(this.touch.dy)) {
                    dx = this.touch.dx > 0 ? 1 : -1;
                } else {
                    dy = this.touch.dy > 0 ? 1 : -1;
                }
            }
        }

        // Normalize diagonal
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        const moving = dx !== 0 || dy !== 0;
        this.player.moving = moving;

        // Update direction for visual flipping
        if (dx < 0) this.player.dir = 'left';
        else if (dx > 0) this.player.dir = 'right';
        else if (dy < 0) this.player.dir = 'up';
        else if (dy > 0) this.player.dir = 'down';

        // Attempt movement with wall collision
        if (moving) {
            const spd = this.player.speed;
            const newX = this.player.x + dx * spd * fs;
            const newY = this.player.y + dy * spd * fs;

            // Clamp to map boundary (not canvas boundary)
            const clampX = Math.max(0, Math.min(this.mapW - this.TILE, newX));
            const clampY = Math.max(0, Math.min(this.mapH - this.TILE, newY));

            // Wall collision - try X and Y separately (sliding)
            const T = this.TILE;
            const pw = T - 8;  // 24px player hitbox
            const ph = T - 8;
            const playerOffX = 4;  // center the hitbox in tile
            const playerOffY = 4;

            let blockedX = false;
            let blockedY = false;

            // Test X movement
            const testX = clampX + playerOffX;
            const testY = this.player.y + playerOffY;
            for (const w of this.walls) {
                if (testX < w.x + w.w && testX + pw > w.x &&
                    testY < w.y + w.h && testY + ph > w.y) {
                    blockedX = true;
                    break;
                }
            }

            // Test Y movement
            const test2X = this.player.x + playerOffX;
            const test2Y = clampY + playerOffY;
            for (const w of this.walls) {
                if (test2X < w.x + w.w && test2X + pw > w.x &&
                    test2Y < w.y + w.h && test2Y + ph > w.y) {
                    blockedY = true;
                    break;
                }
            }

            if (!blockedX) this.player.x = clampX;
            if (!blockedY) this.player.y = clampY;

            // Walk animation frame toggle
            this.player.frameTimer += fs;
            if (this.player.frameTimer > 10) {
                this.player.frame = (this.player.frame + 1) % 2;
                this.player.frameTimer = 0;
            }
        } else {
            this.player.frame = 0;
        }

        // ---- Update camera to follow player ----
        this.updateCamera();

        // ---- Companion follows player with lerp ----
        const lerpSpeed = 0.08;
        const targetX = this.player.x + (this.player.dir === 'left' ? this.TILE : -this.TILE);
        const targetY = this.player.y + this.TILE;
        const prevCompX = this.companion.x;
        this.companion.x += (targetX - this.companion.x) * lerpSpeed;
        this.companion.y += (targetY - this.companion.y) * lerpSpeed;

        // Track companion facing direction (with cooldown)
        if (this.companion.faceCooldown > 0) {
            this.companion.faceCooldown -= fs;
        } else {
            const cdx = this.companion.x - prevCompX;
            if (cdx > 0.15 && !this.companion.facingRight) { this.companion.facingRight = true; this.companion.faceCooldown = 15; }
            else if (cdx < -0.15 && this.companion.facingRight) { this.companion.facingRight = false; this.companion.faceCooldown = 15; }
        }

        // ---- Portal pulse ----
        this.portal.pulse += 0.06 * fs;

        // ---- Check portal collision ----
        if (!this.transitioning) {
            const px = this.player.x + this.TILE / 2;
            const py = this.player.y + this.TILE / 2;
            const portalCX = this.portal.x + this.portal.w / 2;
            const portalCY = this.portal.y + this.portal.h / 2;
            const dist = Math.sqrt(
                Math.pow(px - portalCX, 2) +
                Math.pow(py - portalCY, 2)
            );
            if (dist < 30) {
                this.transitioning = true;
                if (typeof Music !== 'undefined') Music.playSFX('victory');
            }
        }

        // ---- NPC speech bubbles & facing ----
        this.npcs.forEach(npc => {
            // Face toward the player when nearby
            const npcDx = this.player.x - npc.x;
            const dist = Math.sqrt(
                Math.pow(npcDx, 2) +
                Math.pow(this.player.y - npc.y, 2)
            );
            if (dist < npc.talkDist * 1.5) {
                npc.facingRight = npcDx > 0;
            }
            if (dist < npc.talkDist && this.speechTimer <= 0) {
                this.speechBubble = {
                    text: npc.messages[npc.msgIndex % npc.messages.length],
                    x: npc.x + this.TILE,
                    y: npc.y
                };
                npc.msgIndex++;
                this.speechTimer = 150;
            }
        });

        if (this.speechTimer > 0) {
            this.speechTimer -= fs;
            if (this.speechTimer <= 0) this.speechBubble = null;
        }

        // ---- Ambient particles (maze2) ----
        if (this.currentMaze === 'maze2') {
            this.updateParticles();
        }

        // ---- Decoration phase animation ----
        this.decorations.forEach(d => {
            d.phase += 0.04 * fs;
        });
    },

    // ============================================================
    // RENDER
    // ============================================================
    render() {
        const ctx = this.ctx;
        const T   = this.TILE;
        const mazeDef = this.mazes[this.currentMaze];

        ctx.clearRect(0, 0, this.W, this.H);

        // ---- Begin camera transform (world space) ----
        ctx.save();
        ctx.translate(-this.camX, -this.camY);

        // ---- Background (fill entire map area) ----
        ctx.fillStyle = mazeDef.bgColor;
        ctx.fillRect(0, 0, this.mapW, this.mapH);

        // ---- Draw path tiles (open cells) ----
        this.drawPathTiles(ctx, mazeDef);

        // ---- Draw decorations (behind walls so they appear on path) ----
        this.decorations.forEach(d => this.drawDecoration(ctx, d, mazeDef));

        // ---- Draw walls / hedges ----
        this.drawWalls(ctx, mazeDef);

        // ---- Draw ambient particles (maze2 only) ----
        if (this.currentMaze === 'maze2') {
            this.drawParticles(ctx);
        }

        // ---- Draw portal ----
        this.drawPortal(ctx, mazeDef);

        // ---- Draw NPCs (flip when facing right) ----
        this.npcs.forEach(npc => {
            const frame = 'idle';
            const spriteData = SPRITES[npc.name];
            const spriteW = (spriteData && spriteData.width) || 32;
            if (npc.facingRight) {
                ctx.save();
                ctx.translate(npc.x + spriteW, npc.y);
                ctx.scale(-1, 1);
                drawSprite(ctx, spriteData, 1, 0, 0, frame);
                ctx.restore();
            } else {
                drawSprite(ctx, spriteData, 1, npc.x, npc.y, frame);
            }
        });

        // ---- Draw companion (Bulbasaur, flip when facing right) ----
        const compFrame = this.player.moving ? 'walk' : 'idle';
        if (this.companion.facingRight) {
            ctx.save();
            ctx.translate(this.companion.x + 32, this.companion.y);
            ctx.scale(-1, 1);
            drawSprite(ctx, SPRITES.bulbasaur, 1, 0, 0, compFrame);
            ctx.restore();
        } else {
            drawSprite(ctx, SPRITES.bulbasaur, 1, this.companion.x, this.companion.y, compFrame);
        }

        // ---- Draw player (Nhu) ----
        const playerFrame = (this.player.frame === 1 && this.player.moving) ? 'walk' : 'idle';
        const flipX = this.player.dir === 'left';
        this.drawPlayerSprite(ctx, playerFrame, flipX);

        // ---- End camera transform ----
        ctx.restore();

        // ---- Draw speech bubble in screen space (after restore) ----
        if (this.speechBubble) {
            this.drawSpeechBubble(ctx, this.speechBubble);
        }

        // ---- HUD hint in screen space (show walk hint at start) ----
        if (this.fadeAlpha <= 0.3) {
            this.drawHint(ctx);
        }

        // ---- Fade overlay (screen space) ----
        if (this.fadeAlpha > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`;
            ctx.fillRect(0, 0, this.W, this.H);
        }
    },

    // ---- Draw open path cells with texture ----
    drawPathTiles(ctx, mazeDef) {
        const T   = this.TILE;
        const grid = mazeDef.grid;

        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                if (grid[row][col] === 0) {
                    const px = col * T;
                    const py = row * T;

                    ctx.fillStyle = mazeDef.pathColor;
                    ctx.fillRect(px, py, T, T);

                    // Path texture details per theme
                    if (mazeDef.theme === 'garden') {
                        // Stone path dots
                        ctx.fillStyle = 'rgba(0,0,0,0.15)';
                        if ((col + row) % 3 === 0) ctx.fillRect(px + 5, py + 5, 5, 5);
                        if ((col + row) % 3 === 1) ctx.fillRect(px + 18, py + 20, 4, 4);
                        // Subtle grass border effect
                        ctx.fillStyle = 'rgba(255,255,255,0.07)';
                        ctx.fillRect(px, py, T, 2);
                        ctx.fillRect(px, py, 2, T);
                    } else if (mazeDef.theme === 'enchanted') {
                        // Dark forest ground with root-like lines
                        ctx.fillStyle = 'rgba(0,0,0,0.2)';
                        if (col % 3 === 0) ctx.fillRect(px + 4, py, 2, T);
                        if (row % 4 === 1) ctx.fillRect(px, py + 14, T, 2);
                        // Faint glow on edges
                        ctx.fillStyle = 'rgba(100,0,150,0.1)';
                        ctx.fillRect(px, py, T, T);
                    } else if (mazeDef.theme === 'celebration') {
                        // Festive floor with sparkle dots
                        ctx.fillStyle = 'rgba(255,255,255,0.08)';
                        if ((col * 3 + row * 7) % 5 === 0) ctx.fillRect(px + 8, py + 8, 4, 4);
                        if ((col * 7 + row * 3) % 5 === 0) ctx.fillRect(px + 22, py + 20, 4, 4);
                    }
                }
            }
        }
    },

    // ---- Draw wall blocks (hedges / trees / party walls) ----
    drawWalls(ctx, mazeDef) {
        const T    = this.TILE;
        const grid = mazeDef.grid;

        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                if (grid[row][col] !== 1) continue;

                const px = col * T;
                const py = row * T;

                // Base wall color
                ctx.fillStyle = mazeDef.wallColor;
                ctx.fillRect(px, py, T, T);

                // Check neighbors for edge decoration
                const hasTop    = row > 0           && grid[row - 1][col] === 1;
                const hasBottom = row < this.ROWS-1 && grid[row + 1][col] === 1;
                const hasLeft   = col > 0           && grid[row][col - 1] === 1;
                const hasRight  = col < this.COLS-1 && grid[row][col + 1] === 1;

                if (mazeDef.theme === 'garden') {
                    // Hedge tops (green bumps on top edge facing path)
                    if (!hasTop) {
                        ctx.fillStyle = mazeDef.wallHighlight;
                        ctx.fillRect(px + 2, py + 2, T - 4, 8);
                        // Round bumps
                        ctx.fillStyle = mazeDef.wallAccent;
                        ctx.fillRect(px + 3, py, 6, 5);
                        ctx.fillRect(px + 13, py, 6, 5);
                        ctx.fillRect(px + 23, py, 6, 5);
                        // Highlight on bump tops
                        ctx.fillStyle = mazeDef.wallHighlight;
                        ctx.fillRect(px + 5, py, 2, 3);
                        ctx.fillRect(px + 15, py, 2, 3);
                        ctx.fillRect(px + 25, py, 2, 3);
                    }
                    // Left facing side - small leaves
                    if (!hasLeft) {
                        ctx.fillStyle = mazeDef.wallHighlight;
                        ctx.fillRect(px, py + 5, 5, 5);
                        ctx.fillRect(px, py + 18, 5, 5);
                    }
                    // General texture
                    ctx.fillStyle = 'rgba(0,0,0,0.1)';
                    ctx.fillRect(px + T - 3, py, 3, T);
                    ctx.fillRect(px, py + T - 3, T, 3);

                } else if (mazeDef.theme === 'enchanted') {
                    // Dark ancient trees with glowing edges
                    ctx.fillStyle = mazeDef.wallAccent;
                    ctx.fillRect(px + T - 3, py, 3, T);
                    ctx.fillRect(px, py + T - 3, T, 3);
                    // Glowing purple edges facing path
                    if (!hasTop) {
                        ctx.fillStyle = '#7b2fbe';
                        ctx.fillRect(px, py, T, 3);
                        ctx.fillStyle = 'rgba(150,0,220,0.4)';
                        ctx.fillRect(px, py, T, 2);
                    }
                    if (!hasLeft) {
                        ctx.fillStyle = '#7b2fbe';
                        ctx.fillRect(px, py, 3, T);
                    }
                    // Occasional root texture
                    if ((col + row) % 3 === 0) {
                        ctx.fillStyle = mazeDef.wallHighlight;
                        ctx.fillRect(px + 2, py + 8, 5, 14);
                    }

                } else if (mazeDef.theme === 'celebration') {
                    // Party walls with colored stripe accents
                    const stripeColors = ['#ff6b6b', '#ffd700', '#6bcfff', '#ff80c0'];
                    const stripe = stripeColors[(col + row) % stripeColors.length];
                    if (!hasTop) {
                        ctx.fillStyle = stripe;
                        ctx.fillRect(px, py, T, 5);
                        ctx.fillStyle = 'rgba(255,255,255,0.3)';
                        ctx.fillRect(px + 2, py, T - 4, 2);
                    }
                    if (!hasLeft) {
                        ctx.fillStyle = stripe;
                        ctx.fillRect(px, py, 5, T);
                    }
                    ctx.fillStyle = 'rgba(0,0,0,0.2)';
                    ctx.fillRect(px + T - 3, py, 3, T);
                    ctx.fillRect(px, py + T - 3, T, 3);
                }
            }
        }
    },

    // ---- Draw decorations on path ----
    drawDecoration(ctx, dec, mazeDef) {
        const T = this.TILE;
        const bob = Math.sin(dec.phase) * 3;
        const px = dec.x;
        const py = dec.y + bob;

        ctx.save();

        if (dec.type === 'flower') {
            // Center stem
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(px + 14, py + 16, 4, 10);
            // Petals
            ctx.fillStyle = dec.color;
            ctx.fillRect(px + 9,  py + 10, 6, 6); // top-left
            ctx.fillRect(px + 17, py + 10, 6, 6); // top-right
            ctx.fillRect(px + 9,  py + 18, 6, 6); // bottom-left
            ctx.fillRect(px + 17, py + 18, 6, 6); // bottom-right
            // Center
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(px + 13, py + 14, 6, 6);
            // Tiny highlight
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 13, py + 14, 2, 2);

        } else if (dec.type === 'bush') {
            ctx.fillStyle = dec.color;
            ctx.fillRect(px + 4, py + 12, 24, 16);
            ctx.fillRect(px + 8, py + 6, 16, 14);
            ctx.fillRect(px + 12, py + 2, 8, 8);
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(px + 10, py + 6, 4, 4);

        } else if (dec.type === 'stone') {
            ctx.fillStyle = '#7f8c8d';
            ctx.fillRect(px + 6, py + 14, 20, 12);
            ctx.fillRect(px + 10, py + 10, 12, 16);
            ctx.fillStyle = '#95a5a6';
            ctx.fillRect(px + 10, py + 10, 10, 6);
            ctx.fillStyle = '#bdc3c7';
            ctx.fillRect(px + 12, py + 10, 4, 4);

        } else if (dec.type === 'mushroom') {
            // Stalk
            ctx.fillStyle = '#f5f5dc';
            ctx.fillRect(px + 12, py + 18, 8, 10);
            // Cap
            ctx.fillStyle = dec.color;
            ctx.fillRect(px + 6, py + 8, 20, 12);
            ctx.fillRect(px + 10, py + 4, 12, 8);
            // White dots on cap
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 10, py + 8, 4, 4);
            ctx.fillRect(px + 20, py + 10, 4, 4);
            ctx.fillRect(px + 14, py + 14, 4, 4);

        } else if (dec.type === 'sparklespot') {
            // Faint glow on ground
            const alpha = 0.2 + Math.sin(dec.phase) * 0.15;
            ctx.fillStyle = `rgba(180, 100, 255, ${alpha})`;
            ctx.fillRect(px + 4, py + 12, 24, 10);
            ctx.fillRect(px + 10, py + 8, 12, 18);

        } else if (dec.type === 'balloon') {
            // String
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.fillRect(px + 15, py + 24, 2, 8);
            // Balloon body
            ctx.fillStyle = dec.color;
            ctx.fillRect(px + 8, py + 6, 16, 18);
            ctx.fillRect(px + 6, py + 10, 20, 12);
            ctx.fillRect(px + 12, py + 2, 8, 6);
            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect(px + 10, py + 6, 6, 6);
            // Knot at bottom
            ctx.fillStyle = dec.color;
            ctx.fillRect(px + 14, py + 24, 4, 4);

        } else if (dec.type === 'star') {
            // 4-point pixel star (party theme)
            const cx = px + 16;
            const cy = py + 16;
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(cx - 2, cy - 10, 4, 20); // vertical
            ctx.fillRect(cx - 10, cy - 2, 20, 4); // horizontal
            ctx.fillRect(cx - 2, cy - 2, 4, 4);   // center
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(cx - 2, cy - 6, 2, 4);   // top highlight
        }

        ctx.restore();
    },

    // ---- Draw glowing portal ----
    drawPortal(ctx, mazeDef) {
        const p = this.portal;
        const pulse = Math.sin(p.pulse) * 0.5 + 0.5; // 0 to 1
        const glow = Math.sin(p.pulse * 1.3) * 0.3 + 0.7;
        const cx = p.x + p.w / 2;
        const cy = p.y + p.h / 2;
        const radius = 24 + pulse * 8;

        ctx.save();

        // Outer glow rings
        for (let i = 3; i >= 0; i--) {
            const alpha = (0.08 + pulse * 0.06) * (4 - i) / 4;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = mazeDef.portalColor;
            ctx.beginPath();
            ctx.arc(cx, cy, radius + i * 12, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;

        // Inner portal circle (main glow)
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, mazeDef.portalGlow);
        grad.addColorStop(0.5, mazeDef.portalColor);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Portal ring border
        ctx.strokeStyle = mazeDef.portalColor;
        ctx.lineWidth = 3;
        ctx.globalAlpha = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 1;

        // Rotating sparkle dots around portal
        for (let i = 0; i < 8; i++) {
            const angle = this.portal.pulse * 1.2 + (i * Math.PI * 2 / 8);
            const sx = cx + Math.cos(angle) * (radius + 6);
            const sy = cy + Math.sin(angle) * (radius + 6);
            ctx.fillStyle = mazeDef.portalGlow;
            ctx.globalAlpha = 0.6 + pulse * 0.4;
            ctx.fillRect(sx - 2, sy - 2, 4, 4);
        }

        ctx.globalAlpha = 1;

        // "GO!" label
        ctx.fillStyle = mazeDef.portalGlow;
        ctx.font = 'bold 14px "Pixelify Sans", monospace';
        ctx.textAlign = 'center';
        ctx.globalAlpha = 0.7 + pulse * 0.3;
        const labelY = p.y < 40 ? p.y + p.h + radius + 12 : p.y - 6;
        ctx.fillText('GO!', cx, labelY);
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';

        ctx.restore();
    },

    // ---- Draw ambient particles ----
    drawParticles(ctx) {
        ctx.save();
        this.particles.forEach(p => {
            const progress = p.life / p.maxLife;
            const alpha = progress < 0.2 ? progress / 0.2
                        : progress > 0.8 ? (1 - progress) / 0.2
                        : 1;
            ctx.globalAlpha = alpha * 0.8;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        });
        ctx.restore();
    },

    // ---- Draw Nhu player sprite with optional horizontal flip ----
    drawPlayerSprite(ctx, frame, flipX) {
        const px = this.player.x;
        const py = this.player.y;
        const scale = 1;
        const spriteW = 32 * scale; // sprite grid is 32 columns (32x32 sprites)
        const walkOffset = (this.player.frame === 1 && this.player.moving) ? 1 : 0;

        // 32x32 sprite at scale 1 = 32px = exactly 1 tile, no offset needed
        ctx.save();
        if (flipX) {
            ctx.translate(px + spriteW, py + walkOffset);
            ctx.scale(-1, 1);
            drawSprite(ctx, SPRITES.nhu, scale, 0, 0, frame);
        } else {
            drawSprite(ctx, SPRITES.nhu, scale, px, py + walkOffset, frame);
        }
        ctx.restore();
    },

    // ---- Draw speech bubble (in screen space) ----
    drawSpeechBubble(ctx, sb) {
        // Convert world coordinates to screen coordinates
        const screenX = sb.x - this.camX;
        const screenY = sb.y - this.camY;

        ctx.save();
        ctx.font = '11px "Pixelify Sans", monospace';
        const textWidth = Math.max(ctx.measureText(sb.text).width, 50);
        const bw = Math.min(textWidth + 20, 200);
        const bh = 26;
        const bx = Math.max(4, Math.min(this.W - bw - 4, screenX - bw / 2));
        const by = Math.max(4, screenY - bh - 8);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(bx + 2, by + 2, bw, bh);

        // Bubble body
        ctx.fillStyle = '#fffde7';
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(bx, by, bw, bh, 5);
        } else {
            ctx.rect(bx, by, bw, bh);
        }
        ctx.fill();

        // Border
        ctx.strokeStyle = '#f9a825';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Tail (triangle pointing down)
        const tailX = Math.max(bx + 8, Math.min(bx + bw - 8, screenX));
        ctx.fillStyle = '#fffde7';
        ctx.beginPath();
        ctx.moveTo(tailX - 5, by + bh);
        ctx.lineTo(tailX,     by + bh + 8);
        ctx.lineTo(tailX + 5, by + bh);
        ctx.fill();
        ctx.strokeStyle = '#f9a825';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Text
        ctx.fillStyle = '#5d4037';
        ctx.font = '11px "Pixelify Sans", monospace';
        ctx.fillText(sb.text, bx + 8, by + bh - 8, bw - 16);

        ctx.restore();
    },

    // ---- Draw hint text (screen space) ----
    drawHint(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, this.H - 22, this.W, 22);
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px "Pixelify Sans", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Arrow keys / WASD / touch to move  |  Reach the glowing portal!', this.W / 2, this.H - 7);
        ctx.textAlign = 'left';
        ctx.restore();
    }
};
