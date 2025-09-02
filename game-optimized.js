/* =========================================== */
/* OPTIMIZED BIPARDY GAME - MODULAR VERSION */
/* =========================================== */

// Import optimized modules
import { timerManager, TIMER_DURATION, MAX_TIMER_BONUS } from './js/modules/timer.js';
import { uiController } from './js/modules/ui-controller.js';
import { VirtualLeaderboard } from './js/modules/leaderboard.js';
import { lazyLoader } from './js/modules/lazy-loader.js';
import { SocialSharing } from './js/modules/social-sharing.js';

/* =========================================== */
/* CORE GAME STATE & CONFIGURATION */
/* =========================================== */

// Constants
const DEBUG = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

// Complete BIP39 word list - contains only words with 5+ letters (optimized from original)
const bip39Words = [
    "abandon", "ability", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acoustic", "acquire", "across", "action", "actor", "actress", "actual", "adapt", "addict", "address", "adjust", "admit", "adult", "advance", "advice", "aerobic", "affair", "afford", "afraid", "again", "agent", "agree", "ahead", "airport", "aisle", "alarm", "album", "alcohol", "alert", "alien", "alley", "allow", "almost", "alone", "alpha", "already", "alter", "always", "amateur", "amazing", "among", "amount", "amused", "analyst", "analyze", "anchor", "ancient", "anger", "angle", "angry", "animal", "ankle", "announce", "annual", "another", "answer", "anxiety", "apart", "apology", "appear", "apple", "approve", "april", "arctic", "arena", "argue", "armed", "armor", "around", "arrange", "arrest", "arrive", "arrow", "artist", "artwork", "aspect", "assault", "asset", "assist", "assume", "asthma", "athlete", "athletic", "atlas", "attack", "attend", "attitude", "attorney", "attract", "auction", "audit", "august", "author", "autumn", "average", "avocado", "avoid", "awake", "aware", "awesome", "awful", "awkward", "bachelor", "bacon", "badge", "balance", "balcony", "bamboo", "banana", "banner", "barely", "bargain", "barrel", "basic", "basket", "battle", "beach", "beauty", "because", "become", "before", "begin", "behave", "behind", "believe", "below", "bench", "benefit", "betray", "better", "between", "beyond", "bicycle", "biology", "birth", "bitter", "black", "blade", "blame", "blanket", "blast", "bleak", "bless", "blind", "blood", "blossom", "blouse", "board", "bonus", "boost", "border", "boring", "borrow", "bottom", "bounce", "bracket", "brain", "brand", "brass", "brave", "bread", "breeze", "brick", "bridge", "brief", "bright", "bring", "brisk", "broccoli", "broken", "bronze", "broom", "brother", "brown", "brush", "bubble", "buddy", "budget", "buffalo", "build", "bullet", "bundle", "bunker", "burden", "burger", "burst", "business", "butter", "buyer", "cabbage", "cabin", "cable", "cactus", "camera", "canal", "cancel", "candy", "cannon", "canoe", "canvas", "canyon", "capable", "capital", "captain", "carbon", "cargo", "carpet", "carry", "casino", "castle", "casual", "catalog", "catch", "category", "cattle", "caught", "cause", "caution", "ceiling", "celery", "cement", "census", "century", "ceramic", "certain", "chair", "chalk", "champion", "change", "chaos", "chapter", "charge", "cheap", "check", "cheese", "cherry", "chest", "chicken", "chief", "child", "chimney", "choice", "choose", "chronic", "chuckle", "chunk", "churn", "cigar", "cinnamon", "circle", "citizen", "civil", "claim", "clarify", "clean", "clerk", "clever", "click", "client", "cliff", "climb", "clinic", "clock", "clone", "close", "cloth", "cloud", "clump", "cluster", "clutch", "coach", "coast", "coconut", "coffee", "collect", "color", "column", "combine", "comfort", "comic", "common", "company", "concert", "conduct", "confirm", "connect", "consist", "console", "construct", "contact", "contain", "contest", "context", "continue", "control", "convey", "convince", "copper", "coral", "correct", "cotton", "couch", "country", "couple", "course", "cousin", "cover", "coyote", "crack", "cradle", "craft", "crane", "crash", "crater", "crawl", "crazy", "cream", "credit", "creek", "cricket", "crime", "crisp", "critic", "cross", "crouch", "crowd", "crown", "crucial", "cruel", "cruise", "crumble", "crunch", "crush", "crystal", "culture", "cupboard", "curious", "current", "curve", "cushion", "custom", "cycle", "damage", "dance", "danger", "daring", "daughter", "debate", "debris", "decade", "december", "decide", "decline", "decorate", "decrease", "defense", "define", "degree", "delay", "deliver", "demand", "demise", "depart", "depend", "deposit", "depth", "deputy", "derive", "describe", "desert", "design", "despair", "destroy", "detail", "detect", "develop", "device", "devote", "diagram", "diamond", "diary", "diesel", "differ", "digital", "dignity", "dilemma", "dinner", "dinosaur", "direct", "disagree", "discover", "disease", "dismiss", "disorder", "display", "distance", "divide", "divine", "divorce", "dizzy", "doctor", "document", "dolphin", "domain", "donate", "donkey", "donor", "double", "draft", "dragon", "drama", "drastic", "dream", "dress", "drift", "drill", "drink", "drive", "dwarf", "dynamic", "eager", "eagle", "early", "earth", "easily", "ecology", "economy", "educate", "effort", "eight", "either", "elbow", "elder", "electric", "elegant", "element", "elephant", "elevator", "elite", "embark", "embody", "embrace", "emerge", "emotion", "employ", "empower", "empty", "enable", "enact", "endless", "endorse", "enemy", "energy", "enforce", "engage", "engine", "enhance", "enjoy", "enlist", "enough", "enrich", "enroll", "ensure", "enter", "entire", "entry", "envelope", "episode", "equal", "equip", "erase", "erupt", "escape", "essay", "estate", "eternal", "ethics", "evidence", "evoke", "evolve", "exact", "example", "excess", "exchange", "excite", "exclude", "excuse", "execute", "exercise", "exhaust", "exhibit", "exile", "exist", "exotic", "expand", "expect", "expire", "explain", "expose", "express", "extend", "extra", "eyebrow", "fabric", "faculty", "faint", "faith", "false", "family", "famous", "fancy", "fantasy", "fashion", "fatal", "father", "fatigue", "fault", "favorite", "feature", "february", "federal", "festival", "fetch", "fever", "fiber", "fiction", "field", "figure", "final", "finger", "finish", "first", "fiscal", "fitness", "flame", "flash", "flavor", "flight", "float", "flock", "floor", "flower", "fluid", "flush", "focus", "follow", "force", "forest", "forget", "fortune", "forum", "forward", "fossil", "foster", "found", "fragile", "frame", "frequent", "fresh", "friend", "fringe", "front", "frost", "frown", "frozen", "fruit", "funny", "furnace", "future", "gadget", "galaxy", "gallery", "garage", "garbage", "garden", "garlic", "garment", "gather", "gauge", "general", "genius", "genre", "gentle", "genuine", "gesture", "ghost", "giant", "giggle", "ginger", "giraffe", "glance", "glare", "glass", "glide", "glimpse", "globe", "gloom", "glory", "glove", "goblin", "goose", "gorilla", "gospel", "gossip", "govern", "grace", "grain", "grant", "grape", "grass", "gravity", "great", "green", "grief", "grocery", "group", "grunt", "guard", "guess", "guide", "guilt", "guitar", "habit", "hammer", "hamster", "happy", "harbor", "harsh", "harvest", "hazard", "health", "heart", "heavy", "hedgehog", "height", "hello", "helmet", "hidden", "history", "hobby", "hockey", "holiday", "hollow", "honey", "horse", "hospital", "hotel", "hover", "human", "humble", "humor", "hundred", "hungry", "hurdle", "hurry", "husband", "hybrid", "identify", "ignore", "illegal", "illness", "image", "imitate", "immense", "immune", "impact", "impose", "improve", "impulse", "include", "income", "increase", "index", "indicate", "indoor", "industry", "infant", "inflict", "inform", "inhale", "inherit", "initial", "inject", "injury", "inmate", "inner", "innocent", "input", "inquiry", "insane", "insect", "inside", "inspire", "install", "intact", "interest", "invest", "invite", "involve", "island", "isolate", "issue", "ivory", "jacket", "jaguar", "jealous", "jeans", "jelly", "jewel", "journey", "judge", "juice", "jumble", "junction", "kangaroo", "ketchup", "kidney", "kingdom", "kitchen", "kittens", "knife", "knock", "label", "labor", "ladder", "language", "laptop", "large", "later", "latin", "laugh", "laundry", "leader", "learn", "lease", "least", "leave", "lecture", "legal", "legend", "lemon", "length", "leopard", "lesson", "letter", "level", "liberty", "library", "license", "light", "limit", "liquid", "little", "lizard", "lobster", "local", "logic", "lonely", "lottery", "lounge", "loyal", "lucky", "luggage", "lumber", "lunar", "lunch", "luxury", "lyrics", "machine", "magic", "magnet", "maize", "major", "mammal", "manage", "mandate", "mango", "mansion", "manual", "maple", "marble", "march", "margin", "marine", "market", "marriage", "master", "match", "material", "matrix", "matter", "maximum", "meadow", "measure", "mechanic", "medal", "media", "melody", "member", "memory", "mention", "mercy", "merge", "merit", "merry", "message", "metal", "method", "middle", "midnight", "million", "mimic", "mineral", "minimal", "minimum", "minor", "minute", "miracle", "mirror", "misery", "mistake", "mixed", "mixture", "mobile", "model", "modify", "moment", "monitor", "monster", "month", "moral", "morning", "mosquito", "mother", "motion", "motor", "mountain", "mouse", "movie", "muffin", "multiply", "muscle", "museum", "mushroom", "music", "mutual", "myself", "mystery", "naive", "napkin", "narrow", "nasty", "nation", "nature", "negative", "neglect", "neither", "nephew", "nerve", "network", "neutral", "never", "night", "noble", "noise", "nominee", "noodle", "normal", "north", "notable", "nothing", "notice", "novel", "nuclear", "number", "nurse", "oasis", "object", "oblige", "obscure", "observe", "obtain", "obvious", "occur", "ocean", "october", "offer", "office", "often", "olive", "olympic", "onion", "online", "opera", "opinion", "oppose", "option", "orange", "orbit", "orchard", "order", "ordinary", "organ", "orient", "original", "orphan", "ostrich", "other", "outdoor", "outer", "output", "outside", "owner", "oxygen", "oyster", "ozone", "paddle", "palace", "panda", "panel", "panic", "panther", "paper", "parade", "parent", "parrot", "party", "patch", "patient", "patrol", "pattern", "pause", "payment", "peace", "peanut", "pepper", "perfect", "permit", "person", "phone", "photo", "phrase", "physical", "piano", "picnic", "picture", "piece", "pigeon", "pilot", "pioneer", "pistol", "pitch", "pizza", "place", "planet", "plastic", "plate", "please", "pledge", "pluck", "plunge", "point", "polar", "police", "popular", "portion", "position", "possible", "potato", "pottery", "pouch", "pound", "powder", "power", "practice", "praise", "predict", "prefer", "prepare", "present", "pretty", "prevent", "price", "pride", "primary", "print", "priority", "prison", "private", "prize", "problem", "process", "produce", "profit", "program", "project", "promote", "proof", "property", "prose", "protest", "protocol", "provide", "public", "pudding", "pulse", "pumpkin", "punch", "pupil", "puppy", "purchase", "purity", "purple", "purpose", "pursue", "puzzle", "pyramid", "quality", "quantum", "quarter", "question", "quick", "quite", "quote", "rabbit", "raccoon", "racket", "radar", "radio", "raise", "rally", "ranch", "random", "range", "rapid", "rather", "raven", "razor", "ready", "reason", "rebel", "rebuild", "recall", "receive", "recipe", "record", "reduce", "reflect", "reform", "refuse", "region", "regret", "regular", "reject", "relax", "release", "relief", "remain", "remark", "remind", "remove", "render", "renew", "rental", "repair", "repeat", "replace", "report", "require", "rescue", "resemble", "resist", "resource", "response", "result", "resume", "retire", "retreat", "return", "reunion", "reveal", "review", "reward", "rhythm", "ribbon", "ridge", "rifle", "right", "rigid", "ripen", "ritual", "rival", "river", "roast", "robot", "robust", "rocket", "romance", "rookie", "rotate", "rough", "round", "route", "royal", "rubber", "saddle", "sadness", "salad", "salmon", "salute", "sample", "satisfy", "satoshi", "sauce", "sausage", "scale", "scare", "scatter", "scene", "scheme", "school", "science", "scissors", "scorpion", "scout", "screen", "script", "search", "season", "second", "secret", "section", "sector", "secure", "segment", "select", "seminar", "senior", "sense", "sentence", "series", "service", "session", "settle", "setup", "seven", "shadow", "shaft", "shallow", "share", "shell", "sheriff", "shield", "shift", "shine", "shiver", "shock", "shoot", "short", "shoulder", "shove", "shrimp", "shrug", "shuffle", "sibling", "siege", "sight", "silent", "silly", "silver", "similar", "simple", "since", "siren", "sister", "situate", "skate", "sketch", "skill", "skirt", "skull", "slack", "slang", "slate", "slave", "sleep", "sleeve", "slide", "slight", "slogan", "slush", "small", "smart", "smile", "smoke", "smooth", "snack", "snake", "sniff", "soccer", "social", "solar", "soldier", "solid", "solution", "solve", "someone", "sorry", "sound", "source", "south", "space", "spare", "spatial", "spawn", "speak", "special", "speed", "spell", "spend", "sphere", "spice", "spider", "spike", "spirit", "split", "spoil", "sport", "spray", "spread", "spring", "square", "squeeze", "squirrel", "stable", "stadium", "staff", "stage", "stamp", "staple", "start", "state", "steak", "steel", "stick", "still", "sting", "stock", "stomach", "stone", "stool", "story", "stove", "strategy", "street", "strike", "strong", "struggle", "student", "stuff", "stumble", "style", "subject", "submit", "subway", "success", "sugar", "suggest", "summer", "sunny", "sunset", "super", "supply", "supreme", "surface", "surge", "surprise", "surround", "survey", "suspect", "sustain", "swallow", "swamp", "swear", "sweet", "swift", "swing", "switch", "sword", "symbol", "symptom", "syndrome", "system", "table", "tackle", "tactic", "tadpole", "tail", "talent", "target", "taste", "tattle", "taught", "temper", "temple", "tennis", "thank", "theme", "theory", "there", "thing", "this", "thought", "three", "thrive", "throw", "thumb", "thunder", "ticket", "tiger", "timber", "tiny", "tired", "tissue", "title", "toast", "tobacco", "today", "toddler", "together", "toilet", "token", "tomato", "tomorrow", "tongue", "tonight", "tooth", "topic", "topple", "torch", "tornado", "tortoise", "total", "tourist", "toward", "tower", "track", "trade", "traffic", "tragic", "train", "transfer", "travel", "treat", "trend", "trial", "tribe", "trick", "trigger", "trophy", "trouble", "truck", "truly", "trumpet", "trust", "truth", "tuition", "tumble", "tunnel", "turkey", "turtle", "twelve", "twist", "typical", "umbrella", "unable", "unaware", "uncle", "uncover", "under", "unfair", "unfold", "unhappy", "uniform", "unique", "universe", "unknown", "unlock", "until", "unusual", "unveil", "update", "upgrade", "uphold", "uplift", "upper", "upset", "urban", "usage", "useful", "useless", "usual", "utility", "vacant", "vacuum", "vague", "valid", "valley", "valve", "vanish", "vapor", "variable", "vault", "vegetable", "vehicle", "velvet", "vendor", "venture", "venue", "verify", "version", "vessel", "veteran", "viable", "vibrant", "vicious", "victory", "video", "village", "vintage", "violin", "virtual", "virus", "visit", "visual", "vital", "vivid", "vocal", "voice", "volcano", "volume", "voyage", "wagon", "walnut", "warfare", "warrior", "waste", "water", "wealth", "weapon", "weasel", "weather", "wedding", "weekend", "weird", "welcome", "whale", "wheat", "wheel", "where", "whip", "whisper", "width", "window", "winner", "winter", "wisdom", "witness", "woman", "wonder", "world", "worry", "worth", "wrist", "write", "wrong", "yellow", "young", "youth", "zebra"
];

// Core game state
class GameState {
    constructor() {
        this.currentWord = "";
        this.revealedLetters = 4;
        this.guessedLetters = [];
        this.numPlayers = 1;
        this.currentPlayer = 0;
        this.showWordLength = false;
        this.gameLength = 12;
        this.players = [];
        this.gameActive = true;
        this.keyboardLocked = false;
        this.playerToggleSettings = [];
        this.toggleUsedThisRound = false;
        this.helpUsedCount = 0;
        this.wrongGuessCount = 0;
        this.gameStartTime = Date.now();
        this.currentPlayerScore = null;
        this.currentLeaderboardView = 'local';
        this.scoreSubmittedLocally = false;
        this.scoreSubmittedGlobally = false;
        
        // Word selection optimization
        this.recentlyUsedWords = [];
        this.wordPool = [];
        this.poolIndex = 0;
        this.sessionWordStats = new Map();
        
        // Entropy for randomization
        this.entropyPool = [];
        this.lastMouseTime = 0;
        this.lastKeyTime = 0;
        this.entropyCounter = 0;
    }
    
    reset() {
        this.currentWord = "";
        this.guessedLetters = [];
        this.toggleUsedThisRound = false;
        this.wrongGuessCount = 0;
    }
    
    resetGame() {
        this.players = [];
        this.currentPlayer = 0;
        this.gameActive = true;
        this.gameStartTime = Date.now();
        this.scoreSubmittedLocally = false;
        this.scoreSubmittedGlobally = false;
        this.helpUsedCount = 0;
    }
}

// Global game state instance
const gameState = new GameState();

/* =========================================== */
/* SECURITY & ENCRYPTION UTILITIES */
/* =========================================== */

class SecurityUtils {
    // XSS Protection - HTML escape function
    static escapeHTML(text) {
        if (typeof text !== 'string') return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;')
            .replace(/`/g, '&#x60;')
            .replace(/=/g, '&#x3D;');
    }
    
    // Advanced XSS protection - catches dangerous patterns
    static sanitizeForDisplay(userText) {
        if (typeof userText !== 'string') {
            userText = String(userText);
        }
        
        // Remove dangerous URL schemes
        let sanitized = userText
            .replace(/javascript\s*:/gi, 'blocked-js:')
            .replace(/vbscript\s*:/gi, 'blocked-vbs:')
            .replace(/data\s*:/gi, 'blocked-data:')
            .replace(/file\s*:/gi, 'blocked-file:');
        
        // Remove dangerous event handlers
        sanitized = sanitized
            .replace(/\bon\w+\s*=/gi, 'blocked-event=')
            .replace(/\bstyle\s*=/gi, 'blocked-style=');
        
        // Remove dangerous HTML patterns
        sanitized = sanitized
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[blocked-script]')
            .replace(/<iframe\b[^>]*>/gi, '[blocked-iframe]')
            .replace(/<object\b[^>]*>/gi, '[blocked-object]');
        
        return this.escapeHTML(sanitized);
    }
    
    // Create safe text elements
    static createSafeTextElement(text, className = '') {
        const element = document.createElement('span');
        if (className) element.className = className;
        element.textContent = this.sanitizeForDisplay(text);
        return element;
    }
    
    // URL sanitization
    static sanitizeURL(url) {
        if (typeof url !== 'string') return '#';
        
        const safeSchemes = ['http:', 'https:', 'mailto:', 'tel:'];
        
        try {
            const urlObj = new URL(url, window.location.origin);
            if (safeSchemes.includes(urlObj.protocol)) {
                return urlObj.href;
            }
        } catch (e) {
            // Invalid URL
        }
        
        return '#';
    }
}

// Local Storage Encryption
class LocalStorageEncryption {
    constructor() {
        this.keyName = 'bipardy-crypto-key';
    }

    async generateKey() {
        return await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    }

    async getOrCreateKey() {
        const stored = localStorage.getItem(this.keyName);
        if (stored) {
            try {
                const keyData = JSON.parse(stored);
                return await crypto.subtle.importKey('jwk', keyData, 'AES-GCM', true, ['encrypt', 'decrypt']);
            } catch (error) {
                console.warn('Error importing stored key, generating new one:', error);
            }
        }
        
        const key = await this.generateKey();
        const keyData = await crypto.subtle.exportKey('jwk', key);
        localStorage.setItem(this.keyName, JSON.stringify(keyData));
        return key;
    }

    async encrypt(data) {
        try {
            const key = await this.getOrCreateKey();
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encodedData = new TextEncoder().encode(JSON.stringify(data));
            
            const encryptedData = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encodedData
            );
            
            return {
                iv: Array.from(iv),
                data: Array.from(new Uint8Array(encryptedData))
            };
        } catch (error) {
            console.error('Encryption failed:', error);
            return null;
        }
    }

    async decrypt(encryptedData) {
        try {
            const key = await this.getOrCreateKey();
            const iv = new Uint8Array(encryptedData.iv);
            const data = new Uint8Array(encryptedData.data);
            
            const decryptedData = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                data
            );
            
            const decodedData = new TextDecoder().decode(decryptedData);
            return JSON.parse(decodedData);
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }
}

// Global storage encryption instance
const storageEncryption = new LocalStorageEncryption();

/* =========================================== */
/* UTILITY FUNCTIONS */
/* =========================================== */

class GameUtils {
    // Consolidated validation functions
    static sanitizeName(input) {
        if (typeof input !== 'string') return '';
        return SecurityUtils.sanitizeForDisplay(input).replace(/[^A-Z0-9]/gi, '').toUpperCase().substring(0, 12);
    }
    
    static validateScore(score) {
        return typeof score === 'number' && score >= 0 && score <= 50000;
    }
    
    static validatePlayerName(name) {
        return typeof name === 'string' && /^[A-Z0-9]{3,12}$/i.test(name);
    }
    
    // Entropy collection for better randomization
    static collectEntropy() {
        const now = Date.now();
        gameState.entropyPool.push(now % 1000);
        
        if (gameState.entropyPool.length > 50) {
            gameState.entropyPool = gameState.entropyPool.slice(-50);
        }
        
        gameState.entropyCounter++;
    }
    
    // Enhanced random selection with entropy
    static getEnhancedRandom() {
        this.collectEntropy();
        const entropy = gameState.entropyPool.reduce((sum, val) => sum + val, 0);
        return (Math.random() + (entropy % 1000) / 1000) % 1;
    }
}

/* =========================================== */
/* WORD SELECTION ENGINE */
/* =========================================== */

class WordSelector {
    static shuffleWordPool() {
        gameState.wordPool = [...bip39Words];
        
        // Enhanced shuffle with entropy
        for (let i = gameState.wordPool.length - 1; i > 0; i--) {
            const j = Math.floor(GameUtils.getEnhancedRandom() * (i + 1));
            [gameState.wordPool[i], gameState.wordPool[j]] = [gameState.wordPool[j], gameState.wordPool[i]];
        }
        
        gameState.poolIndex = 0;
    }
    
    static selectRandomWord() {
        // Initialize or refill word pool if needed
        if (gameState.wordPool.length === 0 || gameState.poolIndex >= gameState.wordPool.length) {
            this.shuffleWordPool();
        }
        
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            const candidate = gameState.wordPool[gameState.poolIndex];
            gameState.poolIndex++;
            
            // Check if word hasn't been used recently
            if (!gameState.recentlyUsedWords.includes(candidate)) {
                // Track usage
                this.trackWordUsage(candidate);
                return candidate;
            }
            
            attempts++;
            
            // If we've exhausted the pool, reshuffle
            if (gameState.poolIndex >= gameState.wordPool.length) {
                this.shuffleWordPool();
            }
        }
        
        // Fallback: use any word from pool
        const fallback = gameState.wordPool[Math.floor(GameUtils.getEnhancedRandom() * gameState.wordPool.length)];
        this.trackWordUsage(fallback);
        return fallback;
    }
    
    static trackWordUsage(word) {
        // Add to recent words
        gameState.recentlyUsedWords.unshift(word);
        if (gameState.recentlyUsedWords.length > 210) {
            gameState.recentlyUsedWords = gameState.recentlyUsedWords.slice(0, 210);
        }
        
        // Update session stats
        const count = gameState.sessionWordStats.get(word) || 0;
        gameState.sessionWordStats.set(word, count + 1);
    }
}

/* =========================================== */
/* GAME LOGIC ENGINE */
/* =========================================== */

class GameEngine {
    static initializeGame() {
        // Initialize UI controller
        uiController.init();
        
        // Setup timer
        const timerElements = {
            timerContainer: uiController.get('timerContainer'),
            timerProgress: uiController.get('timerProgress'),
            timerBonus: uiController.get('timerBonus')
        };
        
        const timerCallbacks = {
            onExpire: () => this.handleTimerExpire(),
            onUpdate: (bonus, progress) => this.handleTimerUpdate(bonus, progress)
        };
        
        timerManager.init(timerElements, timerCallbacks);
        
        // Setup lazy loading
        lazyLoader.init();
        lazyLoader.setupInteractionBasedLoading();
        lazyLoader.preloadCriticalResources();
        
        // Setup event listeners through UI controller
        this.setupEventListeners();
        
        // Initialize players
        this.setupPlayers(1);
        
        // Setup PWA features
        this.setupPWA();
        
        // Start first word
        this.startNewWord();
    }
    
    static setupEventListeners() {
        // Use UI controller's optimized event system
        uiController.on('keyPressed', (e) => this.handleKeyPress(e.detail.key));
        uiController.on('playerCountChanged', (e) => this.setupPlayers(e.detail.count));
        uiController.on('tabChanged', (e) => this.switchLeaderboardTab(e.detail.type));
        uiController.on('shareRequested', (e) => this.handleShare(e.detail.type));
        uiController.on('playerNameChanged', (e) => this.handlePlayerNameChange(e.detail.value));
        
        // Additional game-specific events
        document.addEventListener('click', (e) => {
            GameUtils.collectEntropy();
            
            if (e.target.id === 'helpButton') this.showHint();
            if (e.target.id === 'skipButton') this.skipWord();
            if (e.target.id === 'submitButton') this.submitGuess();
            if (e.target.id === 'continueButton') this.startNewGame();
            if (e.target.id === 'submitLocalBtn') this.submitScoreLocal();
            if (e.target.id === 'submitGlobalBtn') this.submitScoreGlobal();
        });
        
        // Keyboard events with debouncing
        let keyTimeout;
        document.addEventListener('keydown', (e) => {
            GameUtils.collectEntropy();
            
            if (keyTimeout) clearTimeout(keyTimeout);
            keyTimeout = setTimeout(() => {
                if (e.key === 'Enter') this.submitGuess();
                if (e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                    this.showHint();
                }
                if (e.key >= 'a' && e.key <= 'z') {
                    this.handleKeyPress(e.key.toUpperCase());
                }
            }, 50);
        });
        
        // Mouse movement for entropy
        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - gameState.lastMouseTime > 100) {
                gameState.entropyPool.push((e.clientX + e.clientY) % 1000);
                gameState.lastMouseTime = now;
            }
        });
    }
    
    static setupPlayers(count) {
        gameState.numPlayers = count;
        gameState.players = [];
        gameState.playerToggleSettings = [];
        
        for (let i = 0; i < count; i++) {
            gameState.players.push({
                name: `Player ${i + 1}`,
                score: 0,
                streak: 0,
                bestStreak: 0,
                correctWords: 0
            });
            gameState.playerToggleSettings.push(false);
        }
        
        gameState.currentPlayer = 0;
        this.updateScoreDisplay();
        this.updatePlayerSelector();
    }
    
    static startNewWord() {
        if (!gameState.gameActive) return;
        
        gameState.reset();
        gameState.currentWord = WordSelector.selectRandomWord();
        
        // Initialize revealed letters based on player settings
        gameState.showWordLength = gameState.playerToggleSettings[gameState.currentPlayer];
        
        this.displayWord();
        this.updateHelpButtonText();
        
        // Start timer
        timerManager.startTimer();
        
        this.enableAllKeys();
    }
    
    static displayWord() {
        const word = gameState.currentWord;
        const guessed = gameState.guessedLetters;
        const showLength = gameState.showWordLength;
        
        // Use UI controller's optimized letter display
        uiController.updateLetterDisplay(word, guessed, showLength);
    }
    
    static handleKeyPress(key) {
        if (!gameState.gameActive || gameState.keyboardLocked) return;
        if (gameState.guessedLetters.includes(key)) return;
        
        this.makeGuess(key);
    }
    
    static async makeGuess(key) {
        if (!gameState.gameActive) return;
        
        gameState.guessedLetters.push(key);
        const keyElement = uiController.get('keys').find(k => k.getAttribute('data-key') === key);
        
        if (gameState.currentWord.toUpperCase().includes(key)) {
            // Correct guess
            keyElement?.classList.add('correct');
            this.displayWord();
            
            // Check if word is complete
            const allLettersGuessed = [...gameState.currentWord.toUpperCase()].every(
                letter => gameState.guessedLetters.includes(letter) || gameState.showWordLength
            );
            
            if (allLettersGuessed) {
                await this.handleCorrectWord();
            }
        } else {
            // Incorrect guess
            keyElement?.classList.add('incorrect');
            gameState.wrongGuessCount++;
            
            if (gameState.wrongGuessCount >= 2) {
                timerManager.stopTimer();
                gameState.players[gameState.currentPlayer].streak = 0;
                await this.nextPlayer();
            }
        }
    }
    
    static async handleCorrectWord() {
        const currentPlayer = gameState.players[gameState.currentPlayer];
        
        // Calculate score using web worker if available
        const scoreData = {
            isCorrect: true,
            streak: currentPlayer.streak,
            timerBonus: timerManager.getCurrentBonus(),
            wordLength: gameState.currentWord.length,
            helpUsed: gameState.helpUsedCount > 0
        };
        
        let finalPoints = 0;
        let bonusText = '';
        
        // Try to use web worker for score calculation
        try {
            if (typeof Worker !== 'undefined') {
                const worker = new Worker('./js/workers/score-worker.js');
                const scoreResult = await this.calculateScoreWithWorker(worker, scoreData);
                finalPoints = scoreResult.total;
                
                if (scoreResult.streakBonus > 0) {
                    bonusText += ` +${scoreResult.streakBonus} streak bonus`;
                }
                if (scoreResult.timerBonus > 0) {
                    bonusText += ` +${scoreResult.timerBonus} timer bonus`;
                }
                if (scoreResult.helpPenalty > 0) {
                    bonusText += ` -${scoreResult.helpPenalty} help penalty`;
                }
                
                worker.terminate();
            } else {
                // Fallback calculation
                finalPoints = this.calculateScoreFallback(scoreData);
            }
        } catch (error) {
            console.warn('Worker calculation failed, using fallback:', error);
            finalPoints = this.calculateScoreFallback(scoreData);
        }
        
        // Update player stats
        currentPlayer.score += finalPoints;
        currentPlayer.streak++;
        currentPlayer.correctWords++;
        currentPlayer.bestStreak = Math.max(currentPlayer.bestStreak, currentPlayer.streak);
        
        // Stop timer
        timerManager.stopTimer();
        
        // Show success message
        const message = `Correct! +${finalPoints} points${bonusText}`;
        uiController.updateTextContent('message', message);
        uiController.updateClass('message', 'success', true);
        
        // Update display
        this.updateScoreDisplay();
        
        // Check if game is complete
        if (this.isGameComplete()) {
            await this.endGame();
        } else {
            await this.nextPlayer();
        }
    }
    
    static calculateScoreWithWorker(worker, scoreData) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                worker.terminate();
                reject(new Error('Worker timeout'));
            }, 1000);
            
            worker.onmessage = (e) => {
                clearTimeout(timeout);
                if (e.data.type === 'scoreResult') {
                    resolve(e.data.result);
                } else if (e.data.type === 'error') {
                    reject(new Error(e.data.error));
                }
            };
            
            worker.onerror = (error) => {
                clearTimeout(timeout);
                reject(error);
            };
            
            worker.postMessage({
                type: 'calculateScore',
                data: { id: Date.now(), ...scoreData }
            });
        });
    }
    
    static calculateScoreFallback(scoreData) {
        if (!scoreData.isCorrect) return 0;
        
        const baseScore = 100;
        const streakBonus = Math.min(scoreData.streak * 50, 500);
        const timerBonus = Math.round(scoreData.timerBonus);
        const helpPenalty = scoreData.helpUsed ? 10 : 0;
        
        return Math.max(0, baseScore + streakBonus + timerBonus - helpPenalty);
    }
    
    static showHint() {
        if (!gameState.gameActive || gameState.keyboardLocked) return;
        
        timerManager.stopTimer();
        
        const helpCost = gameState.helpUsedCount === 0 ? 0 : 10;
        const currentPlayer = gameState.players[gameState.currentPlayer];
        
        if (currentPlayer.score < helpCost) {
            uiController.updateTextContent('message', `Need ${helpCost} points for hint!`);
            uiController.updateClass('message', 'error', true);
            return;
        }
        
        // Reveal a random letter
        const word = gameState.currentWord.toUpperCase();
        const unrevealedLetters = [...word].filter(letter => !gameState.guessedLetters.includes(letter));
        
        if (unrevealedLetters.length > 0) {
            const randomLetter = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)];
            gameState.guessedLetters.push(randomLetter);
            
            // Update display
            this.displayWord();
            
            // Apply cost
            currentPlayer.score -= helpCost;
            gameState.helpUsedCount++;
            
            this.updateScoreDisplay();
            this.updateHelpButtonText();
            
            uiController.updateTextContent('message', `Hint revealed! ${helpCost > 0 ? `-${helpCost} points` : 'FREE'}`);
            uiController.updateClass('message', 'help', true);
        }
    }
    
    static skipWord() {
        if (!gameState.gameActive) return;
        
        timerManager.stopTimer();
        
        // Show the full word
        for (const letter of gameState.currentWord.toUpperCase()) {
            if (!gameState.guessedLetters.includes(letter)) {
                gameState.guessedLetters.push(letter);
            }
        }
        
        this.displayWord();
        
        uiController.updateTextContent('message', `Skipped: "${gameState.currentWord}"`);
        uiController.updateClass('message', 'skip', true);
        
        // Reset streak
        gameState.players[gameState.currentPlayer].streak = 0;
        
        setTimeout(() => this.nextPlayer(), 2000);
    }
    
    static submitGuess() {
        const currentGuess = gameState.guessedLetters.join('').toLowerCase();
        const currentWord = gameState.currentWord.toLowerCase();
        
        if (currentGuess === currentWord) {
            this.handleCorrectWord();
        }
    }
    
    static async nextPlayer() {
        if (gameState.numPlayers === 1) {
            // Single player - continue to next word
            setTimeout(() => this.startNewWord(), 1500);
            return;
        }
        
        // Multiplayer - next player
        gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.numPlayers;
        
        if (gameState.currentPlayer === 0) {
            // Completed a full round
            if (this.isGameComplete()) {
                await this.endGame();
                return;
            }
        }
        
        this.updateScoreDisplay();
        setTimeout(() => this.startNewWord(), 1500);
    }
    
    static isGameComplete() {
        // Check if we've reached the target number of words per player
        const totalWordsNeeded = gameState.gameLength * gameState.numPlayers;
        const totalWordsPlayed = gameState.players.reduce((sum, p) => sum + p.correctWords, 0);
        return totalWordsPlayed >= totalWordsNeeded;
    }
    
    static async endGame() {
        gameState.gameActive = false;
        timerManager.stopTimer();
        
        // Calculate final stats using web worker if available
        let finalStats;
        try {
            if (typeof Worker !== 'undefined') {
                const worker = new Worker('./js/workers/score-worker.js');
                finalStats = await this.calculateFinalStatsWithWorker(worker);
                worker.terminate();
            } else {
                finalStats = this.calculateFinalStatsFallback();
            }
        } catch (error) {
            console.warn('Worker stats calculation failed:', error);
            finalStats = this.calculateFinalStatsFallback();
        }
        
        // Show end screen
        this.displayGameEndScreen(finalStats);
        
        // Initialize leaderboard with lazy loading
        await this.initializeLeaderboard();
    }
    
    static calculateFinalStatsWithWorker(worker) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                worker.terminate();
                reject(new Error('Worker timeout'));
            }, 2000);
            
            worker.onmessage = (e) => {
                clearTimeout(timeout);
                if (e.data.type === 'finalStatsResult') {
                    resolve(e.data.result);
                } else if (e.data.type === 'error') {
                    reject(new Error(e.data.error));
                }
            };
            
            worker.postMessage({
                type: 'calculateFinalStats',
                data: {
                    id: Date.now(),
                    players: gameState.players,
                    gameLength: gameState.gameLength,
                    totalTime: Date.now() - gameState.gameStartTime
                }
            });
        });
    }
    
    static calculateFinalStatsFallback() {
        const results = gameState.players.map((player, index) => ({
            name: player.name,
            score: player.score,
            correctAnswers: player.correctWords,
            accuracy: gameState.gameLength > 0 ? Math.round(player.correctWords / gameState.gameLength * 100) : 0,
            averageTimePerWord: player.correctWords > 0 ? Math.round((Date.now() - gameState.gameStartTime) / player.correctWords) : 0,
            bestStreak: player.bestStreak,
            rank: index + 1
        }));
        
        return results.sort((a, b) => b.score - a.score);
    }
    
    static displayGameEndScreen(finalStats) {
        const winner = finalStats[0];
        
        uiController.updateTextContent('gameEndTitle', 'Game Complete!');
        uiController.updateTextContent('winnerName', `🏆 ${winner.name}`);
        
        const statsHtml = finalStats.map(player => `
            <div class="player-final-stats">
                <span class="rank">#${player.rank}</span>
                <span class="name">${GameUtils.sanitizeName(player.name)}</span>
                <span class="score">${player.score}</span>
                <span class="accuracy">${player.accuracy}%</span>
            </div>
        `).join('');
        
        uiController.updateHTML('finalStats', statsHtml);
        uiController.showElement('gameEndScreen');
        
        // Store current player score for leaderboard
        gameState.currentPlayerScore = {
            name: winner.name,
            score: winner.score,
            accuracy: winner.accuracy,
            gameLength: gameState.gameLength,
            date: new Date().toISOString()
        };
    }
    
    static async initializeLeaderboard() {
        try {
            // Lazy load leaderboard module
            const virtualLeaderboard = await lazyLoader.loadLeaderboard();
            if (virtualLeaderboard) {
                virtualLeaderboard.init('leaderboardList', {
                    itemHeight: 60,
                    visibleCount: 10,
                    bufferSize: 3
                });
                
                // Load initial data
                this.loadLocalLeaderboard(virtualLeaderboard);
            }
        } catch (error) {
            console.error('Failed to initialize leaderboard:', error);
        }
    }
    
    static async handleShare(type) {
        if (!gameState.currentPlayerScore) return;
        
        try {
            // Lazy load social sharing
            const socialSharing = await lazyLoader.loadSocialSharing();
            if (!socialSharing) return;
            
            await socialSharing.init();
            
            const shareData = {
                playerName: gameState.currentPlayerScore.name,
                score: gameState.currentPlayerScore.score,
                rank: 1, // Would be calculated from leaderboard
                gameLength: gameState.currentPlayerScore.gameLength,
                accuracy: gameState.currentPlayerScore.accuracy
            };
            
            switch (type) {
                case 'x':
                    await socialSharing.shareOnX(shareData);
                    break;
                case 'nostr-web':
                    await socialSharing.shareOnNostrWeb(shareData);
                    break;
                case 'nostr-native':
                    const result = await socialSharing.copyNostrWithScreenshot(shareData);
                    uiController.updateTextContent('message', 'Content copied to clipboard!');
                    break;
                case 'download':
                    await socialSharing.downloadScreenshot(shareData);
                    break;
            }
        } catch (error) {
            console.error('Share failed:', error);
            uiController.updateTextContent('message', 'Share failed. Please try again.');
            uiController.updateClass('message', 'error', true);
        }
    }
    
    // PWA Setup
    static setupPWA() {
        let deferredPrompt;
        const installPrompt = uiController.get('installPrompt');
        const installBtn = uiController.get('installBtn');
        const laterBtn = uiController.get('laterBtn');

        // Language detection for PWA popup
        const getLanguageStrings = () => {
            const userLang = navigator.language || navigator.userLanguage || 'en';
            const langCode = userLang.split('-')[0].toLowerCase();
            
            const translations = {
                'en': { title: 'Install BIPardy', description: 'Install this app on your home screen for the best experience!', install: 'Install', later: 'Later' },
                'de': { title: 'BIPardy installieren', description: 'Installieren Sie diese App auf Ihrem Startbildschirm für die beste Erfahrung!', install: 'Installieren', later: 'Später' },
                'es': { title: 'Instalar BIPardy', description: '¡Instala esta aplicación en tu pantalla de inicio para la mejor experiencia!', install: 'Instalar', later: 'Más tarde' },
                'fr': { title: 'Installer BIPardy', description: 'Installez cette application sur votre écran d\'accueil pour la meilleure expérience !', install: 'Installer', later: 'Plus tard' },
                'it': { title: 'Installa BIPardy', description: 'Installa questa app sulla tua schermata iniziale per la migliore esperienza!', install: 'Installa', later: 'Più tardi' },
                'ja': { title: 'BIPardy をインストール', description: '最高の体験のためにこのアプリをホーム画面にインストールしてください！', install: 'インストール', later: '後で' },
                'da': { title: 'Installer BIPardy', description: 'Installer denne app på din hjemmeskærm for den bedste oplevelse!', install: 'Installer', later: 'Senere' }
            };
            
            return translations[langCode] || translations['en'];
        };

        // Update PWA popup text
        const updatePWAPopupLanguage = () => {
            const strings = getLanguageStrings();
            if (installPrompt) {
                const titleElement = installPrompt.querySelector('h3');
                const descriptionElement = installPrompt.querySelector('p');
                
                if (titleElement) uiController.updateTextContent('installPrompt', strings.title);
                if (descriptionElement) descriptionElement.textContent = strings.description;
                if (installBtn) uiController.updateTextContent('installBtn', strings.install);
                if (laterBtn) uiController.updateTextContent('laterBtn', strings.later);
            }
        };

        // PWA events
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            if (localStorage.getItem('installPromptDismissed') !== 'true') {
                updatePWAPopupLanguage();
                uiController.showElement('installPrompt');
            }
        });

        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    }
                    deferredPrompt = null;
                }
                uiController.hideElement('installPrompt');
            });
        }

        if (laterBtn) {
            laterBtn.addEventListener('click', () => {
                localStorage.setItem('installPromptDismissed', 'true');
                uiController.hideElement('installPrompt');
            });
        }

        // Register service worker
        if ('serviceWorker' in navigator && !DEBUG) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('service-worker.js')
                    .then(registration => console.log('ServiceWorker registered'))
                    .catch(err => console.log('ServiceWorker registration failed: ', err));
            });
        }

        // Desktop keyboard toggle
        if (!isMobile) {
            const keyboardToggle = uiController.get('keyboardToggle');
            const keyboard = document.querySelector('.keyboard');
            
            if (keyboardToggle && keyboard) {
                keyboardToggle.addEventListener('click', () => {
                    keyboard.classList.toggle('visible');
                    uiController.updateTextContent('keyboardToggle', 
                        keyboard.classList.contains('visible') ? '⌨️ Hide Keyboard' : '⌨️ Keyboard');
                    
                    const attribution = document.querySelector('.vibecoded-note');
                    if (attribution) {
                        attribution.style.display = keyboard.classList.contains('visible') ? 'none' : 'block';
                    }
                });
            }
        }
    }

    // Leaderboard Management
    static async getLocalScores() {
        try {
            const encryptedScores = localStorage.getItem('bipardy-local-scores');
            if (!encryptedScores) return [];
            
            const encryptedData = JSON.parse(encryptedScores);
            const decryptedScores = await storageEncryption.decrypt(encryptedData);
            
            return decryptedScores || [];
        } catch (error) {
            console.error('Error reading local scores:', error);
            return [];
        }
    }

    static async saveLocalScore(scoreEntry) {
        try {
            const scores = await this.getLocalScores();
            scores.push(scoreEntry);
            scores.sort((a, b) => b.score - a.score);
            const trimmedScores = scores.slice(0, 50);
            
            const encryptedData = await storageEncryption.encrypt(trimmedScores);
            if (encryptedData) {
                localStorage.setItem('bipardy-local-scores', JSON.stringify(encryptedData));
            }
            
            return trimmedScores;
        } catch (error) {
            console.error('Error saving local score:', error);
            return await this.getLocalScores();
        }
    }

    // Global Leaderboard Cache
    static globalLeaderboardCache = {
        data: null,
        timestamp: 0,
        ttl: 30000 // 30 seconds
    };

    static async loadGlobalLeaderboard() {
        try {
            const now = Date.now();
            
            // Return cached data if fresh
            if (this.globalLeaderboardCache.data && 
                (now - this.globalLeaderboardCache.timestamp) < this.globalLeaderboardCache.ttl) {
                return this.globalLeaderboardCache.data;
            }
            
            // Fetch fresh data
            const response = await fetch('/.netlify/functions/get-leaderboard');
            if (!response.ok) throw new Error('Failed to load global leaderboard');
            const data = await response.json();
            
            // Update cache
            this.globalLeaderboardCache.data = data;
            this.globalLeaderboardCache.timestamp = now;
            
            return data;
        } catch (error) {
            console.error('Error loading global leaderboard:', error);
            
            // Return cached data if available
            if (this.globalLeaderboardCache.data) {
                console.warn('Using stale cached leaderboard data');
                return this.globalLeaderboardCache.data;
            }
            
            return [];
        }
    }

    static async checkGlobalEligibility(scoreData) {
        try {
            const globalScores = await this.loadGlobalLeaderboard();
            if (!globalScores || globalScores.length === 0) {
                return { eligible: true, rank: 1 };
            }

            // Sort by score and find position
            globalScores.sort((a, b) => b.score - a.score);
            const playerRank = globalScores.findIndex(s => s.score <= scoreData.score) + 1 || globalScores.length + 1;
            
            return {
                eligible: playerRank <= 21,
                rank: playerRank,
                minScore: globalScores[20]?.score || 100,
                totalEntries: globalScores.length
            };
        } catch (error) {
            console.error('Error checking global eligibility:', error);
            return { eligible: false, error: true, minScore: 100 };
        }
    }

    static async submitGlobalScore(name, scoreData) {
        try {
            const gameTime = Math.round((Date.now() - gameState.gameStartTime) / 1000);
            const payload = {
                ...scoreData,
                name: GameUtils.sanitizeName(name),
                gameTime: gameTime,
                timestamp: Date.now()
            };

            const response = await fetch('/.netlify/functions/submit-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to submit score');
            
            // Clear cache to get fresh data
            this.globalLeaderboardCache.data = null;
            this.globalLeaderboardCache.timestamp = 0;
            
            return await response.json();
        } catch (error) {
            console.error('Error submitting global score:', error);
            throw error;
        }
    }
    
    static updateScoreDisplay() {
        const players = gameState.players.map((player, index) => ({
            ...player,
            isCurrentPlayer: index === gameState.currentPlayer
        }));
        
        uiController.updateScoreDisplay(players);
    }
    
    static updatePlayerSelector() {
        // Update player selector UI
        const playerBtns = uiController.get('playerBtns');
        playerBtns.forEach((btn, index) => {
            uiController.updateClass(`playerBtn${index + 1}`, 'active', index + 1 === gameState.numPlayers);
        });
    }
    
    static updateHelpButtonText() {
        const helpCost = gameState.helpUsedCount === 0 ? 0 : 10;
        const currentPlayer = gameState.players[gameState.currentPlayer];
        
        let text;
        if (currentPlayer.score >= helpCost) {
            text = helpCost === 0 ? 'HELP (FREE)' : `HELP (-${helpCost})`;
        } else {
            text = 'HELP';
        }
        
        uiController.updateTextContent('helpButton', text);
    }
    
    static enableAllKeys() {
        const keys = uiController.get('keys');
        keys.forEach(key => {
            key.classList.remove('correct', 'incorrect', 'disabled');
        });
        gameState.keyboardLocked = false;
    }
    
    static startNewGame() {
        gameState.resetGame();
        uiController.hideElement('gameEndScreen');
        this.setupPlayers(gameState.numPlayers);
        this.startNewWord();
    }
    
    // Timer event handlers
    static handleTimerExpire() {
        // Timer expired - could trigger special logic
        uiController.updateTextContent('message', 'Time expired! No timer bonus.');
    }
    
    static handleTimerUpdate(bonus, progress) {
        // Update any additional timer UI if needed
    }
    
    // Leaderboard methods
    static async loadLocalLeaderboard(virtualLeaderboard) {
        try {
            const scores = JSON.parse(localStorage.getItem('bipardy-scores') || '[]');
            await virtualLeaderboard.loadData(scores, 'local', gameState.currentPlayerScore);
        } catch (error) {
            console.error('Failed to load local leaderboard:', error);
        }
    }
    
    static switchLeaderboardTab(type) {
        gameState.currentLeaderboardView = type;
        // Implementation for tab switching
    }
    
    static handlePlayerNameChange(value) {
        const sanitized = GameUtils.sanitizeName(value);
        if (gameState.currentPlayerScore) {
            gameState.currentPlayerScore.name = sanitized;
        }
    }
    
    static async submitScoreLocal() {
        if (!gameState.currentPlayerScore) return;
        
        try {
            const scoreEntry = {
                name: GameUtils.sanitizeName(gameState.currentPlayerScore.name),
                score: gameState.currentPlayerScore.score,
                accuracy: gameState.currentPlayerScore.accuracy,
                gameLength: gameState.currentPlayerScore.gameLength,
                timestamp: Date.now(),
                date: new Date().toISOString()
            };

            const updatedScores = await this.saveLocalScore(scoreEntry);
            gameState.scoreSubmittedLocally = true;
            
            // Update UI
            this.updateSubmissionButtons();
            uiController.updateTextContent('message', 'Score saved locally!');
            uiController.updateClass('message', 'success', true);

            // Refresh local leaderboard if visible
            if (gameState.currentLeaderboardView === 'local') {
                await this.loadLocalLeaderboard();
            }

        } catch (error) {
            console.error('Failed to save score locally:', error);
            uiController.updateTextContent('message', 'Failed to save score locally.');
            uiController.updateClass('message', 'error', true);
        }
    }
    
    static async submitScoreGlobal() {
        if (!gameState.currentPlayerScore) return;
        
        try {
            // Check eligibility first
            const eligibility = await this.checkGlobalEligibility(gameState.currentPlayerScore);
            
            if (!eligibility.eligible && !eligibility.error) {
                uiController.updateTextContent('message', 
                    `Score too low for global leaderboard. Need at least ${eligibility.minScore} points.`);
                uiController.updateClass('message', 'error', true);
                return;
            }

            const scoreData = {
                score: gameState.currentPlayerScore.score,
                accuracy: gameState.currentPlayerScore.accuracy,
                gameLength: gameState.currentPlayerScore.gameLength
            };

            const result = await this.submitGlobalScore(gameState.currentPlayerScore.name, scoreData);
            
            // Also save locally
            await this.submitScoreLocal();
            
            gameState.scoreSubmittedGlobally = true;
            this.updateSubmissionButtons();

            uiController.updateTextContent('message', 'Score submitted to global leaderboard!');
            uiController.updateClass('message', 'success', true);

            // Show rank if available
            if (result.rank) {
                setTimeout(() => {
                    uiController.updateTextContent('message', 
                        `Global rank: #${result.rank}! Great job!`);
                }, 2000);
            }

        } catch (error) {
            console.error('Failed to submit score globally:', error);
            uiController.updateTextContent('message', 'Failed to submit to global leaderboard. Saved locally instead.');
            uiController.updateClass('message', 'error', true);
            
            // Fallback to local save
            await this.submitScoreLocal();
        }
    }

    static updateSubmissionButtons() {
        const localBtn = uiController.get('submitLocalBtn');
        const globalBtn = uiController.get('submitGlobalBtn');
        
        if (gameState.scoreSubmittedLocally && localBtn) {
            localBtn.disabled = true;
            uiController.updateTextContent('submitLocalBtn', '✅ Saved Locally');
            uiController.updateStyle('submitLocalBtn', 'opacity', '0.6');
        }
        
        if (gameState.scoreSubmittedGlobally && globalBtn) {
            globalBtn.disabled = true;
            uiController.updateTextContent('submitGlobalBtn', '✅ Shared Globally');
            uiController.updateStyle('submitGlobalBtn', 'opacity', '0.6');
        }
    }

    static resetSubmissionButtons() {
        const localBtn = uiController.get('submitLocalBtn');
        const globalBtn = uiController.get('submitGlobalBtn');
        
        if (localBtn) {
            localBtn.disabled = false;
            uiController.updateTextContent('submitLocalBtn', '💾 Save Locally Only');
            uiController.updateStyle('submitLocalBtn', 'opacity', '1');
        }
        
        if (globalBtn) {
            globalBtn.disabled = false;
            uiController.updateTextContent('submitGlobalBtn', '🌍 Save Local + Share Global');
            uiController.updateStyle('submitGlobalBtn', 'opacity', '1');
        }
    }
}

/* =========================================== */
/* INITIALIZATION */
/* =========================================== */

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    GameEngine.initializeGame();
});

// Export for debugging in development
if (DEBUG) {
    window.GameEngine = GameEngine;
    window.gameState = gameState;
    window.GameUtils = GameUtils;
}