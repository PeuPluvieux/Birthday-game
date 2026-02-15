// ============================================================
// NHƯ'S BIRTHDAY ADVENTURE - CONFIGURATION
// ============================================================
// Patrick: Edit this file to customize everything!
// ============================================================

const CONFIG = {
    // Enable debug output (set true to log FPS and warnings)
    debug: true,
    // === NAMES ===
    birthdayGirl: "Như",
    from: "Patrick",

    // === OPENING SEQUENCE DIALOG ===
    // Each entry is one dialog screen. tap/click to advance.
    openingDialog: [
        {
            bg: "black",
            text: ["...", "... ... ...", "Can you hear me?"],
            characters: []
        },
        {
            bg: "meadow",
            text: ["Oh! There you are!"],
            characters: ["bulbasaur"]
        },
        {
            bg: "meadow",
            text: ["Hello! My name is Bulbasaur!", "Welcome to our world!"],
            characters: ["bulbasaur"]
        },
        {
            bg: "meadow",
            text: ["These are my friends — Slowpoke and Psyduck!", "We've been waiting for you!"],
            characters: ["bulbasaur", "slowpoke", "psyduck"]
        },
        {
            bg: "meadow",
            text: ["You must be...", "Như, right? ✨"],
            characters: ["bulbasaur", "slowpoke", "psyduck"],
            nameReveal: true
        },
        {
            bg: "meadow",
            text: ["Như, today is a VERY important day...", "Do you know what day it is?"],
            characters: ["bulbasaur"]
        },
        {
            bg: "meadow",
            text: ["It's... a secret!", "But I promise you'll find out soon! 🤫"],
            characters: ["bulbasaur"]
        },
        {
            bg: "meadow",
            text: ["Right now, we need your help!", "A special surprise is being prepared...", "but the ingredients got scattered across different worlds!"],
            characters: ["bulbasaur"]
        },
        {
            bg: "meadow",
            text: ["We'll need to travel through the Berry Garden,", "cross the Enchanted Forest,", "and visit Pompompurin's World!"],
            characters: ["bulbasaur"],
            showMap: true
        },
        {
            bg: "meadow",
            text: ["Don't worry — we'll be with you", "every step of the way!"],
            characters: ["bulbasaur", "slowpoke", "psyduck"]
        },
        {
            bg: "meadow",
            text: ["Well... we'll TRY to keep up.", "Slowpoke isn't exactly... fast.", "And Psyduck gets confused sometimes. 😅"],
            characters: ["bulbasaur", "slowpoke", "psyduck"],
            funnyMoment: true
        },
        {
            bg: "meadow",
            text: ["But together, we can do anything!", "Ready, Như?"],
            characters: ["bulbasaur", "slowpoke", "psyduck"],
            showStartButton: true
        }
    ],

    // === WORLD 1: BERRY COLLECTING (3 levels!) ===
    world1: {
        intro: "The Berry Garden has gone wild! We need to collect special Birthday Berries for the surprise! Bulbasaur will follow you — Slowpoke and Psyduck are here to cheer you on!",
        complete: "Amazing! You got all the berries! 🫐 But wait... we still need to reach the next world! Follow the path through the garden!",
        berriesToCollect: 20, // total across all 3 levels (5+7+8)
        timeLimit: 90, // per-level timers override this
        slowpokeMessages: ["You're doing great!", "Happy Birthday!", "Keep going!", "So many berries!", "Yaaawn... good job!", "Over there!", "Nice catch!"],
        psyduckMessages: ["Psy-yi-yi!", "Wow, so fast!", "Birthday berries!", "Psyduck believes in you!", "Quack quack!", "Look out!", "You're amazing!"]
    },

    // === WORLD 2: FOREST DODGE RUN (much harder!) ===
    world2: {
        intro: "The forest path is full of obstacles! Stay sharp and jump over them! You can even double-jump! Bulbasaur, Slowpoke, and Psyduck will run with you — we need to reach the Pompompurin Portal!",
        complete: "We made it! Look — there's the portal! ✨ Pompompurin is waiting on the other side!",
        obstaclesToDodge: 30,
        lives: 5,
        companionMessages: ["Jump!", "Watch out!", "You got this!", "Almost there!", "Keep running!", "Double jump!", "Nice dodge!"]
    },

    // === WORLD 3: POMPOMPURIN QUIZ ===
    world3: {
        intro: "Welcome to my world, Như! 🌟 Before the big surprise, I have a few fun questions for you... Let's see how well you know yourself and someone special!",
        complete: "You did wonderfully! Now close your eyes... the surprise is almost ready! 🎁"
    },

    // === QUIZ QUESTIONS ===
    quizQuestions: [
        {
            question: "What is Như's favorite color?",
            options: ["Pink like Slowpoke's belly", "Yellow ☀️", "Green like Bulbasaur", "Blue like Psyduck's tears"],
            correct: 1,
            funFact: "Golden like sunshine! ☀️"
        },
        {
            question: "What is Như's favorite Filipino food?",
            options: ["Adobo", "Sinigang", "Lechon", "Balut 🥚"],
            correct: 1,
            funFact: "The best comfort food! 🍲"
        },
        {
            question: "What is Như's favorite song?",
            options: ["Never Gonna Give You Up", "Historia de un amor", "Baby Shark", "Despacito"],
            correct: 1,
            funFact: "A timeless classic! 🎵"
        },
        {
            question: "Who's your pogiest boyfriend?",
            options: ["Bulbasaur", "Patrick 💪", "Pompompurin", "Some random guy"],
            correct: 1,
            funFact: "Obviously! The pogiest of them all! 💪"
        },
        {
            question: "What's the best memory you had with Patrick?",
            options: ["First date in Tagaytay", "Traveled to Dalat Vietnam", "Went hiking in Taiwan", "Travelling to Baguio"],
            correct: -1, // -1 means ALL answers are correct
            funFact: "Every moment with you is the best memory! 💕"
        }
    ],

    // === BIRTHDAY MESSAGE (shown line by line in finale) ===
    birthdayMessage: [
        "Happy Birthday, Như! 🎂",
        "From the streets of Tagaytay to the hills of Dalat,",
        "every adventure is better with you by my side.",
        "Thank you for being my favorite person in the world.",
        "Here's to more memories, more laughter, and more love.",
        "Forever yours, Patrick 💕"
    ],

    // === CELEBRATION ===
    celebration: {
        candleCount: 3,
        confettiCount: 80
    }
};
