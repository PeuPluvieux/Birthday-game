// ============================================================
// MUSIC ENGINE v2 - Rich chiptune music using Web Audio API
// Layered instruments, proper envelopes, uplifting melodies
// ============================================================

const Music = {
    ctx: null,
    currentTrack: null,
    masterGain: null,
    isPlaying: false,
    volume: 0.25,
    loopTimers: [],

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.ctx.destination);
    },

    play(trackName) {
        this.init();
        this.stop();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        this.isPlaying = true;
        this.currentTrack = trackName;

        switch(trackName) {
            case 'title': this.playTitle(); break;
            case 'opening': this.playOpening(); break;
            case 'world1': this.playWorld1(); break;
            case 'world2': this.playWorld2(); break;
            case 'world3': this.playWorld3(); break;
            case 'celebration': this.playCelebration(); break;
        }
    },

    stop() {
        this.isPlaying = false;
        this.currentTrack = null;
        this.loopTimers.forEach(t => clearTimeout(t));
        this.loopTimers = [];
    },

    // === INSTRUMENT: Lead (rich square with detune) ===
    playLead(freq, time, dur, vol = 0.08) {
        if (!this.ctx || !this.isPlaying) return;
        // Two slightly detuned square waves for richness
        [0, 3].forEach(detune => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.value = freq;
            osc.detune.value = detune;
            // ADSR envelope
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(vol, time + 0.02); // attack
            gain.gain.linearRampToValueAtTime(vol * 0.7, time + 0.05); // decay
            gain.gain.setValueAtTime(vol * 0.7, time + dur - 0.05); // sustain
            gain.gain.exponentialRampToValueAtTime(0.001, time + dur); // release
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(time);
            osc.stop(time + dur + 0.01);
        });
    },

    // === INSTRUMENT: Bass (triangle, warm) ===
    playBass(freq, time, dur, vol = 0.12) {
        if (!this.ctx || !this.isPlaying) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(vol, time + 0.01);
        gain.gain.setValueAtTime(vol, time + dur * 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + dur + 0.01);
    },

    // === INSTRUMENT: Pad (sine, atmospheric) ===
    playPad(freq, time, dur, vol = 0.04) {
        if (!this.ctx || !this.isPlaying) return;
        [0, -5, 5].forEach(detune => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.detune.value = detune;
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(vol, time + 0.1);
            gain.gain.setValueAtTime(vol, time + dur - 0.2);
            gain.gain.linearRampToValueAtTime(0, time + dur);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(time);
            osc.stop(time + dur + 0.05);
        });
    },

    // === INSTRUMENT: Arp (fast plucky notes) ===
    playArp(freq, time, vol = 0.05) {
        if (!this.ctx || !this.isPlaying) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + 0.15);
    },

    // === DRUMS ===
    playKick(time, vol = 0.15) {
        if (!this.ctx || !this.isPlaying) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.12);
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + 0.2);
    },

    playSnare(time, vol = 0.06) {
        if (!this.ctx || !this.isPlaying) return;
        const bufSize = this.ctx.sampleRate * 0.1;
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 3000;
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        src.start(time);
        src.stop(time + 0.12);
    },

    playHihat(time, vol = 0.03) {
        if (!this.ctx || !this.isPlaying) return;
        const bufSize = this.ctx.sampleRate * 0.04;
        const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 8000;
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        src.start(time);
        src.stop(time + 0.06);
    },

    // Note frequency lookup
    N: {
        'C3':130.81,'D3':146.83,'Eb3':155.56,'E3':164.81,'F3':174.61,'G3':196.00,'Ab3':207.65,'A3':220.00,'Bb3':233.08,'B3':246.94,
        'C4':261.63,'D4':293.66,'Eb4':311.13,'E4':329.63,'F4':349.23,'F#4':369.99,'G4':392.00,'Ab4':415.30,'A4':440.00,'Bb4':466.16,'B4':493.88,
        'C5':523.25,'D5':587.33,'Eb5':622.25,'E5':659.25,'F5':698.46,'G5':783.99,'A5':880.00,'B5':987.77,
        'C6':1046.50
    },

    b(beats, bpm) { return (60 / bpm) * beats; },

    scheduleLoop(trackName, fn, intervalBeats, bpm) {
        const intervalMs = this.b(intervalBeats, bpm) * 1000;
        let t = this.ctx.currentTime + 0.1;

        const loop = () => {
            if (!this.isPlaying || this.currentTrack !== trackName) return;
            fn(t);
            t += this.b(intervalBeats, bpm);
            const timer = setTimeout(loop, intervalMs - 50);
            this.loopTimers.push(timer);
        };
        loop();
    },

    // ======= TITLE: Dreamy, twinkling ===
    playTitle() {
        const bpm = 95;
        this.scheduleLoop('title', (t) => {
            const n = this.N, b = (x) => this.b(x, bpm);
            // Twinkling arpeggio
            const arp = ['E4','G4','B4','E5','B4','G4','D5','G4','B4','D5','B4','G4','C5','E4','G4','C5'];
            arp.forEach((note, i) => this.playArp(n[note], t + i * b(0.5), 0.04));
            // Pad
            this.playPad(n['E3'], t, b(4), 0.03);
            this.playPad(n['G3'], t + b(4), b(4), 0.03);
        }, 8, bpm);
    },

    // ======= OPENING: Warm Pokémon-style adventure theme ===
    playOpening() {
        const bpm = 108;
        this.scheduleLoop('opening', (t) => {
            const n = this.N, b = (x) => this.b(x, bpm);
            // Melody - warm and adventurous
            const mel = [
                ['C4',1],['E4',1],['G4',1],['C5',1],['B4',0.5],['A4',0.5],['G4',1],['E4',1],
                ['F4',1],['A4',1],['C5',1],['A4',1],['G4',0.5],['F4',0.5],['E4',1],['D4',1]
            ];
            let off = 0;
            mel.forEach(([note, dur]) => {
                this.playLead(n[note], t + off, b(dur) * 0.9, 0.06);
                off += b(dur);
            });
            // Bass
            [['C3',2],['C3',2],['F3',2],['F3',2],['G3',2],['G3',2],['C3',2],['G3',2]].forEach(([note, dur], i) => {
                let boff = 0; for(let j=0;j<i;j++) boff += b(2);
                this.playBass(n[note], t + boff, b(dur) * 0.9);
            });
            // Light drums
            for (let i = 0; i < 8; i++) {
                this.playKick(t + i * b(2), 0.06);
                this.playHihat(t + i * b(2) + b(1), 0.02);
            }
        }, 16, bpm);
    },

    // ======= WORLD 1: Upbeat and cheerful! ===
    playWorld1() {
        const bpm = 138;
        this.scheduleLoop('world1', (t) => {
            const n = this.N, b = (x) => this.b(x, bpm);
            // Happy bouncy melody
            const mel = [
                ['G4',0.5],['A4',0.5],['B4',0.5],['D5',0.5],['B4',0.5],['A4',0.5],['G4',0.5],['E4',0.5],
                ['F#4',0.5],['A4',0.5],['D5',0.5],['A4',0.5],['B4',0.5],['G4',0.5],['A4',0.5],['B4',0.5],
                ['C5',0.5],['D5',0.5],['E5',0.5],['C5',0.5],['D5',0.5],['B4',0.5],['A4',0.5],['G4',0.5],
                ['E4',0.5],['G4',0.5],['A4',0.5],['B4',0.5],['G4',1],['G4',0.5],['A4',0.5]
            ];
            let off = 0;
            mel.forEach(([note, dur]) => {
                this.playLead(n[note], t + off, b(dur) * 0.85, 0.055);
                off += b(dur);
            });
            // Bouncy bass
            const bass = ['G3','G3','C4','C4','D4','D4','G3','G3','C4','C4','E3','E3','D3','D3','G3','G3'];
            bass.forEach((note, i) => this.playBass(n[note], t + i * b(1), b(0.9), 0.1));
            // Drums - upbeat pattern
            for (let i = 0; i < 16; i++) {
                if (i % 2 === 0) this.playKick(t + i * b(1), 0.1);
                if (i % 2 === 1) this.playSnare(t + i * b(1), 0.05);
                this.playHihat(t + i * b(0.5), 0.02);
            }
        }, 16, bpm);
    },

    // ======= WORLD 2: Intense runner music! ===
    playWorld2() {
        const bpm = 155;
        this.scheduleLoop('world2', (t) => {
            const n = this.N, b = (x) => this.b(x, bpm);
            // Driving melody
            const mel = [
                ['A4',0.5],['C5',0.5],['E5',0.5],['A4',0.5],['C5',0.5],['D5',0.5],['E5',0.5],['D5',0.5],
                ['C5',0.5],['A4',0.5],['G4',0.5],['A4',0.5],['C5',1],['A4',0.5],['G4',0.5],
                ['F4',0.5],['A4',0.5],['C5',0.5],['F4',0.5],['G4',0.5],['A4',0.5],['G4',0.5],['E4',0.5],
                ['A4',0.5],['C5',0.5],['D5',0.5],['E5',0.5],['D5',0.5],['C5',0.5],['A4',0.5],['A4',0.5]
            ];
            let off = 0;
            mel.forEach(([note, dur]) => {
                this.playLead(n[note], t + off, b(dur) * 0.8, 0.06);
                off += b(dur);
            });
            // Driving bass - eighth notes
            const bassNotes = ['A3','A3','A3','A3','F3','F3','F3','F3','G3','G3','G3','G3','A3','A3','E3','E3'];
            bassNotes.forEach((note, i) => this.playBass(n[note], t + i * b(1), b(0.9), 0.1));
            // Intense drums
            for (let i = 0; i < 32; i++) {
                if (i % 4 === 0) this.playKick(t + i * b(0.5), 0.12);
                if (i % 4 === 2) this.playSnare(t + i * b(0.5), 0.06);
                this.playHihat(t + i * b(0.5), 0.025);
            }
        }, 16, bpm);
    },

    // ======= WORLD 3: Cute & gentle (Pompompurin) ===
    playWorld3() {
        const bpm = 115;
        this.scheduleLoop('world3', (t) => {
            const n = this.N, b = (x) => this.b(x, bpm);
            // Sweet melody using triangle for softness
            const mel = [
                ['E5',1],['D5',0.5],['C5',0.5],['E5',1],['G5',1],
                ['F5',1],['E5',0.5],['D5',0.5],['C5',1],['D5',1],
                ['E5',1],['C5',0.5],['D5',0.5],['E5',1],['F5',1],
                ['E5',1],['D5',0.5],['C5',0.5],['C5',1],['C5',1]
            ];
            let off = 0;
            mel.forEach(([note, dur]) => {
                // Use triangle wave for cute sound
                if (!this.ctx || !this.isPlaying) return;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = n[note];
                const vol = 0.07;
                gain.gain.setValueAtTime(0, t + off);
                gain.gain.linearRampToValueAtTime(vol, t + off + 0.03);
                gain.gain.setValueAtTime(vol * 0.8, t + off + b(dur) * 0.7);
                gain.gain.exponentialRampToValueAtTime(0.001, t + off + b(dur));
                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start(t + off);
                osc.stop(t + off + b(dur) + 0.01);
                off += b(dur);
            });
            // Gentle bass
            ['C3','F3','G3','C3','F3','G3','F3','C3'].forEach((note, i) => {
                this.playBass(n[note], t + i * b(2), b(1.8), 0.06);
            });
            // Soft pad chords
            this.playPad(n['C4'], t, b(4), 0.025);
            this.playPad(n['E4'], t, b(4), 0.02);
            this.playPad(n['F4'], t + b(4), b(4), 0.025);
            this.playPad(n['A4'], t + b(4), b(4), 0.02);
            this.playPad(n['G3'], t + b(8), b(4), 0.025);
            this.playPad(n['B3'], t + b(8), b(4), 0.02);
            this.playPad(n['C4'], t + b(12), b(4), 0.025);
            // Light percussion
            for (let i = 0; i < 8; i++) {
                this.playKick(t + i * b(2), 0.04);
                this.playHihat(t + i * b(2) + b(1), 0.015);
            }
        }, 16, bpm);
    },

    // ======= CELEBRATION: Magical birthday ===
    playCelebration() {
        const bpm = 105;
        this.scheduleLoop('celebration', (t) => {
            const n = this.N, b = (x) => this.b(x, bpm);
            // Magical arpeggios
            const arp1 = ['C4','E4','G4','C5','E5','G5','E5','C5'];
            const arp2 = ['F4','A4','C5','F5','A5','F5','C5','A4'];
            const arp3 = ['G4','B4','D5','G5','B5','G5','D5','B4'];
            arp1.forEach((note, i) => this.playArp(n[note], t + i * b(0.5), 0.04));
            arp2.forEach((note, i) => this.playArp(n[note], t + b(4) + i * b(0.5), 0.04));
            arp3.forEach((note, i) => this.playArp(n[note], t + b(8) + i * b(0.5), 0.04));
            arp1.forEach((note, i) => this.playArp(n[note], t + b(12) + i * b(0.5), 0.04));
            // Warm pads
            this.playPad(n['C3'], t, b(4), 0.04);
            this.playPad(n['E3'], t, b(4), 0.03);
            this.playPad(n['G3'], t, b(4), 0.03);
            this.playPad(n['F3'], t + b(4), b(4), 0.04);
            this.playPad(n['A3'], t + b(4), b(4), 0.03);
            this.playPad(n['G3'], t + b(8), b(4), 0.04);
            this.playPad(n['B3'], t + b(8), b(4), 0.03);
            this.playPad(n['C3'], t + b(12), b(4), 0.04);
            this.playPad(n['E3'], t + b(12), b(4), 0.03);
            // Gentle lead melody
            const mel = [
                ['C5',2],['E5',1],['G5',1],['E5',2],['D5',2],
                ['F5',1],['A5',1],['G5',2],['E5',2],
            ];
            let off = 0;
            mel.forEach(([note, dur]) => {
                this.playLead(n[note], t + off, b(dur) * 0.9, 0.04);
                off += b(dur);
            });
        }, 16, bpm);
    },

    // ======= SOUND EFFECTS =======
    playSFX(type) {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const now = this.ctx.currentTime;
        const n = this.N;

        switch(type) {
            case 'collect':
                this.playArp(n['E5'], now, 0.1);
                this.playArp(n['G5'], now + 0.08, 0.1);
                this.playArp(n['C6'], now + 0.16, 0.08);
                break;
            case 'correct':
                this.playLead(n['C5'], now, 0.15, 0.08);
                this.playLead(n['E5'], now + 0.12, 0.15, 0.08);
                this.playLead(n['G5'], now + 0.24, 0.25, 0.08);
                break;
            case 'wrong':
                this.playLead(n['E4'], now, 0.2, 0.06);
                this.playLead(n['C4'], now + 0.15, 0.25, 0.06);
                break;
            case 'jump': {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(250, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.connect(gain); gain.connect(this.masterGain);
                osc.start(now); osc.stop(now + 0.2);
                break;
            }
            case 'hit':
                this.playKick(now, 0.12);
                this.playSnare(now, 0.08);
                break;
            case 'blow':
                this.playSnare(now, 0.04);
                this.playPad(n['C5'], now + 0.05, 0.4, 0.04);
                break;
            case 'victory':
                ['C4','E4','G4','C5','E5','G5'].forEach((note, i) => {
                    this.playLead(n[note], now + i * 0.1, 0.4, 0.07);
                });
                break;
            case 'click':
                this.playArp(800, now, 0.04);
                break;
        }
    }
};

// Initialize audio on first user interaction
['click', 'touchstart', 'keydown'].forEach(event => {
    document.addEventListener(event, function initAudio() {
        Music.init();
        document.removeEventListener(event, initAudio);
    }, { once: true });
});
