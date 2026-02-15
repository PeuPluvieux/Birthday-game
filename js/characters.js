// ============================================================
// characters.js  –  Pixel-art sprite data & rendering helpers
// Birthday Game App
// ============================================================

const _ = null;

const PIXEL = 4;

// ── Colour palette (matched to reference images) ──────────────
const C = {
    // Bulbasaur - from grid pixel art reference
    BT1: '#68b8a0', // teal body main
    BT2: '#88d0b0', // teal highlight
    BT3: '#489880', // teal mid-dark
    BT4: '#386858', // teal dark shadow
    BOL: '#282828', // black outline
    BLB: '#88c840', // bulb green
    BL2: '#b0d868', // bulb light/yellow-green
    BL3: '#509030', // bulb dark green
    BEY: '#d83028', // red eye
    BEW: '#ffffff', // eye white
    BMT: '#c04040', // mouth red

    // Slowpoke - from classic sprite reference
    SK1: '#f08888', // pink body main
    SK2: '#f8a8a8', // pink highlight
    SK3: '#d07070', // pink shadow
    SKO: '#282828', // black outline
    SKM: '#c8a878', // tan muzzle
    SKL: '#b09060', // muzzle dark
    SKW: '#ffffff', // eye white
    SKR: '#c83030', // mouth red
    SKT: '#f8c8c8', // tail tip lighter
    SKG: '#808080', // tail tip gray

    // Psyduck - from perler bead reference
    PY1: '#f0b020', // yellow-orange body
    PY2: '#f8d038', // yellow lighter
    PY3: '#d89818', // yellow-orange darker
    PYO: '#282828', // black outline
    PYB: '#c88830', // brown/orange arms
    PYC: '#f0d898', // cream belly
    PYW: '#ffffff', // eye white
    PYK: '#c8a048', // beak tan
    PYH: '#484848', // hair dark gray

    // Pompompurin - from grid pixel art reference
    PP1: '#f0d850', // yellow body main
    PP2: '#f8e878', // yellow highlight
    PP3: '#d0a830', // yellow shadow
    PBR: '#8b5a2b', // brown beret main
    PB3: '#5a3a1b', // brown beret dark
    PB4: '#a07040', // brown beret light
    PPO: '#484848', // dark outline/eyes
    PCL: '#58a8d0', // blue collar

    // Pompompurin extras
    PPK: '#f0b8a0', // pink/peach (cookie/paw item)
    PPW: '#f8f0e8', // white highlight on cookie

    // Patrick (boy)
    PK1: '#1a7abf', PK2: '#155c99', PK3: '#f5c8a0', PK4: '#6b3a1f',
    PK5: '#3e2010', PK6: '#1c1c3a', PK7: '#e0a07a', PK8: '#2e8fd4',

    // Nhu (girl) - from pixel art reference
    NH1: '#e8b898', // skin main
    NH2: '#d09878', // skin shadow
    NH3: '#5a3825', // hair main brown
    NH4: '#3a2010', // hair darkest / outline
    NH5: '#e03030', // red dress
    NH6: '#c02020', // red dress dark
    NHW: '#ffffff', // white polka dots + eye whites
    NHG: '#6b3a1f', // glasses brown
    NHF: '#c83030', // flower red
    NHD: '#d4a017', // gold necklace
    NHK: '#282828', // black outline
    NHS: '#d08870', // skin darker shadow
    NHB: '#483020', // hair medium brown

    // Berry
    BR1: '#e03030', BR2: '#ff6060', BR3: '#900000',
    BB1: '#2060e0', BB2: '#6090ff',
    BP1: '#e040a0', BP2: '#ff80c0',
    BRL: '#27ae60', BRD: '#1a7a40',

    // Cake
    CW1: '#ffffff', CW2: '#fff0f0',
    CY1: '#ffe066', CY2: '#f5a623',
    CF1: '#ff4444', CF2: '#ffaa00',
    CP1: '#f9a8d4', CP2: '#f472b6', CP3: '#fce7f3',
    CR1: '#e74c3c',

    NONE: null
};

// ── Shorthand aliases used inside sprite arrays ─────────────
// Bulbasaur
const BT1=C.BT1, BT2=C.BT2, BT3=C.BT3, BT4=C.BT4;
const BOL=C.BOL, BLB=C.BLB, BL2=C.BL2, BL3=C.BL3;
const BEY=C.BEY, BEW=C.BEW, BMT=C.BMT;
// Slowpoke
const SK1=C.SK1, SK2=C.SK2, SK3=C.SK3, SKO=C.SKO;
const SKM=C.SKM, SKL=C.SKL, SKW=C.SKW, SKR=C.SKR;
const SKT=C.SKT, SKG=C.SKG;
// Psyduck
const PY1=C.PY1, PY2=C.PY2, PY3=C.PY3, PYO=C.PYO;
const PYB=C.PYB, PYC=C.PYC, PYW=C.PYW, PYK=C.PYK, PYH=C.PYH;
// Pompompurin
const PP1=C.PP1, PP2=C.PP2, PP3=C.PP3;
const PBR=C.PBR, PB3=C.PB3, PB4=C.PB4;
const PPO=C.PPO, PCL=C.PCL, PPK=C.PPK, PPW=C.PPW;
// Patrick
const PK1=C.PK1, PK2=C.PK2, PK3=C.PK3, PK4=C.PK4;
const PK5=C.PK5, PK6=C.PK6, PK7=C.PK7, PK8=C.PK8;
// Nhu
const NH1=C.NH1, NH2=C.NH2, NH3=C.NH3, NH4=C.NH4;
const NH5=C.NH5, NH6=C.NH6, NHW=C.NHW, NHG=C.NHG;
const NHF=C.NHF, NHD=C.NHD, NHK=C.NHK, NHS=C.NHS, NHB=C.NHB;
// Berry
const BR1=C.BR1, BR2=C.BR2, BR3=C.BR3;
const BB1=C.BB1, BB2=C.BB2;
const BP1=C.BP1, BP2=C.BP2;
const BRL=C.BRL, BRD=C.BRD;
// Cake
const CW1=C.CW1, CW2=C.CW2;
const CY1=C.CY1, CY2=C.CY2;
const CF1=C.CF1, CF2=C.CF2;
const CP1=C.CP1, CP2=C.CP2, CP3=C.CP3;
const CR1=C.CR1;

// Legacy aliases used in sprite arrays (mapped to new palette)
// Shared
const BWT='#ffffff', BBK='#282828';
// Bulbasaur body (old BG* names)
const BG1=C.BT1, BG2=C.BT2, BG3=C.BT3, BG4=C.BT4;
// Slowpoke body (old SP* names)
const SP1=C.SK1, SP2=C.SK2, SP3=C.SK3, SP4=C.SKO;
const SP5='#c83030'; // mouth red
const SM1=C.SKM, SM2=C.SKL; // muzzle
// Psyduck (old PD* names)
const PD1=C.PY1, PD2=C.PY2, PD3=C.PY3, PD4=C.PYO, PD5='#282828';
const PB1=C.PYK, PB2=C.PYB; // beak/arms
const PF1=C.PYC; // belly/cream
const PP5=C.PPO; // eyes dark
const SPRITES = {

// ── BULBASAUR ──
bulbasaur: {
    width: 32,
    height: 32,
    // enable a small vertical bob when `frame === 'walk'` to simulate stepping
    walkBobbing: true,
idle: [
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,'#282828','#282828','#282828',_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,'#282828','#282828','#282828','#282828','#282828','#509030','#509030','#509030','#282828',_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,'#282828','#88c840','#b0d868','#88c840','#88c840','#509030','#509030','#509030','#282828','#282828',_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,'#282828','#88c840','#b0d868','#b0d868','#88c840','#88c840','#509030','#509030','#509030','#509030','#282828',_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,'#282828','#282828','#282828',_,_,_,'#282828','#88c840','#88c840','#b0d868','#88c840','#509030','#509030','#88c840','#509030','#509030','#509030','#282828','#282828',_,_,_,_,_,_,_,_],
[_,_,_,_,'#282828','#68b8a0','#88d0b0','#68b8a0','#282828','#282828','#282828','#68b8a0','#282828','#88c840','#88c840','#88c840','#509030','#282828','#88c840','#509030','#509030','#509030','#509030','#282828',_,_,_,_,_,_,_,_],
[_,_,_,_,'#282828','#88d0b0','#88d0b0','#88d0b0','#68b8a0','#88d0b0','#68b8a0','#68b8a0','#68b8a0','#282828','#88c840','#509030','#282828','#509030','#509030','#509030','#509030','#509030','#282828',_,_,_,_,_,_,_,_,_],
[_,_,_,_,'#282828','#68b8a0','#88d0b0','#88d0b0','#88d0b0','#68b8a0','#489880','#68b8a0','#68b8a0','#68b8a0','#282828','#282828','#509030','#509030','#509030','#509030','#509030','#282828',_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,'#282828','#489880','#68b8a0','#88d0b0','#68b8a0','#68b8a0','#68b8a0','#68b8a0','#489880','#282828',_,_,'#282828','#282828','#509030','#509030','#509030','#509030','#282828','#282828',_,_,_,_,_,_,_,_],
[_,_,_,_,'#282828','#d83028','#68b8a0','#68b8a0','#88d0b0','#68b8a0','#489880','#68b8a0','#282828','#d83028','#282828',_,'#282828','#489880','#282828','#509030','#509030','#88c840','#509030','#509030','#282828',_,_,_,_,_,_,_],
[_,_,_,_,'#282828','#d83028','#ffffff','#88d0b0','#88d0b0','#68b8a0','#88d0b0','#ffffff','#d83028','#d83028','#282828',_,'#282828','#68b8a0','#489880','#489880','#88c840','#88c840','#509030','#88c840','#282828',_,_,_,_,_,_,_],
[_,_,_,'#282828','#68b8a0','#282828','#ffffff','#88d0b0','#88d0b0','#88d0b0','#88d0b0','#ffffff','#282828','#d83028','#282828',_,'#282828','#68b8a0','#68b8a0','#489880','#489880','#509030','#88c840','#88c840','#282828',_,_,_,_,_,_,_],
[_,_,_,'#282828','#282828','#68b8a0','#68b8a0','#88d0b0','#88d0b0','#68b8a0','#68b8a0','#68b8a0','#68b8a0','#282828','#282828','#489880','#489880','#489880','#489880','#489880','#489880','#489880','#282828','#282828',_,_,_,_,_,_,_,_],
[_,_,_,'#282828','#68b8a0','#282828',_,'#282828','#88d0b0','#88d0b0','#68b8a0','#489880','#282828','#282828',_,'#282828','#489880','#68b8a0','#489880','#68b8a0','#489880','#386858','#282828',_,_,_,_,_,_,_,_,_],
[_,_,_,_,'#282828',_,_,'#282828','#d83028','#c04040','#d83028','#d83028','#d83028','#282828','#489880','#68b8a0','#282828','#386858','#489880','#489880','#489880','#386858','#282828',_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,'#282828','#489880','#282828','#282828','#282828','#282828','#489880','#282828','#282828','#386858','#489880','#489880','#489880','#489880','#489880','#282828',_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,'#282828','#489880','#386858','#282828','#282828','#282828','#282828','#489880','#68b8a0','#68b8a0','#489880','#386858','#386858','#386858','#282828','#489880','#282828',_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,'#282828','#88d0b0','#68b8a0','#282828','#386858','#386858','#386858','#489880','#68b8a0','#68b8a0','#282828','#489880','#489880','#386858','#489880','#282828',_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,'#282828','#88d0b0','#88d0b0','#489880','#282828',_,'#282828','#68b8a0','#68b8a0','#68b8a0','#282828',_,'#282828','#489880','#489880','#282828',_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,'#282828','#68b8a0','#282828',_,_,'#282828','#88d0b0','#88d0b0','#282828',_,_,_,'#282828',_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,'#282828','#282828','#282828',_,_,_,'#282828','#282828',_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]
],
walk: [
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,'#282828','#282828','#282828',_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,'#282828','#282828','#282828','#282828','#282828','#509030','#509030','#509030','#282828',_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,'#282828','#88c840','#b0d868','#88c840','#88c840','#509030','#509030','#509030','#282828','#282828',_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,'#282828','#88c840','#b0d868','#b0d868','#88c840','#88c840','#509030','#509030','#509030','#509030','#282828',_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,'#282828','#282828','#282828',_,_,_,'#282828','#88c840','#88c840','#b0d868','#88c840','#509030','#509030','#88c840','#509030','#509030','#509030','#282828','#282828',_,_,_,_,_,_,_,_],
[_,_,_,_,'#282828','#68b8a0','#88d0b0','#68b8a0','#282828','#282828','#282828','#68b8a0','#282828','#88c840','#88c840','#88c840','#509030','#282828','#88c840','#509030','#509030','#509030','#509030','#282828',_,_,_,_,_,_,_,_],
[_,_,_,_,'#282828','#88d0b0','#88d0b0','#88d0b0','#68b8a0','#88d0b0','#68b8a0','#68b8a0','#68b8a0','#282828','#88c840','#509030','#282828','#509030','#509030','#509030','#509030','#509030','#282828',_,_,_,_,_,_,_,_,_],
[_,_,_,_,'#282828','#68b8a0','#88d0b0','#88d0b0','#88d0b0','#68b8a0','#489880','#68b8a0','#68b8a0','#68b8a0','#282828','#282828','#509030','#509030','#509030','#509030','#509030','#282828',_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,'#282828','#489880','#68b8a0','#88d0b0','#68b8a0','#68b8a0','#68b8a0','#68b8a0','#489880','#282828',_,_,'#282828','#282828','#509030','#509030','#509030','#509030','#282828','#282828',_,_,_,_,_,_,_,_],
[_,_,_,_,'#282828','#d83028','#68b8a0','#68b8a0','#88d0b0','#68b8a0','#489880','#68b8a0','#282828','#d83028','#282828',_,'#282828','#489880','#282828','#509030','#509030','#88c840','#509030','#509030','#282828',_,_,_,_,_,_,_],
[_,_,_,_,'#282828','#d83028','#ffffff','#88d0b0','#88d0b0','#68b8a0','#88d0b0','#ffffff','#d83028','#d83028','#282828',_,'#282828','#68b8a0','#489880','#489880','#88c840','#88c840','#509030','#88c840','#282828',_,_,_,_,_,_,_],
[_,_,_,'#282828','#68b8a0','#282828','#ffffff','#88d0b0','#88d0b0','#88d0b0','#88d0b0','#ffffff','#282828','#d83028','#282828',_,'#282828','#68b8a0','#68b8a0','#489880','#489880','#509030','#88c840','#88c840','#282828',_,_,_,_,_,_,_],
[_,_,_,'#282828','#282828','#68b8a0','#68b8a0','#88d0b0','#88d0b0','#68b8a0','#68b8a0','#68b8a0','#68b8a0','#282828','#282828','#489880','#489880','#489880','#489880','#489880','#489880','#489880','#282828','#282828',_,_,_,_,_,_,_,_],
[_,_,_,'#282828','#68b8a0','#282828',_,'#282828','#88d0b0','#88d0b0','#68b8a0','#489880','#282828','#282828',_,'#282828','#489880','#68b8a0','#489880','#68b8a0','#489880','#386858','#282828',_,_,_,_,_,_,_,_,_],
[_,_,_,_,'#282828',_,_,'#282828','#d83028','#c04040','#d83028','#d83028','#d83028','#282828','#489880','#68b8a0','#282828','#386858','#489880','#489880','#489880','#386858','#282828',_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,'#282828','#489880','#282828','#282828','#282828','#282828','#489880','#282828','#282828','#386858','#489880','#489880','#489880','#489880','#489880','#282828',_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,'#282828','#489880','#386858','#282828','#282828','#282828','#282828','#489880','#68b8a0','#68b8a0','#489880','#386858','#386858','#386858','#282828','#489880','#282828',_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,'#282828','#88d0b0','#68b8a0','#282828','#386858','#386858','#386858','#489880','#68b8a0','#68b8a0','#282828','#489880','#489880','#386858','#489880','#282828',_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,'#282828','#68b8a0','#88d0b0','#88d0b0','#489880','#282828',_,'#282828','#68b8a0','#68b8a0','#68b8a0','#282828',_,'#282828','#489880','#489880','#489880','#282828',_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,'#282828','#282828','#68b8a0','#282828',_,_,_,'#282828','#88d0b0','#88d0b0','#282828',_,_,'#282828','#282828','#489880','#282828',_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,'#282828',_,_,_,_,_,'#282828','#282828',_,_,_,_,'#282828','#282828',_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]
]
},

// -- SLOWPOKE -- uses reference image --
slowpoke: {
imageUrl: 'reference images/slowpoke.png',
width: 48, height: 32
},

// -- PSYDUCK -- uses reference image --
psyduck: {
    imageUrl: 'reference images/psyduck.png',
width: 32, height: 38
},

// -- POMPOMPURIN -- uses reference image --
pompompurin: {
    imageUrl: 'reference images/pompompurin.png',
width: 32, height: 32
},

// ── PATRICK 32×32 ──
patrick: {
idle: [
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,PK5,PK5,PK5,PK5,PK5,PK5,PK5,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,PK5,PK4,PK4,PK4,PK4,PK4,PK4,PK4,PK5,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK5,PK4,PK4,PK4,PK4,PK4,PK4,PK4,PK4,PK4,PK5,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK5,PK4,PK4,PK4,PK4,PK4,PK4,PK4,PK4,PK4,PK5,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK5,PK4,PK4,PK4,PK4,PK4,PK4,PK4,PK4,PK4,PK5,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK5,PK3,PK3,PK3,PK3,PK3,PK3,PK3,PK3,PK3,PK5,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK5,PK3,PK3,PK3,PK3,PK3,PK3,PK3,PK3,PK3,PK5,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK5,PK3,BWT,BBK,PK3,PK3,PK3,BWT,BBK,PK3,PK5,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK5,PK3,PK3,PK3,PK3,PK7,PK3,PK3,PK3,PK3,PK5,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK5,PK3,PK3,PK3,PK3,PK3,PK3,PK3,PK3,PK3,PK5,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK5,PK7,PK3,PK3,BBK,BBK,BBK,PK3,PK3,PK7,PK5,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,PK5,PK7,PK3,PK3,PK3,PK3,PK3,PK7,PK5,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,PK5,PK5,PK5,PK5,PK5,PK5,PK5,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,PK2,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK2,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK2,PK1,PK8,PK8,PK1,PK1,PK1,PK8,PK8,PK1,PK2,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,PK3,PK2,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK2,PK3,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,PK3,PK2,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK2,PK3,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK2,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK2,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK2,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK2,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,PK2,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK2,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,PK2,PK2,PK6,PK6,PK6,PK6,PK6,PK2,PK2,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,PK5,PK6,PK6,PK6,PK6,PK6,PK6,PK6,PK5,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,PK5,PK6,PK6,PK6,PK6,PK6,PK6,PK6,PK5,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,PK5,PK6,PK6,PK6,_,PK6,PK6,PK6,PK5,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,PK5,PK6,PK6,PK6,_,PK6,PK6,PK6,PK5,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,PK5,BBK,BBK,BBK,_,BBK,BBK,BBK,PK5,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,PK5,BBK,BBK,BBK,_,BBK,BBK,BBK,PK5,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]
],
walk: [
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,PK5,PK5,PK5,PK5,PK5,PK5,PK5,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,PK5,PK4,PK4,PK4,PK4,PK4,PK4,PK4,PK5,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK5,PK4,PK4,PK4,PK4,PK4,PK4,PK4,PK4,PK4,PK5,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK5,PK4,PK4,PK4,PK4,PK4,PK4,PK4,PK4,PK4,PK5,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK5,PK4,PK4,PK4,PK4,PK4,PK4,PK4,PK4,PK4,PK5,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK5,PK3,PK3,PK3,PK3,PK3,PK3,PK3,PK3,PK3,PK5,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK5,PK3,PK3,PK3,PK3,PK3,PK3,PK3,PK3,PK3,PK5,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK5,PK3,BWT,BBK,PK3,PK3,PK3,BWT,BBK,PK3,PK5,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK5,PK3,PK3,PK3,PK3,PK7,PK3,PK3,PK3,PK3,PK5,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK5,PK3,PK3,PK3,PK3,PK3,PK3,PK3,PK3,PK3,PK5,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK5,PK7,PK3,PK3,BBK,BBK,BBK,PK3,PK3,PK7,PK5,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,PK5,PK7,PK3,PK3,PK3,PK3,PK3,PK7,PK5,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,PK5,PK5,PK5,PK5,PK5,PK5,PK5,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,PK2,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK2,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK2,PK1,PK8,PK8,PK1,PK1,PK1,PK8,PK8,PK1,PK2,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,PK3,PK2,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK2,PK3,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,PK3,PK2,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK2,PK3,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK2,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK2,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK2,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK2,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,PK2,PK1,PK1,PK1,PK1,PK1,PK1,PK1,PK2,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,PK2,PK2,PK6,PK6,PK6,PK6,PK6,PK2,PK2,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,PK5,PK6,PK6,PK6,PK6,PK6,PK6,PK6,PK5,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,PK5,PK6,PK6,PK6,PK6,PK6,PK6,PK6,PK5,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,PK5,PK6,PK6,PK6,_,_,_,PK6,PK6,PK6,PK5,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,PK6,PK6,PK6,_,_,_,PK6,PK6,PK6,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,BBK,BBK,BBK,_,_,_,_,_,BBK,BBK,BBK,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,BBK,BBK,BBK,_,_,_,_,_,BBK,BBK,BBK,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]
]
},

// -- NHU -- uses reference image --
nhu: {
    imageUrl: 'reference images/Nhu.png',
    width: 32, height: 32
},

// ────────────────────────────────────────────────────────────
// CAKE  16x16   birthday cake with candles, pink frosting
// ────────────────────────────────────────────────────────────
cake: [
[_, _, _, _, _, CF1, _, _, _, _, CF1, _, _, _, _, _],
[_, _, _, _, _, CF2, _, _, _, _, CF2, _, _, _, _, _],
[_, _, _, _, _, CY2, _, _, _, _, CY2, _, _, _, _, _],
[_, _, _, _, _, CY1, _, _, _, _, CY1, _, _, _, _, _],
[_, _, _, CP2, CP2, CP2, CP2, CP2, CP2, CP2, CP2, CP2, CP2, _, _, _],
[_, _, CP2, CP1, CP3, CP3, CP1, CP1, CP3, CP3, CP1, CP1, CP3, CP2, _, _],
[_, _, CP2, CP3, CP1, CP1, CP3, CP3, CP1, CP1, CP3, CP3, CP1, CP2, _, _],
[_, _, CP2, CP2, CP2, CP2, CP2, CP2, CP2, CP2, CP2, CP2, CP2, CP2, _, _],
[_, _, CW1, CW1, CW1, CW1, CW1, CW1, CW1, CW1, CW1, CW1, CW1, CW1, _, _],
[_, _, CW1, CW2, CW2, CW1, CW1, CW2, CW2, CW1, CW1, CW2, CW2, CW1, _, _],
[_, _, CW1, CW1, CW1, CW1, CW1, CW1, CW1, CW1, CW1, CW1, CW1, CW1, _, _],
[_, _, CP2, CP1, CP3, CP3, CP1, CP1, CP3, CP3, CP1, CP1, CP3, CP2, _, _],
[_, _, CP2, CP2, CP2, CP2, CP2, CP2, CP2, CP2, CP2, CP2, CP2, CP2, _, _],
[_, _, CW1, CW2, CW1, CW1, CW2, CW1, CW1, CW2, CW1, CW1, CW2, CW1, _, _],
[_, _, CW1, CW1, CW1, CW1, CW1, CW1, CW1, CW1, CW1, CW1, CW1, CW1, _, _],
[_, _, CY2, CY2, CY2, CY2, CY2, CY2, CY2, CY2, CY2, CY2, CY2, CY2, _, _]
],

// ────────────────────────────────────────────────────────────
// BERRIES  8x8   collectible fruit
// ────────────────────────────────────────────────────────────
berry: [
[_, _, _, BRD, BRL, _, _, _],
[_, _, BRL, BRL, BRD, _, _, _],
[_, BR3, BR1, BR1, BR1, BR3, _, _],
[BR3, BR1, BR2, BR1, BR1, BR1, BR3, _],
[BR3, BR1, BR2, BR1, BR1, BR1, BR3, _],
[BR3, BR1, BR1, BR1, BR1, BR1, BR3, _],
[_, BR3, BR1, BR1, BR1, BR3, _, _],
[_, _, BR3, BR3, BR3, _, _, _]
],

berryBlue: [
[_, _, _, BRD, BRL, _, _, _],
[_, _, BRL, BRL, BRD, _, _, _],
[_, BB1, BB1, BB1, BB1, BB1, _, _],
[BB1, BB1, BB2, BB1, BB1, BB1, BB1, _],
[BB1, BB1, BB2, BB1, BB1, BB1, BB1, _],
[BB1, BB1, BB1, BB1, BB1, BB1, BB1, _],
[_, BB1, BB1, BB1, BB1, BB1, _, _],
[_, _, BB1, BB1, BB1, _, _, _]
],

berryPink: [
[_, _, _, BRD, BRL, _, _, _],
[_, _, BRL, BRL, BRD, _, _, _],
[_, BP1, BP1, BP1, BP1, BP1, _, _],
[BP1, BP1, BP2, BP1, BP1, BP1, BP1, _],
[BP1, BP1, BP2, BP1, BP1, BP1, BP1, _],
[BP1, BP1, BP1, BP1, BP1, BP1, BP1, _],
[_, BP1, BP1, BP1, BP1, BP1, _, _],
[_, _, BP1, BP1, BP1, _, _, _]
]


};  // end SPRITES


// ============================================================
// INTERNAL HELPER: resolve sprite data from SPRITES entry
// Handles both flat-array format and { idle, walk } format.
// frame: 'idle' (default) or 'walk'
// ============================================================
function _resolveSprite(spriteData, frame) {
    if (!spriteData) return null;
    if (Array.isArray(spriteData)) return spriteData;
    frame = frame || 'idle';
    return spriteData[frame] || spriteData.idle || null;
}

// ============================================================
// RENDERING HELPERS
// ============================================================

function spriteToBoxShadow(spriteOrData, scale, frame) {
    scale = scale || PIXEL;
    const sprite = _resolveSprite(spriteOrData, frame);
    if (!sprite) return '';
    const shadows = [];
    for (let y = 0; y < sprite.length; y++) {
        for (let x = 0; x < sprite[y].length; x++) {
            if (sprite[y][x]) {
                shadows.push(`${x * scale}px ${y * scale}px 0 0 ${sprite[y][x]}`);
            }
        }
    }
    return shadows.join(', ');
}

// Cache for preloaded images used in canvas rendering
var _imageCache = {};
function _loadImage(src) {
    if (!_imageCache[src]) {
        var img = new Image();
        img.src = src;
        _imageCache[src] = img;
    }
    return _imageCache[src];
}

function drawSprite(ctx, spriteOrData, scale, offsetX, offsetY, frame) {
    // Support image-based sprites: { imageUrl, width, height }
    if (spriteOrData && spriteOrData.imageUrl) {
        var img = _loadImage(spriteOrData.imageUrl);
        var w = (spriteOrData.width || 32) * scale;
        var h = (spriteOrData.height || 32) * scale;
        ctx.imageSmoothingEnabled = false;
        if (img.complete && img.naturalWidth) {
            ctx.drawImage(img, (offsetX || 0), (offsetY || 0), w, h);
        }
        return;
    }
    const sprite = _resolveSprite(spriteOrData, frame || 'idle');
    if (!sprite) return;
    for (let y = 0; y < sprite.length; y++) {
        for (let x = 0; x < sprite[y].length; x++) {
            if (sprite[y][x]) {
                ctx.fillStyle = sprite[y][x];
                ctx.fillRect(
                    (offsetX || 0) + x * scale,
                    (offsetY || 0) + y * scale,
                    scale, scale
                );
            }
        }
    }
}

function createSpriteElement(spriteName, scale, frame) {
    scale = scale || PIXEL;
    const spriteData = SPRITES[spriteName];
    if (!spriteData) return null;

    // Support image-based sprites
    if (spriteData.imageUrl) {
        var targetH = (spriteData.height || 32) * scale;
        var img = document.createElement('img');
        img.src = spriteData.imageUrl;
        img.className = 'pixel-sprite sprite-' + spriteName;
        img.style.imageRendering = 'pixelated';
        img.style.height = targetH + 'px';
        img.style.width = 'auto';
        img.style.display = 'block';
        var container = document.createElement('div');
        container.className = 'sprite-container';
        container.style.display = 'inline-block';
        container.appendChild(img);
        return container;
    }

    const sprite = _resolveSprite(spriteData, frame || 'idle');
    if (!sprite) return null;

    const canvas = document.createElement('canvas');
    canvas.width = sprite[0].length * scale;
    canvas.height = sprite.length * scale;
    canvas.className = 'pixel-sprite sprite-' + spriteName;
    canvas.style.imageRendering = 'pixelated';
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    canvas.style.display = 'block';

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    drawSprite(ctx, sprite, scale, 0, 0);

    var container = document.createElement('div');
    container.className = 'sprite-container';
    container.style.width = canvas.width + 'px';
    container.style.height = canvas.height + 'px';
    container.style.position = 'relative';
    container.appendChild(canvas);

    return container;
}

function createAnimatedSpriteElement(spriteName, scale, intervalMs) {
    scale = scale || PIXEL;
    intervalMs = intervalMs || 400;
    const spriteData = SPRITES[spriteName];
    if (!spriteData) return null;

    if (Array.isArray(spriteData) || !spriteData.walk) {
        return { container: createSpriteElement(spriteName, scale), stop: function(){} };
    }

    let currentFrame = 'idle';
    var container = createSpriteElement(spriteName, scale, 'idle');

    const timer = setInterval(function() {
        currentFrame = (currentFrame === 'idle') ? 'walk' : 'idle';
        const canvas = container.querySelector('canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawSprite(ctx, spriteData, scale, 0, 0, currentFrame);
    }, intervalMs);

    // attach a removable stop hook directly to the container so callers
    // that only have DOM references can stop the animation timer.
    container._stopAnim = function() { clearInterval(timer); delete container._stopAnim; };

    return {
        container: container,
        stop: function() { if (container && container._stopAnim) container._stopAnim(); }
    };
}

// ============================================================
// RENDER CHARACTERS INTO DOM PLACEHOLDERS
// ============================================================

function renderCharacters() {
    document.querySelectorAll('.opening-char').forEach(function(el) {
        var charName = null;
        el.className.split(' ').forEach(function(c) {
            if (c.startsWith('char-')) charName = c.replace('char-', '');
        });
        if (charName && SPRITES[charName]) {
            // Use animated sprite if walk frames exist
            var spriteData = SPRITES[charName];
            if (spriteData && spriteData.walk) {
                var anim = createAnimatedSpriteElement(charName, 2);
                if (anim && anim.container) {
                    const prev = el.firstElementChild;
                    if (prev && prev._stopAnim) prev._stopAnim();
                    el.innerHTML = '';
                    el.appendChild(anim.container);
                }
            } else {
                var spriteEl = createSpriteElement(charName, 2);
                if (spriteEl) {
                    el.innerHTML = '';
                    el.appendChild(spriteEl);
                }
            }
        }
    });

    document.querySelectorAll('[data-sprite]').forEach(function(el) {
        var charName = el.getAttribute('data-sprite');
        var scale = parseInt(el.getAttribute('data-scale') || '3');
        if (charName && SPRITES[charName]) {
            var spriteData = SPRITES[charName];
            if (spriteData && spriteData.walk) {
                var anim = createAnimatedSpriteElement(charName, scale);
                if (anim && anim.container) {
                    const prev = el.firstElementChild;
                    if (prev && prev._stopAnim) prev._stopAnim();
                    el.innerHTML = '';
                    el.appendChild(anim.container);
                }
            } else {
                var spriteEl = createSpriteElement(charName, scale);
                if (spriteEl) {
                    el.innerHTML = '';
                    el.appendChild(spriteEl);
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', renderCharacters);

var charObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
        m.addedNodes.forEach(function(node) {
            if (node.nodeType !== 1) return;
            if (node.classList && node.classList.contains('opening-char')) {
                var charName = null;
                node.className.split(' ').forEach(function(c) {
                    if (c.startsWith('char-')) charName = c.replace('char-', '');
                });
                    if (charName && SPRITES[charName]) {
                    var spriteData = SPRITES[charName];
                    if (spriteData && spriteData.walk) {
                        var anim = createAnimatedSpriteElement(charName, 2);
                        if (anim && anim.container) {
                            const prev = node.firstElementChild;
                            if (prev && prev._stopAnim) prev._stopAnim();
                            node.innerHTML = '';
                            node.appendChild(anim.container);
                        }
                    } else {
                        var spriteEl = createSpriteElement(charName, 2);
                        if (spriteEl) {
                            const prev = node.firstElementChild;
                            if (prev && prev._stopAnim) prev._stopAnim();
                            node.innerHTML = '';
                            node.appendChild(spriteEl);
                        }
                    }
                }
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var openingChars = document.querySelector('.opening-characters');
    if (openingChars) {
        charObserver.observe(openingChars, { childList: true });
    }
});
