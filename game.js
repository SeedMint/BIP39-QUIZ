/* =========================================== */
/* INITIALIZATION & PWA */
/* =========================================== */

// Detect if mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

// Debug flag for development vs production logging
const DEBUG = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const IS_PRODUCTION = !DEBUG;


// Keyboard toggle for desktop
if (!isMobile) {
    const keyboardToggle = document.getElementById('keyboardToggle');
    const keyboard = document.querySelector('.keyboard');
    
    keyboardToggle.addEventListener('click', () => {
        keyboard.classList.toggle('visible');
        keyboardToggle.textContent = keyboard.classList.contains('visible') ? '⌨️ Hide Keyboard' : '⌨️ Keyboard';
        
        // Hide/show attribution based on keyboard visibility
        const attribution = document.querySelector('.vibecoded-note');
        if (keyboard.classList.contains('visible')) {
            attribution.style.display = 'none';
        } else {
            attribution.style.display = 'block';
        }
    });
}

// PWA Install handling
let deferredPrompt;
const installPrompt = document.getElementById('installPrompt');
const installBtn = document.getElementById('installBtn');
const laterBtn = document.getElementById('laterBtn');

// Language detection for PWA popup
function getLanguageStrings() {
    const userLang = navigator.language || navigator.userLanguage || 'en';
    const langCode = userLang.split('-')[0].toLowerCase();
    
    const translations = {
        'en': {
            title: 'Install BIPardy',
            description: 'Install this app on your home screen for the best experience!',
            install: 'Install',
            later: 'Later',
            iosInstructions: 'To install: Tap the share button below and select "Add to Home Screen"'
        },
        'de': {
            title: 'BIPardy installieren',
            description: 'Installieren Sie diese App auf Ihrem Startbildschirm für die beste Erfahrung!',
            install: 'Installieren',
            later: 'Später',
            iosInstructions: 'Zum Installieren: Tippen Sie unten auf die Teilen-Schaltfläche und wählen Sie "Zum Home-Bildschirm"'
        },
        'es': {
            title: 'Instalar BIPardy',
            description: '¡Instala esta aplicación en tu pantalla de inicio para la mejor experiencia!',
            install: 'Instalar',
            later: 'Más tarde',
            iosInstructions: 'Para instalar: Toca el botón compartir abajo y selecciona "Añadir a pantalla de inicio"'
        },
        'fr': {
            title: 'Installer BIPardy',
            description: 'Installez cette application sur votre écran d\'accueil pour la meilleure expérience !',
            install: 'Installer',
            later: 'Plus tard',
            iosInstructions: 'Pour installer : Appuyez sur le bouton de partage ci-dessous et sélectionnez "Sur l\'écran d\'accueil"'
        },
        'it': {
            title: 'Installa BIPardy',
            description: 'Installa questa app sulla tua schermata iniziale per la migliore esperienza!',
            install: 'Installa',
            later: 'Più tardi',
            iosInstructions: 'Per installare: Tocca il pulsante condividi qui sotto e seleziona "Aggiungi alla schermata Home"'
        },
        'ja': {
            title: 'BIPardy をインストール',
            description: '最高の体験のためにこのアプリをホーム画面にインストールしてください！',
            install: 'インストール',
            later: '後で',
            iosInstructions: 'インストールするには：下の共有ボタンをタップして「ホーム画面に追加」を選択してください'
        },
        'da': {
            title: 'Installer BIPardy',
            description: 'Installer denne app på din hjemmeskærm for den bedste oplevelse!',
            install: 'Installer',
            later: 'Senere',
            iosInstructions: 'For at installere: Tryk på del-knappen nedenfor og vælg "Tilføj til hjemmeskærm"'
        }
    };
    
    return translations[langCode] || translations['en'];
}

// Update PWA popup text based on detected language
function updatePWAPopupLanguage() {
    const strings = getLanguageStrings();
    const titleElement = installPrompt.querySelector('h3');
    const descriptionElement = installPrompt.querySelector('p');
    
    if (titleElement) titleElement.textContent = strings.title;
    if (descriptionElement) descriptionElement.textContent = strings.description;
    if (installBtn) installBtn.textContent = strings.install;
    if (laterBtn) laterBtn.textContent = strings.later;
}

// Initialize PWA popup language
updatePWAPopupLanguage();

// Check if already installed
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    console.log('App already installed');
} else {
    // Show install prompt for iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS && !localStorage.getItem('installPromptDismissed')) {
        setTimeout(() => {
            installPrompt.style.display = 'block';
        }, 2000);
    }
}

// Handle install prompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (!localStorage.getItem('installPromptDismissed')) {
        updatePWAPopupLanguage(); // Update language before showing
        installPrompt.style.display = 'block';
    }
});

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        deferredPrompt = null;
    } else {
        // iOS installation instructions in user's language
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIOS) {
            const strings = getLanguageStrings();
            alert(strings.iosInstructions);
        }
    }
    installPrompt.style.display = 'none';
});

laterBtn.addEventListener('click', () => {
    localStorage.setItem('installPromptDismissed', 'true');
    installPrompt.style.display = 'none';
});

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => console.log('ServiceWorker registered'))
            .catch(err => console.log('ServiceWorker registration failed: ', err));
    });
}

/* =========================================== */
/* GAME DATA & STATE */
/* =========================================== */

// BIP-39 wordlist - contains only words with 5+ letters
const bip39Words = [
		  "abandon", "ability", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acoustic", "acquire", "across", "action", "actor", "actress", "actual", "adapt", "addict", "address", "adjust", "admit", "adult", "advance", "advice", "aerobic", "affair", "afford", "afraid", "again", "agent", "agree", "ahead", "airport", "aisle", "alarm", "album", "alcohol", "alert", "alien", "alley", "allow", "almost", "alone", "alpha", "already", "alter", "always", "amateur", "amazing", "among", "amount", "amused", "analyst", "analyze", "anchor", "ancient", "anger", "angle", "angry", "animal", "ankle", "announce", "annual", "another", "answer", "anxiety", "apart", "apology", "appear", "apple", "approve", "april", "arctic", "arena", "argue", "armed", "armor", "around", "arrange", "arrest", "arrive", "arrow", "artist", "artwork", "aspect", "assault", "asset", "assist", "assume", "asthma", "athlete", "athletic", "atlas", "attack", "attend", "attitude", "attorney", "attract", "auction", "audit", "august", "author", "autumn", "average", "avocado", "avoid", "awake", "aware", "awesome", "awful", "awkward", "bachelor", "bacon", "badge", "balance", "balcony", "bamboo", "banana", "banner", "barely", "bargain", "barrel", "basic", "basket", "battle", "beach", "beauty", "because", "become", "before", "begin", "behave", "behind", "believe", "below", "bench", "benefit", "betray", "better", "between", "beyond", "bicycle", "biology", "birth", "bitter", "black", "blade", "blame", "blanket", "blast", "bleak", "bless", "blind", "blood", "blossom", "blouse", "board", "bonus", "boost", "border", "boring", "borrow", "bottom", "bounce", "bracket", "brain", "brand", "brass", "brave", "bread", "breeze", "brick", "bridge", "brief", "bright", "bring", "brisk", "broccoli", "broken", "bronze", "broom", "brother", "brown", "brush", "bubble", "buddy", "budget", "buffalo", "build", "bullet", "bundle", "bunker", "burden", "burger", "burst", "business", "butter", "buyer", "cabbage", "cabin", "cable", "cactus", "camera", "canal", "cancel", "candy", "cannon", "canoe", "canvas", "canyon", "capable", "capital", "captain", "carbon", "cargo", "carpet", "carry", "casino", "castle", "casual", "catalog", "catch", "category", "cattle", "caught", "cause", "caution", "ceiling", "celery", "cement", "census", "century", "ceramic", "certain", "chair", "chalk", "champion", "change", "chaos", "chapter", "charge", "cheap", "check", "cheese", "cherry", "chest", "chicken", "chief", "child", "chimney", "choice", "choose", "chronic", "chuckle", "chunk", "churn", "cigar", "cinnamon", "circle", "citizen", "civil", "claim", "clarify", "clean", "clerk", "clever", "click", "client", "cliff", "climb", "clinic", "clock", "clone", "close", "cloth", "cloud", "clump", "cluster", "clutch", "coach", "coast", "coconut", "coffee", "collect", "color", "column", "combine", "comfort", "comic", "common", "company", "concert", "conduct", "confirm", "connect", "consist", "console", "construct", "contact", "contain", "contest", "context", "continue", "control", "convey", "convince", "copper", "coral", "correct", "cotton", "couch", "country", "couple", "course", "cousin", "cover", "coyote", "crack", "cradle", "craft", "crane", "crash", "crater", "crawl", "crazy", "cream", "credit", "creek", "cricket", "crime", "crisp", "critic", "cross", "crouch", "crowd", "crown", "crucial", "cruel", "cruise", "crumble", "crunch", "crush", "crystal", "culture", "cupboard", "curious", "current", "curve", "cushion", "custom", "cycle", "damage", "dance", "danger", "daring", "daughter", "debate", "debris", "decade", "december", "decide", "decline", "decorate", "decrease", "defense", "define", "degree", "delay", "deliver", "demand", "demise", "depart", "depend", "deposit", "depth", "deputy", "derive", "describe", "desert", "design", "despair", "destroy", "detail", "detect", "develop", "device", "devote", "diagram", "diamond", "diary", "diesel", "differ", "digital", "dignity", "dilemma", "dinner", "dinosaur", "direct", "disagree", "discover", "disease", "dismiss", "disorder", "display", "distance", "divide", "divine", "divorce", "dizzy", "doctor", "document", "dolphin", "domain", "donate", "donkey", "donor", "double", "draft", "dragon", "drama", "drastic", "dream", "dress", "drift", "drill", "drink", "drive", "dwarf", "dynamic", "eager", "eagle", "early", "earth", "easily", "ecology", "economy", "educate", "effort", "eight", "either", "elbow", "elder", "electric", "elegant", "element", "elephant", "elevator", "elite", "embark", "embody", "embrace", "emerge", "emotion", "employ", "empower", "empty", "enable", "enact", "endless", "endorse", "enemy", "energy", "enforce", "engage", "engine", "enhance", "enjoy", "enlist", "enough", "enrich", "enroll", "ensure", "enter", "entire", "entry", "envelope", "episode", "equal", "equip", "erase", "erupt", "escape", "essay", "estate", "eternal", "ethics", "evidence", "evoke", "evolve", "exact", "example", "excess", "exchange", "excite", "exclude", "excuse", "execute", "exercise", "exhaust", "exhibit", "exile", "exist", "exotic", "expand", "expect", "expire", "explain", "expose", "express", "extend", "extra", "eyebrow", "fabric", "faculty", "faint", "faith", "false", "family", "famous", "fancy", "fantasy", "fashion", "fatal", "father", "fatigue", "fault", "favorite", "feature", "february", "federal", "festival", "fetch", "fever", "fiber", "fiction", "field", "figure", "final", "finger", "finish", "first", "fiscal", "fitness", "flame", "flash", "flavor", "flight", "float", "flock", "floor", "flower", "fluid", "flush", "focus", "follow", "force", "forest", "forget", "fortune", "forum", "forward", "fossil", "foster", "found", "fragile", "frame", "frequent", "fresh", "friend", "fringe", "front", "frost", "frown", "frozen", "fruit", "funny", "furnace", "future", "gadget", "galaxy", "gallery", "garage", "garbage", "garden", "garlic", "garment", "gather", "gauge", "general", "genius", "genre", "gentle", "genuine", "gesture", "ghost", "giant", "giggle", "ginger", "giraffe", "glance", "glare", "glass", "glide", "glimpse", "globe", "gloom", "glory", "glove", "goblin", "goose", "gorilla", "gospel", "gossip", "govern", "grace", "grain", "grant", "grape", "grass", "gravity", "great", "green", "grief", "grocery", "group", "grunt", "guard", "guess", "guide", "guilt", "guitar", "habit", "hammer", "hamster", "happy", "harbor", "harsh", "harvest", "hazard", "health", "heart", "heavy", "hedgehog", "height", "hello", "helmet", "hidden", "history", "hobby", "hockey", "holiday", "hollow", "honey", "horse", "hospital", "hotel", "hover", "human", "humble", "humor", "hundred", "hungry", "hurdle", "hurry", "husband", "hybrid", "identify", "ignore", "illegal", "illness", "image", "imitate", "immense", "immune", "impact", "impose", "improve", "impulse", "include", "income", "increase", "index", "indicate", "indoor", "industry", "infant", "inflict", "inform", "inhale", "inherit", "initial", "inject", "injury", "inmate", "inner", "innocent", "input", "inquiry", "insane", "insect", "inside", "inspire", "install", "intact", "interest", "invest", "invite", "involve", "island", "isolate", "issue", "ivory", "jacket", "jaguar", "jealous", "jeans", "jelly", "jewel", "journey", "judge", "juice", "jumble", "junction", "kangaroo", "ketchup", "kidney", "kingdom", "kitchen", "kittens", "knife", "knock", "label", "labor", "ladder", "language", "laptop", "large", "later", "latin", "laugh", "laundry", "leader", "learn", "lease", "least", "leave", "lecture", "legal", "legend", "lemon", "length", "leopard", "lesson", "letter", "level", "liberty", "library", "license", "light", "limit", "liquid", "little", "lizard", "lobster", "local", "logic", "lonely", "lottery", "lounge", "loyal", "lucky", "luggage", "lumber", "lunar", "lunch", "luxury", "lyrics", "machine", "magic", "magnet", "maize", "major", "mammal", "manage", "mandate", "mango", "mansion", "manual", "maple", "marble", "march", "margin", "marine", "market", "marriage", "master", "match", "material", "matrix", "matter", "maximum", "meadow", "measure", "mechanic", "medal", "media", "melody", "member", "memory", "mention", "mercy", "merge", "merit", "merry", "message", "metal", "method", "middle", "midnight", "million", "mimic", "mineral", "minimal", "minimum", "minor", "minute", "miracle", "mirror", "misery", "mistake", "mixed", "mixture", "mobile", "model", "modify", "moment", "monitor", "monster", "month", "moral", "morning", "mosquito", "mother", "motion", "motor", "mountain", "mouse", "movie", "muffin", "multiply", "muscle", "museum", "mushroom", "music", "mutual", "myself", "mystery", "naive", "napkin", "narrow", "nasty", "nation", "nature", "negative", "neglect", "neither", "nephew", "nerve", "network", "neutral", "never", "night", "noble", "noise", "nominee", "noodle", "normal", "north", "notable", "nothing", "notice", "novel", "nuclear", "number", "nurse", "oasis", "object", "oblige", "obscure", "observe", "obtain", "obvious", "occur", "ocean", "october", "offer", "office", "often", "olive", "olympic", "onion", "online", "opera", "opinion", "oppose", "option", "orange", "orbit", "orchard", "order", "ordinary", "organ", "orient", "original", "orphan", "ostrich", "other", "outdoor", "outer", "output", "outside", "owner", "oxygen", "oyster", "ozone", "paddle", "palace", "panda", "panel", "panic", "panther", "paper", "parade", "parent", "parrot", "party", "patch", "patient", "patrol", "pattern", "pause", "payment", "peace", "peanut", "pepper", "perfect", "permit", "person", "phone", "photo", "phrase", "physical", "piano", "picnic", "picture", "piece", "pigeon", "pilot", "pioneer", "pistol", "pitch", "pizza", "place", "planet", "plastic", "plate", "please", "pledge", "pluck", "plunge", "point", "polar", "police", "popular", "portion", "position", "possible", "potato", "pottery", "pouch", "pound", "powder", "power", "practice", "praise", "predict", "prefer", "prepare", "present", "pretty", "prevent", "price", "pride", "primary", "print", "priority", "prison", "private", "prize", "problem", "process", "produce", "profit", "program", "project", "promote", "proof", "property", "prose", "protest", "protocol", "provide", "public", "pudding", "pulse", "pumpkin", "punch", "pupil", "puppy", "purchase", "purity", "purple", "purpose", "pursue", "puzzle", "pyramid", "quality", "quantum", "quarter", "question", "quick", "quite", "quote", "rabbit", "raccoon", "racket", "radar", "radio", "raise", "rally", "ranch", "random", "range", "rapid", "rather", "raven", "razor", "ready", "reason", "rebel", "rebuild", "recall", "receive", "recipe", "record", "reduce", "reflect", "reform", "refuse", "region", "regret", "regular", "reject", "relax", "release", "relief", "remain", "remark", "remind", "remove", "render", "renew", "rental", "repair", "repeat", "replace", "report", "require", "rescue", "resemble", "resist", "resource", "response", "result", "resume", "retire", "retreat", "return", "reunion", "reveal", "review", "reward", "rhythm", "ribbon", "ridge", "rifle", "right", "rigid", "ripen", "ritual", "rival", "river", "roast", "robot", "robust", "rocket", "romance", "rookie", "rotate", "rough", "round", "route", "royal", "rubber", "saddle", "sadness", "salad", "salmon", "salute", "sample", "satisfy", "satoshi", "sauce", "sausage", "scale", "scare", "scatter", "scene", "scheme", "school", "science", "scissors", "scorpion", "scout", "screen", "script", "search", "season", "second", "secret", "section", "sector", "secure", "segment", "select", "seminar", "senior", "sense", "sentence", "series", "service", "session", "settle", "setup", "seven", "shadow", "shaft", "shallow", "share", "shell", "sheriff", "shield", "shift", "shine", "shiver", "shock", "shoot", "short", "shoulder", "shove", "shrimp", "shrug", "shuffle", "sibling", "siege", "sight", "silent", "silly", "silver", "similar", "simple", "since", "siren", "sister", "situate", "skate", "sketch", "skill", "skirt", "skull", "slack", "slang", "slate", "slave", "sleep", "sleeve", "slide", "slight", "slogan", "slush", "small", "smart", "smile", "smoke", "smooth", "snack", "snake", "sniff", "soccer", "social", "solar", "soldier", "solid", "solution", "solve", "someone", "sorry", "sound", "source", "south", "space", "spare", "spatial", "spawn", "speak", "special", "speed", "spell", "spend", "sphere", "spice", "spider", "spike", "spirit", "split", "spoil", "sport", "spray", "spread", "spring", "square", "squeeze", "squirrel", "stable", "stadium", "staff", "stage", "stamp", "staple", "start", "state", "steak", "steel", "stick", "still", "sting", "stock", "stomach", "stone", "stool", "story", "stove", "strategy", "street", "strike", "strong", "struggle", "student", "stuff", "stumble", "style", "subject", "submit", "subway", "success", "sugar", "suggest", "summer", "sunny", "sunset", "super", "supply", "supreme", "surface", "surge", "surprise", "surround", "survey", "suspect", "sustain", "swallow", "swamp", "swear", "sweet", "swift", "swing", "switch", "sword", "symbol", "symptom", "syndrome", "system", "table", "tackle", "tactic", "tadpole", "tail", "talent", "target", "taste", "tattle", "taught", "temper", "temple", "tennis", "thank", "theme", "theory", "there", "thing", "this", "thought", "three", "thrive", "throw", "thumb", "thunder", "ticket", "tiger", "timber", "tiny", "tired", "tissue", "title", "toast", "tobacco", "today", "toddler", "together", "toilet", "token", "tomato", "tomorrow", "tongue", "tonight", "tooth", "topic", "topple", "torch", "tornado", "tortoise", "total", "tourist", "toward", "tower", "track", "trade", "traffic", "tragic", "train", "transfer", "travel", "treat", "trend", "trial", "tribe", "trick", "trigger", "trophy", "trouble", "truck", "truly", "trumpet", "trust", "truth", "tuition", "tumble", "tunnel", "turkey", "turtle", "twelve", "twist", "typical", "umbrella", "unable", "unaware", "uncle", "uncover", "under", "unfair", "unfold", "unhappy", "uniform", "unique", "universe", "unknown", "unlock", "until", "unusual", "unveil", "update", "upgrade", "uphold", "uplift", "upper", "upset", "urban", "usage", "useful", "useless", "usual", "utility", "vacant", "vacuum", "vague", "valid", "valley", "valve", "vanish", "vapor", "variable", "vault", "vegetable", "vehicle", "velvet", "vendor", "venture", "venue", "verify", "version", "vessel", "veteran", "viable", "vibrant", "vicious", "victory", "video", "village", "vintage", "violin", "virtual", "virus", "visit", "visual", "vital", "vivid", "vocal", "voice", "volcano", "volume", "voyage", "wagon", "walnut", "warfare", "warrior", "waste", "water", "wealth", "weapon", "weasel", "weather", "wedding", "weekend", "weird", "welcome", "whale", "wheat", "wheel", "where", "whip", "whisper", "width", "window", "winner", "winter", "wisdom", "witness", "woman", "wonder", "world", "worry", "worth", "wrist", "write", "wrong", "yellow", "young", "youth", "zebra"
];

// Game state
let currentWord = "";
let revealedLetters = 4;
let guessedLetters = [];
let numPlayers = 1;
let currentPlayer = 0;
let showWordLength = false;
let gameLength = 12; // Default to 12 words
let players = [];
let gameActive = true;
let keyboardLocked = false;
let playerToggleSettings = [];
let toggleUsedThisRound = false;
let helpUsedCount = 0;
let wrongGuessCount = 0;

// Unified input sanitization function
function sanitizeName(input) {
    return input.replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

// Timer bonus system configuration
const TIMER_DURATION = 5; // seconds - easy to adjust
const MAX_TIMER_BONUS = 21; // maximum bonus points for instant answer
let timerActive = false;
let timerStartTime = 0;
let timerInterval = null;
let currentTimerBonus = 0;

// Timer bonus system functions
function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    timerActive = true;
    timerStartTime = Date.now();
    currentTimerBonus = MAX_TIMER_BONUS;
    
    // Show timer UI (using cached elements)
    
    timerContainer.classList.add('active');
    timerBonus.classList.add('show');
    timerBonus.textContent = `+${currentTimerBonus} Bonus`;
    
    // Reset progress bar to full width
    timerProgress.style.transition = 'none';
    timerProgress.style.width = '100%';
    
    // Start animation after a brief delay
    setTimeout(() => {
        timerProgress.style.transition = `width ${TIMER_DURATION}s linear`;
        timerProgress.style.width = '0%';
    }, 50);
    
    // Update bonus less frequently - CSS handles smooth animation
    timerInterval = setInterval(updateTimerBonus, 500);
    
    // Auto-expire timer
    setTimeout(expireTimer, TIMER_DURATION * 1000);
}

function updateTimerBonus() {
    if (!timerActive) return;
    
    const elapsed = (Date.now() - timerStartTime) / 1000;
    const remaining = Math.max(0, TIMER_DURATION - elapsed);
    const progress = remaining / TIMER_DURATION;
    
    // Calculate bonus proportionally
    currentTimerBonus = Math.round(MAX_TIMER_BONUS * progress);
    
    // Update bonus display
    // Use cached timerBonus element
    timerBonus.textContent = `+${currentTimerBonus} Bonus`;
    
    // Stop when timer expires
    if (remaining <= 0) {
        expireTimer();
    }
}

function expireTimer() {
    timerActive = false;
    currentTimerBonus = 0;
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Update UI to show expired state
    // Use cached timerBonus element
    timerBonus.textContent = '+0 Bonus';
    timerBonus.classList.remove('show');
}

function stopTimer() {
    timerActive = false;
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Hide timer UI
    // Use cached timerContainer element
    // Use cached timerBonus element
    
    timerContainer.classList.remove('active');
    timerBonus.classList.remove('show');
    
    // Return current bonus for scoring
    return currentTimerBonus;
}

function getCurrentTimerBonus() {
    return timerActive ? currentTimerBonus : 0;
}

// Advanced word selection system
let recentlyUsedWords = []; // Track last 210 words
let wordPool = []; // Shuffled word pool for better distribution
let poolIndex = 0; // Current position in shuffled pool
let sessionWordStats = new Map(); // Track word frequency this session


// DOM elements - cached for performance
const letterContainer = document.getElementById('letterContainer');
const helpButton = document.getElementById('helpButton');
// Already cached above
const timerContainer = document.getElementById('timerContainer');
const timerProgress = document.getElementById('timerProgress');
const timerBonus = document.getElementById('timerBonus');

// Helper function to update help button text
function updateHelpButtonText() {
    if (showWordLength) {
        let helpCost;
        if (currentWord.length === 5) {
            helpCost = helpUsedCount === 0 ? 21 : 0; // Only first help costs -21
        } else if (currentWord.length === 6) {
            if (helpUsedCount === 0) {
                helpCost = 10; // First help: -10
            } else if (helpUsedCount === 1) {
                helpCost = 11; // Second help: -11
            } else {
                helpCost = 0; // No more costs after 2nd help
            }
        } else {
            helpCost = 10; // Default for other lengths
        }
        
        if (helpCost > 0) {
            helpButton.textContent = `HELP (-${helpCost})`;
        } else {
            helpButton.textContent = `HELP (FREE)`;
        }
    } else {
        helpButton.textContent = `HELP`;
    }
}
// Already cached above
const lengthToggle = document.getElementById('lengthToggle');
const gameLengthToggle = document.getElementById('gameLengthToggle');
const gameLengthLabel = document.getElementById('gameLengthLabel');
const playerSelector = document.getElementById('playerSelector');
const scoreContainer = document.getElementById('scoreContainer');

// Initialize players
function initializePlayers(num) {
    players = [];
    playerToggleSettings = [];
    for (let i = 0; i < num; i++) {
        players.push({
            name: isMobile ? `P${i + 1}` : `Player ${i + 1}`,
            score: 0,
            streak: 0,
            words: 0
        });
        playerToggleSettings.push(false); // Each player's toggle preference
    }
    currentPlayer = 0;
    showWordLength = playerToggleSettings[currentPlayer];
    gameStartTime = Date.now(); // Reset game start time for leaderboard
    updateScoreDisplay();
}

// Update score display
function updateScoreDisplay() {
    scoreContainer.innerHTML = '';
    players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-score';
        if (index === currentPlayer) {
            playerDiv.classList.add('current-turn');
        }
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'name';
        nameDiv.textContent = player.name;
        nameDiv.setAttribute('data-player-index', index);
        nameDiv.addEventListener('click', () => editPlayerName(index, nameDiv));
        
        const statsDiv = document.createElement('div');
        statsDiv.className = 'stats';
        statsDiv.innerHTML = `
            <div class="stat">
                <div class="stat-value">${player.score}</div>
                <div class="stat-label">Score</div>
            </div>
            <div class="stat">
                <div class="stat-value">${player.streak}</div>
                <div class="stat-label">Streak</div>
            </div>
            <div class="stat">
                <div class="stat-value">${player.words}</div>
                <div class="stat-label">Words</div>
            </div>
        `;
        
        playerDiv.appendChild(nameDiv);
        playerDiv.appendChild(statsDiv);
        scoreContainer.appendChild(playerDiv);
    });
}



// Initialize word pool (called on game start)
function initializeWordPool() {
    wordPool = shuffleArray(bip39Words);
    poolIndex = 0;
    if (DEBUG) console.log(`Word pool initialized with ${wordPool.length} words`);
}

// Get random word with advanced selection
function getRandomWord() {
    // Initialize pool if empty or exhausted
    if (wordPool.length === 0 || poolIndex >= wordPool.length) {
        initializeWordPool();
    }

    let attempts = 0;
    let selectedWord;

    do {
        // Get word from shuffled pool
        selectedWord = wordPool[poolIndex];
        poolIndex++;

        // If we've exhausted the pool, reshuffle
        if (poolIndex >= wordPool.length) {
            initializeWordPool();
        }

        attempts++;
        
        // Safety valve - if we can't find an unused word after many attempts,
        // clear some of the recently used list
        if (attempts > 50) {
            recentlyUsedWords = recentlyUsedWords.slice(-100); // Keep only last 100
            if (DEBUG) console.log('Recently used list trimmed to prevent infinite loop');
        }
        
    } while (recentlyUsedWords.includes(selectedWord) && attempts <= 60);

    // Track the selected word
    recentlyUsedWords.push(selectedWord);
    
    // Maintain recently used list at 210 entries max
    if (recentlyUsedWords.length > 120) {
        recentlyUsedWords.shift(); // Remove oldest entry
    }

    // Update session statistics
    const currentCount = sessionWordStats.get(selectedWord) || 0;
    sessionWordStats.set(selectedWord, currentCount + 1);

    // Debug logging
    if (DEBUG) console.log(`Selected word: "${selectedWord}" (attempt ${attempts}, recently used: ${recentlyUsedWords.length})`);
    
    return selectedWord;
}

// Statistical analysis functions
function getWordDistributionStats() {
    const lengthStats = {};
    sessionWordStats.forEach((count, word) => {
        const length = word.length;
        if (!lengthStats[length]) {
            lengthStats[length] = { count: 0, words: 0 };
        }
        lengthStats[length].count += count;
        lengthStats[length].words++;
    });
    return lengthStats;
}

function logSessionStats() {
    console.log('=== Session Word Statistics ===');
    console.log(`Total unique words used: ${sessionWordStats.size}`);
    console.log(`Total words selected: ${Array.from(sessionWordStats.values()).reduce((a, b) => a + b, 0)}`);
    console.log(`Recently used list size: ${recentlyUsedWords.length}/210`);
    
    const lengthStats = getWordDistributionStats();
    console.log('Word length distribution:');
    Object.keys(lengthStats).sort().forEach(length => {
        const stats = lengthStats[length];
        console.log(`  ${length} letters: ${stats.words} unique words, ${stats.count} total uses`);
    });

    // Show most frequently used words
    const sortedWords = Array.from(sessionWordStats.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    console.log('Most frequently selected words:', sortedWords);
}

function logEntropyStats() {
    console.log('=== Entropy Collection Statistics ===');
    console.log(`Total entropy events collected: ${entropyPool.length}`);
    
    // Count by source
    const sourceStats = {};
    entropyPool.forEach(entry => {
        sourceStats[entry.source] = (sourceStats[entry.source] || 0) + 1;
    });
    
    console.log('Entropy sources:');
    Object.keys(sourceStats).forEach(source => {
        console.log(`  ${source}: ${sourceStats[source]} events`);
    });
    
    // Show entropy quality metrics
    if (entropyPool.length > 1) {
        const recentEntropy = entropyPool.slice(-100);
        const avgTimeDelta = recentEntropy.slice(1).reduce((sum, entry, i) => {
            return sum + (entry.time - recentEntropy[i].time);
        }, 0) / (recentEntropy.length - 1);
        
        console.log(`Average time between entropy events: ${avgTimeDelta.toFixed(2)}ms`);
    }
}

// Initialize word selection system on page load
function initializeWordSelectionSystem() {
    // Then initialize word pool with enhanced randomness
    initializeWordPool();
    
    // Add debug commands to console
    window.bipardyStats = logSessionStats;
    window.bipardyEntropy = logEntropyStats;
    
    if (DEBUG) {
        console.log('Advanced word selection system with client-side entropy initialized!');
        console.log('Debug commands:');
        console.log('  - bipardyStats() - Word selection statistics');
        console.log('  - bipardyEntropy() - Entropy collection statistics');
    }
}

// Display word
function displayWord() {
    letterContainer.innerHTML = '';
    
    if (showWordLength) {
        // Show all letter boxes
        for (let i = 0; i < currentWord.length; i++) {
            const letterBox = document.createElement('div');
            letterBox.className = 'letter-box';
            
            if (i < revealedLetters) {
                letterBox.classList.add('revealed');
                letterBox.textContent = currentWord[i].toUpperCase();
            } else if (i < revealedLetters + guessedLetters.length) {
                letterBox.classList.add('guessed');
                letterBox.textContent = guessedLetters[i - revealedLetters].toUpperCase();
            } else {
                letterBox.classList.add('empty');
                letterBox.textContent = '';
            }
            
            letterContainer.appendChild(letterBox);
        }
    } else {
        // Show revealed and guessed letters
        for (let i = 0; i < revealedLetters; i++) {
            const letterBox = document.createElement('div');
            letterBox.className = 'letter-box revealed';
            letterBox.textContent = currentWord[i].toUpperCase();
            letterContainer.appendChild(letterBox);
        }
        
        for (let i = 0; i < guessedLetters.length; i++) {
            const letterBox = document.createElement('div');
            letterBox.className = 'letter-box guessed';
            letterBox.textContent = guessedLetters[i].toUpperCase();
            letterContainer.appendChild(letterBox);
        }
    }
}

// Reveal full word animation
function revealFullWord() {
    letterContainer.innerHTML = '';
    for (let i = 0; i < currentWord.length; i++) {
        const letterBox = document.createElement('div');
        letterBox.className = 'letter-box';
        
        if (i < 4) {
            letterBox.classList.add('revealed');
            letterBox.textContent = currentWord[i].toUpperCase();
        } else {
            letterBox.classList.add('hidden');
            letterBox.textContent = currentWord[i].toUpperCase();
            setTimeout(() => {
                letterBox.classList.remove('hidden');
                letterBox.classList.add('revealed');
            }, (i - 3) * 100);
        }
        
        letterContainer.appendChild(letterBox);
    }
}

// Handle key press
function handleKeyPress(letter) {
    if (!gameActive) return;
    
    if (letter === 'backspace') {
        if (guessedLetters.length > 0) {
            guessedLetters.pop();
            displayWord();
        }
    } else if (letter === 'enter') {
        checkGuess();
    } else {
        if (revealedLetters + guessedLetters.length < currentWord.length) {
            guessedLetters.push(letter);
            displayWord();
        }
    }
}

// Start new word
function newWord() {
    currentWord = getRandomWord();
    revealedLetters = 4;
    guessedLetters = [];
    gameActive = true;
    toggleUsedThisRound = false;
    helpUsedCount = 0;
    wrongGuessCount = 0;
    helpButton.disabled = false;
    skipButton.disabled = false;
    submitButton.disabled = false;
    message.textContent = '';
    
    // Update help button text - don't reveal cost when word length is hidden
    updateHelpButtonText();
    
    // Start timer for this round
    startTimer();
    
    enableAllKeys();
    displayWord();
}

// Check guess
async function checkGuess() {
    if (!gameActive) return;
    
    const guessedWord = currentWord.substring(0, revealedLetters) + guessedLetters.join('');
    
    if (guessedWord === currentWord) {
        let finalPoints = 21; // Base points
        let bonusText = '';
        
        // Get timer bonus
        const timerBonus = getCurrentTimerBonus();
        stopTimer();
        
        // If toggle was used this round, cap at normal bonus (21 points)
        if (toggleUsedThisRound) {
            finalPoints = 21;
            bonusText = '';
        } else {
            // Only apply 42% multiplier if word length was hidden AND toggle wasn't used
            if (!showWordLength) {
                finalPoints = Math.round(21 * 1.42); // 30 points
                bonusText = ' (Hidden multiplier)';
            }
        }
        
        // Add timer bonus
        finalPoints += timerBonus;
        if (timerBonus > 0) {
            bonusText += ` +${timerBonus} timer bonus`;
        }
        
        players[currentPlayer].score += finalPoints;
        players[currentPlayer].streak++;
        players[currentPlayer].words++;
        updateScoreDisplay();
        
        // Check if game should end (target words reached)
        if (players[currentPlayer].words >= gameLength) {
            // Reveal the full word
            revealFullWord();
            
            // Show game end screen
            await showGameEndScreen(currentPlayer);
            return;
        }
        
        // Reveal the full word
        revealFullWord();
        
        message.textContent = `Correct! ${players[currentPlayer].name} +${finalPoints}!${bonusText}`;
        message.className = 'message success';
        gameActive = false;
        disableAllKeys();
        helpButton.disabled = true;
        skipButton.disabled = true;
        submitButton.disabled = true;
        
        // Move to next player after delay
        setTimeout(() => {
            currentPlayer = (currentPlayer + 1) % numPlayers;
            // Restore current player's toggle setting
            showWordLength = playerToggleSettings[currentPlayer];
            lengthToggle.classList.toggle('active', showWordLength);
            updateScoreDisplay();
            newWord();
        }, 2000);
    } else {
        // Wrong guess - increment counter
        wrongGuessCount++;
        updateScoreDisplay();
        
        // Check if player has reached 2 wrong guesses (applies to both single and multiplayer)
        if (wrongGuessCount >= 2) {
            // Stop timer when player fails
            stopTimer();
            
            // Reset streak only after second wrong guess
            players[currentPlayer].streak = 0;
            
            // Apply 10-point penalty for 2 wrong guesses
            players[currentPlayer].score = Math.max(0, players[currentPlayer].score - 10);
            updateScoreDisplay();
            
            // Show the full word
            revealFullWord();
            
            if (numPlayers > 1) {
                // Multiplayer: switch to next player
                message.textContent = `Wrong! Word was: ${currentWord}. ${players[currentPlayer].name} used both attempts (-10 points). Next player!`;
                message.className = 'message error';
                gameActive = false;
                disableAllKeys();
                helpButton.disabled = true;
                skipButton.disabled = true;
                submitButton.disabled = true;
                
                // Move to next player after delay
                setTimeout(() => {
                    currentPlayer = (currentPlayer + 1) % numPlayers;
                    // Restore current player's toggle setting
                    showWordLength = playerToggleSettings[currentPlayer];
                    lengthToggle.classList.toggle('active', showWordLength);
                    updateScoreDisplay();
                    newWord();
                }, 2500);
            } else {
                // Single player: continue with new word
                message.textContent = `Wrong! Word was: ${currentWord}. Used both attempts (-10 points).`;
                message.className = 'message error';
                gameActive = false;
                disableAllKeys();
                helpButton.disabled = true;
                skipButton.disabled = true;
                submitButton.disabled = true;
                
                // Continue with new word after delay
                setTimeout(() => {
                    updateScoreDisplay();
                    newWord();
                }, 2500);
            }
        } else {
            // Show attempt counter
            const attemptsLeft = 2 - wrongGuessCount;
            if (numPlayers > 1) {
                message.textContent = `Wrong! ${players[currentPlayer].name} has ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left!`;
            } else {
                message.textContent = `Wrong! You have ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left!`;
            }
            message.className = 'message error';
            guessedLetters = [];
            displayWord();
        }
    }
}

// Help function - costs variable points based on word length and usage count
async function help() {
    if (!gameActive) return;
    
    if (revealedLetters + guessedLetters.length < currentWord.length) {
        // Calculate help cost based on word length and usage count
        let helpCost;
        if (currentWord.length === 5) {
            helpCost = helpUsedCount === 0 ? 21 : 0; // Only first help costs -21
        } else if (currentWord.length === 6) {
            if (helpUsedCount === 0) {
                helpCost = 10; // First help: -10
            } else if (helpUsedCount === 1) {
                helpCost = 11; // Second help: -11
            } else {
                helpCost = 0; // No more costs after 2nd help
            }
        } else {
            helpCost = 10; // Default for other lengths
        }
        
        // Check if player has enough points BEFORE doing anything
        if (players[currentPlayer].score < helpCost) {
            // Not enough points for help - don't do anything
            message.textContent = `Not enough points for help! Need ${helpCost} points.`;
            message.className = 'message error';
            setTimeout(() => {
                message.textContent = '';
                message.className = 'message';
            }, 2000);
            return;
        }
        
        // Player has enough points - proceed with help
        const nextLetter = currentWord[revealedLetters + guessedLetters.length];
        guessedLetters.push(nextLetter);
        displayWord();
        
        // Stop timer when help is used
        stopTimer();
        
        // Deduct help cost and increment usage
        players[currentPlayer].score -= helpCost;
        helpUsedCount++;
        updateScoreDisplay();
        
        // Update help button text for next use
        updateHelpButtonText();
        
        // Clear any previous messages
        message.textContent = '';
        message.className = 'message';
        
        if (revealedLetters + guessedLetters.length === currentWord.length) {
            // Word completed with help - calculate bonus points
            let finalPoints = 21; // Base points for solving
            let bonusText = '';
            
            // If toggle was NOT used this round, apply multiplier
            if (!toggleUsedThisRound && !showWordLength) {
                finalPoints = Math.round(21 * 1.42); // 30 points
                bonusText = ' (Hidden multiplier)';
            }
            
            // No additional costs needed - help costs are now capped at standard bonus (21 points)
            
            // Award solving points and increment word count
            players[currentPlayer].score += finalPoints;
            players[currentPlayer].words++;
            updateScoreDisplay();
            
            // Check if game should end (target words reached)
            if (players[currentPlayer].words >= gameLength) {
                // Show game end screen
                await showGameEndScreen(currentPlayer);
                return;
            }
            
            message.textContent = `Completed with help! +${finalPoints}!${bonusText}`;
            message.className = 'message';
            gameActive = false;
            disableAllKeys();
            helpButton.disabled = true;
            skipButton.disabled = true;
            submitButton.disabled = true;
            
            setTimeout(() => {
                currentPlayer = (currentPlayer + 1) % numPlayers;
                // Restore current player's toggle setting
                showWordLength = playerToggleSettings[currentPlayer];
                lengthToggle.classList.toggle('active', showWordLength);
                updateScoreDisplay();
                newWord();
            }, 2000);
        }
    }
}

// Skip function - no points, keeps streak, increments word count
async function skip() {
    if (!gameActive) return;
    
    // Stop timer when skipping
    stopTimer();
    
    // Show the full word before skipping
    revealFullWord();
    
    // Increment word count for skip
    players[currentPlayer].words++;
    
    message.textContent = `Word was: ${currentWord}`;
    message.className = 'message';
    // Don't break streak, no score change, but count the word
    updateScoreDisplay();
    
    // Check if game should end (target words reached)
    if (players[currentPlayer].words >= gameLength) {
        // Show game end screen
        await showGameEndScreen(currentPlayer);
        return;
    }
    
    gameActive = false;
    disableAllKeys();
    helpButton.disabled = true;
    skipButton.disabled = true;
    submitButton.disabled = true;
    
    setTimeout(() => {
        currentPlayer = (currentPlayer + 1) % numPlayers;
        // Restore current player's toggle setting
        showWordLength = playerToggleSettings[currentPlayer];
        lengthToggle.classList.toggle('active', showWordLength);
        updateScoreDisplay();
        newWord();
    }, 2500);
}

// Disable all keys
function disableAllKeys() {
    document.querySelectorAll('.key').forEach(key => {
        key.classList.add('disabled');
    });
}

// Enable all keys
function enableAllKeys() {
    document.querySelectorAll('.key').forEach(key => {
        key.classList.remove('disabled');
    });
}

// Edit player name function
function editPlayerName(playerIndex, nameElement) {
    
    // Don't allow editing if already editing another name
    if (document.querySelector('.name.editing')) {
        console.log('❌ Already editing another name');
        return;
    }
    
    console.log('✅ Starting name edit for player', playerIndex);

    const currentName = players[playerIndex].name;
    
    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'name-input';
    // Filter the current name before setting it
    const filteredCurrentName = sanitizeName(currentName);
    input.value = filteredCurrentName;
    input.maxLength = 12; // Reasonable limit
    
    // Lock keyboard for name input
    keyboardLocked = true;
    
    // Add editing class for visual feedback
    nameElement.classList.add('editing');
    
    // Replace text with input
    nameElement.textContent = '';
    nameElement.appendChild(input);
    
    // Focus and select all text
    input.focus();
    input.select();
    
    // Add input filtering for name validation
    function filterInput(inputEl) {
        const original = inputEl.value;
        const filtered = sanitizeName(original);
        if (original !== filtered) {
            if (DEBUG) console.log('🔄 FILTERING NAME INPUT:', original, '->', filtered);
            inputEl.value = filtered;
        }
    }
    
    if (DEBUG) console.log('✅ Name filtering function attached to input element');
    
    // Instant input response for snappy feel
    input.addEventListener('input', (e) => filterInput(e.target));
    
    // Debounce only paste events for performance
    input.addEventListener('paste', (e) => {
        setTimeout(() => filterInput(e.target), 50);
    });
    
    // Handle saving the name
    function saveName() {
        const rawName = input.value.trim();
        // Apply filtering to the final name before saving
        const newName = sanitizeName(rawName);
        if (newName && newName !== currentName) {
            players[playerIndex].name = newName;
        }
        
        // Remove editing class and restore normal display
        nameElement.classList.remove('editing');
        nameElement.removeChild(input);
        nameElement.textContent = players[playerIndex].name;
        
        // Unlock keyboard
        keyboardLocked = false;
    }
    
    // Save on Enter key or blur
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            saveName();
        } else if (e.key === 'Escape') {
            // Cancel editing - restore original name
            nameElement.classList.remove('editing');
            nameElement.removeChild(input);
            nameElement.textContent = currentName;
            
            // Unlock keyboard
            keyboardLocked = false;
        }
    });
    
    input.addEventListener('blur', saveName);
}

// Calculate combined score for winner determination
function calculateCombinedScore(player) {
    // Skip zero components to avoid artificial inflation
    let combinedStr = '';
    
    if (player.score > 0) {
        combinedStr += player.score.toString();
    }
    
    if (player.streak > 0) {
        combinedStr += player.streak.toString();
    }
    
    if (player.words > 0) {
        combinedStr += player.words.toString();
    }
    
    // If all values are 0, return 0
    return combinedStr === '' ? 0 : parseInt(combinedStr);
}

// Find winner based on combined score
function findWinner() {
    let winnerIndex = 0;
    let highestCombinedScore = calculateCombinedScore(players[0]);
    
    for (let i = 1; i < players.length; i++) {
        const combinedScore = calculateCombinedScore(players[i]);
        if (combinedScore > highestCombinedScore) {
            highestCombinedScore = combinedScore;
            winnerIndex = i;
        }
    }
    
    return winnerIndex;
}

// Enhanced Leaderboard functionality with local storage + GitHub
let gameStartTime = Date.now();
let currentPlayerScore = null;
let currentLeaderboardView = 'local'; // 'local' or 'global'
let scoreSubmittedLocally = false;
let scoreSubmittedGlobally = false;

// Track submitted scores to prevent duplicates
function generateScoreId(playerName, score, timestamp) {
    return `${playerName}_${score}_${timestamp}`;
}

function getSubmittedScores() {
    try {
        const stored = localStorage.getItem('submittedScores');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.warn('Error reading submitted scores:', error);
        return [];
    }
}

function addSubmittedScore(scoreId) {
    try {
        const submittedScores = getSubmittedScores();
        if (!submittedScores.includes(scoreId)) {
            submittedScores.push(scoreId);
            localStorage.setItem('submittedScores', JSON.stringify(submittedScores));
        }
    } catch (error) {
        console.warn('Error storing submitted score:', error);
    }
}

function isScoreAlreadySubmitted(playerName, score, timestamp) {
    const scoreId = generateScoreId(playerName, score, timestamp);
    const submittedScores = getSubmittedScores();
    return submittedScores.includes(scoreId);
}


// Reset button states for new game
function resetSubmissionButtons() {
    const localBtn = document.getElementById('submitLocalBtn');
    const globalBtn = document.getElementById('submitGlobalBtn');
    
    localBtn.disabled = false;
    localBtn.textContent = '💾 Save Locally Only';
    localBtn.style.opacity = '1';
    
    globalBtn.disabled = false;
    globalBtn.textContent = '🌍 Save Local + Share Global';
    globalBtn.style.opacity = '1';
}

// Update button states based on submission status
function updateSubmissionButtons() {
    const localBtn = document.getElementById('submitLocalBtn');
    const globalBtn = document.getElementById('submitGlobalBtn');
    
    if (scoreSubmittedLocally) {
        localBtn.disabled = true;
        localBtn.textContent = '✅ Saved Locally';
        localBtn.style.opacity = '0.6';
    }
    
    if (scoreSubmittedGlobally) {
        globalBtn.disabled = true;
        globalBtn.textContent = '✅ Shared Globally';
        globalBtn.style.opacity = '0.6';
    }
}

// Update the global submission eligibility UI
async function updateGlobalEligibility(scoreData) {
    const globalBtn = document.getElementById('submitGlobalBtn');
    const eligibilityNotice = document.getElementById('eligibilityNotice');
    
    // Validate DOM elements exist
    if (!globalBtn || !eligibilityNotice) {
        console.error('Required DOM elements not found for eligibility update');
        return;
    }
    
    // Validate score data
    if (!scoreData || typeof scoreData.combined !== 'number') {
        console.error('Invalid score data provided to updateGlobalEligibility');
        return;
    }
    
    // Prevent race conditions by using a unique request ID
    const requestId = Date.now() + Math.random();
    updateGlobalEligibility.currentRequest = requestId;
    
    try {
        // Show loading state
        eligibilityNotice.style.display = 'block';
        eligibilityNotice.className = 'eligibility-notice loading';
        eligibilityNotice.textContent = '🔍 Checking global leaderboard qualification...';
        
        // Check eligibility
        const eligibility = await checkGlobalEligibility(scoreData);
        
        // Check if this request is still the current one (prevent race conditions)
        if (updateGlobalEligibility.currentRequest !== requestId) {
            return; // Another request has been made, ignore this result
        }
        
        if (eligibility.eligible) {
            // Qualified - show green notice
            eligibilityNotice.className = 'eligibility-notice qualified';
            if (eligibility.rank) {
                eligibilityNotice.textContent = `🎉 Your score qualifies for global leaderboard! Projected rank: #${eligibility.rank}`;
            } else {
                eligibilityNotice.textContent = `🎉 Your score qualifies for the global leaderboard!`;
            }
            
            // Keep global button enabled and styled normally
            globalBtn.classList.remove('ineligible');
            globalBtn.removeAttribute('title');
        } else {
            // Not qualified - show red notice and disable button
            eligibilityNotice.className = 'eligibility-notice not-qualified';
            
            if (eligibility.error) {
                eligibilityNotice.textContent = `⚠️ Could not verify qualification. Score must be at least ${eligibility.minScore} to submit globally.`;
            } else if (eligibility.totalEntries < 21) {
                eligibilityNotice.textContent = `📊 Score too low. Need at least ${eligibility.minScore} points to qualify for global leaderboard.`;
            } else {
                eligibilityNotice.textContent = `📊 Score needs to be ${eligibility.minScore}+ to make top 21 global leaderboard (you need ${eligibility.scoreNeeded} more points).`;
            }
            
            // Disable and style global button
            globalBtn.classList.add('ineligible');
            globalBtn.disabled = true;
            globalBtn.textContent = `Score too low (${eligibility.minScore}+ needed)`;
            globalBtn.title = `Your score needs to be at least ${eligibility.minScore} to qualify for global leaderboard`;
        }
        
    } catch (error) {
        console.error('Error updating global eligibility:', error);
        
        // Check if this request is still the current one (prevent race conditions)
        if (updateGlobalEligibility.currentRequest !== requestId) {
            return; // Another request has been made, ignore this result
        }
        
        // On error, show warning but allow submission
        eligibilityNotice.className = 'eligibility-notice loading';
        eligibilityNotice.textContent = '⚠️ Could not check qualification. You can still try to submit globally.';
        globalBtn.classList.remove('ineligible');
        globalBtn.removeAttribute('title');
    }
}

// Encryption utilities for local storage
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
            
            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                key,
                encodedData
            );

            return {
                encrypted: Array.from(new Uint8Array(encrypted)),
                iv: Array.from(iv)
            };
        } catch (error) {
            console.error('Encryption error:', error);
            return null;
        }
    }

    async decrypt(encryptedData) {
        try {
            const key = await this.getOrCreateKey();
            const { encrypted, iv } = encryptedData;
            
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: new Uint8Array(iv) },
                key,
                new Uint8Array(encrypted)
            );

            const decryptedString = new TextDecoder().decode(decrypted);
            return JSON.parse(decryptedString);
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }
}

const storageEncryption = new LocalStorageEncryption();

// Comprehensive HTML escaping function (defense in depth)
function escapeHTML(text) {
    if (typeof text !== 'string') {
        text = String(text);
    }
    
    return text
        .replace(/&/g, '&amp;')      // Must be first - escapes ampersands
        .replace(/</g, '&lt;')       // Less than
        .replace(/>/g, '&gt;')       // Greater than  
        .replace(/"/g, '&quot;')     // Double quotes
        .replace(/'/g, '&#x27;')     // Single quotes (&#x27; preferred over &#39;)
        .replace(/\//g, '&#x2F;')    // Forward slash (prevents script tag escaping)
        .replace(/`/g, '&#x60;')     // Backticks (prevents template literal injection)
        .replace(/=/g, '&#x3D;');    // Equals sign (prevents attribute injection)
}

// Advanced XSS protection - catches dangerous patterns
function sanitizeForDisplay(userText) {
    if (typeof userText !== 'string') {
        userText = String(userText);
    }
    
    // First pass: Remove dangerous URL schemes
    let sanitized = userText
        .replace(/javascript\s*:/gi, 'blocked-js:')
        .replace(/vbscript\s*:/gi, 'blocked-vbs:')
        .replace(/data\s*:/gi, 'blocked-data:')
        .replace(/file\s*:/gi, 'blocked-file:')
        .replace(/ftp\s*:/gi, 'blocked-ftp:');
    
    // Second pass: Remove dangerous event handlers
    sanitized = sanitized
        .replace(/\bon\w+\s*=/gi, 'blocked-event=')
        .replace(/\bstyle\s*=/gi, 'blocked-style=')
        .replace(/\bformaction\s*=/gi, 'blocked-formaction=');
    
    // Third pass: Remove dangerous HTML patterns
    sanitized = sanitized
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[blocked-script]')
        .replace(/<iframe\b[^>]*>/gi, '[blocked-iframe]')
        .replace(/<object\b[^>]*>/gi, '[blocked-object]')
        .replace(/<embed\b[^>]*>/gi, '[blocked-embed]')
        .replace(/<link\b[^>]*>/gi, '[blocked-link]')
        .replace(/<meta\b[^>]*>/gi, '[blocked-meta]')
        .replace(/<base\b[^>]*>/gi, '[blocked-base]')
        .replace(/<form\b[^>]*>/gi, '[blocked-form]');
    
    // Fourth pass: HTML escape everything
    return escapeHTML(sanitized);
}

// Safe user data display function with layered protection
function safeDisplayUserData(userText) {
    // Layer 1: Input sanitization
    const sanitized = sanitizeForDisplay(userText);
    
    // Layer 2: Browser-native escaping (belt and suspenders)
    const div = document.createElement('div');
    div.textContent = sanitized;
    const browserEscaped = div.innerHTML;
    
    // Layer 3: Final manual escape (triple protection)
    return escapeHTML(browserEscaped);
}

// Create safe text elements with comprehensive protection
function createSafeTextElement(text, className = '') {
    const element = document.createElement('span');
    if (className) element.className = className;
    
    // Use textContent for maximum safety (browser handles everything)
    element.textContent = sanitizeForDisplay(text);
    return element;
}

// URL sanitization for any links or redirects
function sanitizeURL(url) {
    if (typeof url !== 'string') return '#';
    
    // Allow only safe URL schemes
    const safeSchemes = ['http:', 'https:', 'mailto:', 'tel:'];
    
    try {
        const urlObj = new URL(url, window.location.origin);
        if (safeSchemes.includes(urlObj.protocol)) {
            return urlObj.href;
        }
    } catch (e) {
        // Invalid URL
    }
    
    return '#'; // Default to safe anchor
}

// CSS injection protection
function sanitizeCSS(cssText) {
    if (typeof cssText !== 'string') return '';
    
    // Remove dangerous CSS patterns
    return cssText
        .replace(/expression\s*\(/gi, 'blocked-expression(')
        .replace(/javascript\s*:/gi, 'blocked:')
        .replace(/\/\*.*?\*\//g, '') // Remove comments
        .replace(/@import/gi, 'blocked-import')
        .replace(/behavior\s*:/gi, 'blocked-behavior:')
        .replace(/binding\s*:/gi, 'blocked-binding:');
}

// Local Storage Management
async function getLocalScores() {
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

async function saveLocalScore(scoreEntry) {
    try {
        const scores = await getLocalScores();
        scores.push(scoreEntry);
        // Sort by combined score (descending) and keep top 50
        scores.sort((a, b) => b.combined - a.combined);
        const trimmedScores = scores.slice(0, 50);
        
        const encryptedData = await storageEncryption.encrypt(trimmedScores);
        if (encryptedData) {
            localStorage.setItem('bipardy-local-scores', JSON.stringify(encryptedData));
        }
        
        return trimmedScores;
    } catch (error) {
        console.error('Error saving local score:', error);
        return await getLocalScores();
    }
}

async function getPersonalBest(gameLength) {
    const scores = await getLocalScores();
    const personalBests = scores.filter(score => score.gameLength === gameLength);
    return personalBests.length > 0 ? personalBests[0] : null;
}

// Global Leaderboard (GitHub-based)
// Cache for global leaderboard data
let globalLeaderboardCache = {
    data: null,
    timestamp: 0,
    ttl: 30000 // 30 seconds cache
};

// Clear the global leaderboard cache (used after successful score submission)
function clearGlobalLeaderboardCache() {
    globalLeaderboardCache.data = null;
    globalLeaderboardCache.timestamp = 0;
}

async function loadGlobalLeaderboard() {
    try {
        // Return empty array for localhost with friendly message
        if (!IS_PRODUCTION) {
            return [];
        }
        
        const now = Date.now();
        
        // Return cached data if it's still fresh
        if (globalLeaderboardCache.data && 
            (now - globalLeaderboardCache.timestamp) < globalLeaderboardCache.ttl) {
            return globalLeaderboardCache.data;
        }
        
        // Fetch fresh data
        const response = await fetch('/.netlify/functions/get-leaderboard');
        if (!response.ok) throw new Error('Failed to load global leaderboard');
        const data = await response.json();
        
        // Update cache
        globalLeaderboardCache.data = data;
        globalLeaderboardCache.timestamp = now;
        
        return data;
    } catch (error) {
        console.error('Error loading global leaderboard:', error);
        
        // Return cached data if available, even if stale
        if (globalLeaderboardCache.data) {
            console.warn('Using stale cached leaderboard data due to fetch error');
            return globalLeaderboardCache.data;
        }
        
        return [];
    }
}

async function submitGlobalScore(name, scoreData) {
    try {
        const gameTime = Math.round((Date.now() - gameStartTime) / 1000);
        const timestamp = Date.now();
        const payload = {
            ...scoreData,
            name: name.trim(),
            gameTime: gameTime,
            timestamp: timestamp
        };

        // Add basic request integrity check
        const payloadString = JSON.stringify(payload);
        const payloadHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payloadString + timestamp));
        const hashArray = Array.from(new Uint8Array(payloadHash));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const response = await fetch('/.netlify/functions/submit-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Request-Hash': hashHex,
                'X-Request-Time': timestamp.toString()
            },
            body: payloadString
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to submit global score');
        }

        // Clear cache on successful submission so fresh leaderboard is fetched
        clearGlobalLeaderboardCache();
        
        return await response.json();
    } catch (error) {
        console.error('Error submitting global score:', error);
        throw error;
    }
}

// Combined leaderboard loading
async function loadLeaderboard() {
    if (currentLeaderboardView === 'local') {
        return await getLocalScores();
    } else {
        return await loadGlobalLeaderboard();
    }
}

// Check if a score qualifies for global leaderboard submission
async function checkGlobalEligibility(playerScore) {
    try {
        // Validate input - more comprehensive validation
        if (!playerScore || 
            !playerScore.hasOwnProperty('combined') || 
            typeof playerScore.combined !== 'number' || 
            isNaN(playerScore.combined)) {
            throw new Error('Invalid player score data');
        }
        
        const globalScores = await loadGlobalLeaderboard();
        
        // Validate global scores data
        if (!Array.isArray(globalScores)) {
            throw new Error('Invalid global scores data');
        }
        
        // If leaderboard has less than 21 entries, always eligible (with minimum threshold)
        const MINIMUM_THRESHOLD = 500; // Prevent very low scores even on empty leaderboard
        
        if (globalScores.length < 21) {
            return {
                eligible: playerScore.combined >= MINIMUM_THRESHOLD,
                minScore: MINIMUM_THRESHOLD,
                rank: playerScore.combined >= MINIMUM_THRESHOLD ? 
                    globalScores.filter(s => s.combined > playerScore.combined).length + 1 : null,
                totalEntries: globalScores.length
            };
        }
        
        // Get the 21st place score as threshold (array is 0-indexed, so index 20 = 21st place)
        // But first ensure we actually have at least 21 scores
        const minScore = globalScores.length >= 21 ? globalScores[20].combined : MINIMUM_THRESHOLD;
        
        // Check if player's score beats the threshold
        const betterScores = globalScores.filter(s => s.combined > playerScore.combined);
        const eligible = playerScore.combined > minScore;
        
        return {
            eligible: eligible,
            minScore: minScore,
            rank: eligible ? betterScores.length + 1 : null,
            totalEntries: globalScores.length,
            scoreNeeded: eligible ? 0 : minScore - playerScore.combined + 1
        };
    } catch (error) {
        console.error('Error checking global eligibility:', error);
        
        // Re-throw validation errors so tests can catch them
        if (error.message === 'Invalid player score data') {
            throw error;
        }
        
        // For other errors (network, etc.), return fallback with safe threshold
        const FALLBACK_THRESHOLD = 500; // Same as minimum threshold for consistency
        return {
            eligible: playerScore && playerScore.combined >= FALLBACK_THRESHOLD,
            minScore: FALLBACK_THRESHOLD,
            rank: null,
            totalEntries: 0,
            error: true
        };
    }
}

function displayLeaderboard(leaderboard, currentPlayerRank = null, highlightScore = null) {
    const leaderboardList = document.getElementById('leaderboardList');
    
    if (leaderboard.length === 0) {
        const viewType = currentLeaderboardView === 'local' ? 'local scores' : 'global scores';
        
        // Clear and create header using safer DOM methods
        leaderboardList.innerHTML = '';
        
        const header = document.createElement('div');
        header.className = 'leaderboard-header';
        
        ['Rank', 'Name', 'Words', 'Time', 'Score'].forEach(text => {
            const div = document.createElement('div');
            div.className = `leaderboard-${text.toLowerCase()}`;
            div.textContent = text;
            header.appendChild(div);
        });
        
        const emptyMessage = document.createElement('div');
        emptyMessage.style.cssText = 'text-align: center; color: rgba(255, 255, 255, 0.6); padding: 20px;';
        emptyMessage.textContent = `No ${viewType} yet. ${currentLeaderboardView === 'local' ? 'Play a game!' : 'Be the first!'}`;
        
        leaderboardList.appendChild(header);
        leaderboardList.appendChild(emptyMessage);
        return;
    }

    // Clear and create header using safer DOM methods
    leaderboardList.innerHTML = '';
    
    const header = document.createElement('div');
    header.className = 'leaderboard-header';
    
    ['Rank', 'Name', 'Words', 'Time', 'Score'].forEach(text => {
        const div = document.createElement('div');
        div.className = `leaderboard-${text.toLowerCase()}`;
        div.textContent = text;
        header.appendChild(div);
    });
    
    leaderboardList.appendChild(header);

    // Create entries using DocumentFragment for optimal performance
    const fragment = document.createDocumentFragment();
    
    leaderboard.forEach((entry, index) => {
        const rank = index + 1;
        const isCurrentPlayer = currentPlayerRank === rank;
        const isHighlighted = highlightScore && 
            entry.combined === highlightScore.combined && 
            entry.timestamp === highlightScore.timestamp;
        const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';
        const currentClass = (isCurrentPlayer || isHighlighted) ? 'current-player' : '';
        
        const entryDiv = document.createElement('div');
        entryDiv.className = `leaderboard-entry ${rankClass} ${currentClass}`.trim();
        if (isCurrentPlayer || isHighlighted) {
            entryDiv.id = 'current-player-entry';
        }
        
        // Create rank element
        const rankDiv = document.createElement('div');
        rankDiv.className = 'leaderboard-rank';
        rankDiv.textContent = `#${rank}`;
        
        // Create name element with safe text content
        const nameDiv = document.createElement('div');
        nameDiv.className = 'leaderboard-name';
        nameDiv.textContent = sanitizeForDisplay(entry.name);
        
        // Create other elements
        const wordsDiv = document.createElement('div');
        wordsDiv.className = 'leaderboard-game-length';
        wordsDiv.textContent = entry.words || 0;
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'leaderboard-game-time';
        timeDiv.textContent = `${entry.gameTime || 0}s`;
        
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'leaderboard-score';
        scoreDiv.textContent = entry.combined.toLocaleString();
        
        // Append all elements to entry
        entryDiv.appendChild(rankDiv);
        entryDiv.appendChild(nameDiv);
        entryDiv.appendChild(wordsDiv);
        entryDiv.appendChild(timeDiv);
        entryDiv.appendChild(scoreDiv);
        
        // Add entry to fragment instead of direct DOM append
        fragment.appendChild(entryDiv);
    });
    
    // Single DOM operation to append all entries at once
    leaderboardList.appendChild(fragment);

    // Scroll to current player if they're not visible
    if ((currentPlayerRank && currentPlayerRank > 7) || highlightScore) {
        const currentPlayerElement = document.getElementById('current-player-entry');
        if (currentPlayerElement) {
            setTimeout(() => {
                currentPlayerElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 100);
        }
    }
}

// Tab functionality
function switchLeaderboardView(view) {
    currentLeaderboardView = view;
    
    // Update tab styling
    document.getElementById('localTabBtn').classList.toggle('active', view === 'local');
    document.getElementById('globalTabBtn').classList.toggle('active', view === 'global');
    
    // Load and display the appropriate leaderboard
    loadLeaderboard().then(leaderboard => {
        displayLeaderboard(leaderboard);
    });
}

function updateRankStatus(result, isLocal = false) {
    const rankStatus = document.getElementById('rankStatus');
    const leaderboardType = isLocal ? 'local' : 'global';
    
    if (isLocal) {
        rankStatus.innerHTML = `💾 Score saved locally only! Check your personal best in the Local tab.`;
        rankStatus.className = 'rank-status made-leaderboard';
    } else if (result && result.madeLeaderboard && result.rank) {
        rankStatus.innerHTML = `🎉 Saved locally + rank #${result.rank} on global leaderboard! 🎉`;
        rankStatus.className = 'rank-status made-leaderboard';
    } else if (result) {
        rankStatus.innerHTML = `🌍 Saved locally + shared globally, but didn't make top 12. Keep practicing!`;
        rankStatus.className = 'rank-status no-leaderboard';
    } else {
        rankStatus.innerHTML = `❌ Failed to share globally. Your score is saved locally.`;
        rankStatus.className = 'rank-status no-leaderboard';
    }
}

async function showPersonalBestInfo(scoreEntry, gameLength) {
    const personalBest = await getPersonalBest(gameLength);
    const rankStatus = document.getElementById('rankStatus');
    
    if (personalBest && scoreEntry.combined > personalBest.combined) {
        rankStatus.innerHTML = `🏆 NEW PERSONAL BEST! Previous best: ${personalBest.combined.toLocaleString()}`;
        rankStatus.className = 'rank-status made-leaderboard';
    } else if (personalBest) {
        rankStatus.innerHTML = `📈 Personal best for ${gameLength}w: ${personalBest.combined.toLocaleString()}`;
        rankStatus.className = 'rank-status no-leaderboard';
    } else {
        rankStatus.innerHTML = `🎯 First ${gameLength}-word game completed!`;
        rankStatus.className = 'rank-status made-leaderboard';
    }
}

// Show game end screen
async function showGameEndScreen(triggeringPlayerIndex) {
    // Security: Prevent race conditions
    if (showGameEndScreen.inProgress) return;
    showGameEndScreen.inProgress = true;
    
    try {
        const gameEndScreen = document.getElementById('gameEndScreen');
        const gameEndTitle = document.getElementById('gameEndTitle');
        const winnerName = document.getElementById('winnerName');
        const finalStats = document.getElementById('finalStats');
        const leaderboardSection = document.getElementById('leaderboardSection');
    
    // For multiplayer, determine winner by combined score
    if (numPlayers > 1) {
        const winnerIndex = findWinner();
        gameEndTitle.textContent = 'We Have a Winner!';
        winnerName.textContent = `🎉 ${players[winnerIndex].name} Wins! 🎉`;
        
        // Show leaderboard for multiplayer - allow all players to submit
        leaderboardSection.style.display = 'block';
        
        // Find all players with qualifying scores and prepare them for submission
        const qualifyingPlayers = [];
        players.forEach((player, index) => {
            const combinedScore = calculateCombinedScore(player);
            // Check if player has a reasonable score (more than 0)
            if (combinedScore > 0) {
                qualifyingPlayers.push({
                    index: index,
                    player: player,
                    combinedScore: combinedScore,
                    scoreEntry: {
                        score: player.score,
                        streak: player.streak,
                        words: player.words,
                        combined: combinedScore,
                        gameLength: gameLength,
                        timestamp: new Date().toISOString(),
                        gameTime: Math.round((Date.now() - gameStartTime) / 1000)
                    }
                });
            }
        });
        
        // Set up submission context for multiplayer
        if (qualifyingPlayers.length > 0) {
            // Automatically save all qualifying players to local leaderboard
            for (const playerData of qualifyingPlayers) {
                const scoreEntryWithName = { ...playerData.scoreEntry, name: playerData.player.name };
                await saveLocalScore(scoreEntryWithName);
            }
            
            // Store qualifying players for potential global submission
            window.multiplayerQualifyingScores = qualifyingPlayers;
            
            // Use the winner's score as the default global submission target
            const winnerData = qualifyingPlayers.find(p => p.index === winnerIndex);
            if (winnerData) {
                currentPlayerScore = winnerData.scoreEntry;
                
                // Reset submission flags
                scoreSubmittedLocally = true; // Already saved locally above
                scoreSubmittedGlobally = false;
                resetSubmissionButtons();
                
                // Check global leaderboard eligibility for winner
                updateGlobalEligibility(winnerData.scoreEntry);
                
                // Pre-fill the name input with the winner's name (filtered)
                const filteredWinnerName = winnerData.player.name.replace(/[^A-Z0-9]/gi, '').toUpperCase();
                document.getElementById('playerNameInput').value = filteredWinnerName;
                
                // Show multiplayer submission info
                document.getElementById('multiplayerSubmissionInfo').style.display = 'block';
                
                // Update rank status to show local saves
                updateRankStatus(null, true);
            }
        }
        
        // Show all players' stats with combined scores
        finalStats.innerHTML = '';
        players.forEach((player, index) => {
            const combinedScore = calculateCombinedScore(player);
            const playerContainer = document.createElement('div');
            playerContainer.className = 'player-final-stats';
            if (index === winnerIndex) {
                playerContainer.style.border = '2px solid #feca57';
                playerContainer.style.background = 'rgba(254, 202, 87, 0.1)';
            }
            
            playerContainer.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 15px; color: ${index === winnerIndex ? '#feca57' : '#fff'}; text-align: center;">
                    ${safeDisplayUserData(player.name)}
                </div>
                <div class="stat-card large-score">
                    <div class="stat-value">${combinedScore.toLocaleString()}</div>
                    <div class="stat-label">Combined Score</div>
                </div>
                <div class="small-stats-row">
                    <div class="stat-card small">
                        <div class="stat-value">${player.score}</div>
                        <div class="stat-label">Points</div>
                    </div>
                    <div class="stat-card small">
                        <div class="stat-value">${player.streak}</div>
                        <div class="stat-label">Streak</div>
                    </div>
                    <div class="stat-card small">
                        <div class="stat-value">${player.words}</div>
                        <div class="stat-label">Words</div>
                    </div>
                    <div class="stat-card small">
                        <div class="stat-value">${Math.round((Date.now() - gameStartTime) / 1000)}s</div>
                        <div class="stat-label">Time</div>
                    </div>
                </div>
            `;
            finalStats.appendChild(playerContainer);
        });
    } else {
        // Single player - show personal stats and leaderboard
        gameEndTitle.textContent = 'Game Complete!';
        winnerName.textContent = '🎯 Great Job! 🎯';
        
        const player = players[0];
        const combinedScore = calculateCombinedScore(player);
        
        // Create score entry
        const scoreEntry = {
            score: player.score,
            streak: player.streak,
            words: player.words,
            combined: combinedScore,
            gameLength: gameLength,
            timestamp: new Date().toISOString(),
            gameTime: Math.round((Date.now() - gameStartTime) / 1000)
        };
        
        // Store current player score for optional global submission
        currentPlayerScore = scoreEntry;
        
        // Reset submission flags for new score
        scoreSubmittedLocally = false;
        scoreSubmittedGlobally = false;
        
        // Reset button states
        resetSubmissionButtons();
        
        // Check global leaderboard eligibility
        updateGlobalEligibility(scoreEntry);
        
        finalStats.innerHTML = `
            <div class="player-final-stats">
                <div class="stat-card large-score">
                    <div class="stat-value">${combinedScore.toLocaleString()}</div>
                    <div class="stat-label">Combined Score</div>
                </div>
                <div class="small-stats-row">
                    <div class="stat-card small">
                        <div class="stat-value">${player.score}</div>
                        <div class="stat-label">Points</div>
                    </div>
                    <div class="stat-card small">
                        <div class="stat-value">${player.streak}</div>
                        <div class="stat-label">Streak</div>
                    </div>
                    <div class="stat-card small">
                        <div class="stat-value">${player.words}</div>
                        <div class="stat-label">Words</div>
                    </div>
                    <div class="stat-card small">
                        <div class="stat-value">${Math.round((Date.now() - gameStartTime) / 1000)}s</div>
                        <div class="stat-label">Time</div>
                    </div>
                </div>
            </div>
        `;
        
        // Show leaderboard section for single player
        leaderboardSection.style.display = 'block';
        
        // Show personal best info initially
        await showPersonalBestInfo(scoreEntry, gameLength);
        
        // Load and display local leaderboard by default
        currentLeaderboardView = 'local';
        loadLeaderboard().then(leaderboard => {
            displayLeaderboard(leaderboard);
        });
        
        // Pre-fill name input with player name if available (filtered)
        const nameInput = document.getElementById('playerNameInput');
        const filteredPlayerName = (player.name || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
        nameInput.value = filteredPlayerName;
    }
    
    // Enable body scrolling for the modal
    document.body.style.overflow = 'auto';
    
    // Show the screen
    gameEndScreen.style.display = 'flex';
    
    } finally {
        // Security: Always reset race condition flag
        showGameEndScreen.inProgress = false;
    }
}

// Event listeners
submitButton.addEventListener('click', checkGuess);
helpButton.addEventListener('click', help);
skipButton.addEventListener('click', skip);

// Attribution - no longer clickable (donation moved to README)

// Reset game with same player names
function resetGameWithSamePlayers() {
    // Save player names and count
    const savedNames = players.map(p => p.name);
    const savedNumPlayers = numPlayers;
    
    // Store in sessionStorage for after page redirect
    sessionStorage.setItem('playerNames', JSON.stringify(savedNames));
    sessionStorage.setItem('numPlayers', savedNumPlayers.toString());
    sessionStorage.setItem('gameLength', gameLength.toString());
    
    // Redirect to donate page
    window.location.href = 'donate.html';
}

// Continue button handler
document.getElementById('continueButton').addEventListener('click', () => {
    resetGameWithSamePlayers();
});

// Tab switching event handlers
document.getElementById('localTabBtn').addEventListener('click', () => {
    switchLeaderboardView('local');
});

document.getElementById('globalTabBtn').addEventListener('click', () => {
    switchLeaderboardView('global');
});

// Local score submission handler
document.getElementById('submitLocalBtn').addEventListener('click', async () => {
    const nameInput = document.getElementById('playerNameInput');
    const localBtn = document.getElementById('submitLocalBtn');
    const name = nameInput.value.trim();

    const validatedName = validatePlayerName(name);
    if (!validatedName) {
        nameInput.focus();
        nameInput.style.borderColor = '#ff6b6b';
        nameInput.placeholder = name.length === 0 ? 'Name required (A-Z, 0-9, 3-12 chars)' : 
                               name.length < 3 ? `Too short - need ${3 - name.length} more chars` :
                               'Name too long - max 12 chars';
        setTimeout(() => {
            nameInput.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            nameInput.placeholder = 'Enter your name (A-Z, 0-9, 3-12 chars)';
        }, 3000);
        return;
    }

    if (!currentPlayerScore) {
        alert('No score data available');
        return;
    }

    if (scoreSubmittedLocally) {
        return; // Button should already be disabled and show saved state
    }

    // Check if this exact score was already submitted
    if (isScoreAlreadySubmitted(validatedName, currentPlayerScore.combined, currentPlayerScore.timestamp)) {
        alert('This score has already been submitted locally!');
        return;
    }

    // Disable button and show loading state
    localBtn.disabled = true;
    localBtn.textContent = 'Saving...';

    try {
        // Add name to score entry and save locally
        const scoreEntryWithName = { ...currentPlayerScore, name: validatedName };
        const updatedScores = await saveLocalScore(scoreEntryWithName);
        
        // Update rank status
        updateRankStatus(null, true);
        
        // Switch to local view and refresh leaderboard
        currentLeaderboardView = 'local';
        switchLeaderboardView('local');
        const rank = updatedScores.findIndex(entry => 
            entry.combined === scoreEntryWithName.combined && 
            entry.timestamp === scoreEntryWithName.timestamp
        ) + 1;
        displayLeaderboard(updatedScores, rank, scoreEntryWithName);
        
        // Show social sharing options
        showSocialSharing(scoreEntryWithName, rank, 'locally');
        
        // Mark as submitted locally
        scoreSubmittedLocally = true;
        
        // Add to submitted scores to prevent duplicates
        const scoreId = generateScoreId(validatedName, currentPlayerScore.combined, currentPlayerScore.timestamp);
        addSubmittedScore(scoreId);
        
        // Update button states
        updateSubmissionButtons();
        
        // Hide submission form
        document.getElementById('leaderboardSubmit').style.display = 'none';
        
    } catch (error) {
        alert('Failed to save score locally: ' + error.message);
        localBtn.disabled = false;
        localBtn.textContent = '💾 Save Locally Only';
    }
});

// Global score submission handler
document.getElementById('submitGlobalBtn').addEventListener('click', async () => {
    const nameInput = document.getElementById('playerNameInput');
    const globalBtn = document.getElementById('submitGlobalBtn');
    const localBtn = document.getElementById('submitLocalBtn');
    const name = nameInput.value.trim();

    const validatedName = validatePlayerName(name);
    if (!validatedName) {
        nameInput.focus();
        nameInput.style.borderColor = '#ff6b6b';
        nameInput.placeholder = name.length === 0 ? 'Name required (A-Z, 0-9, 3-12 chars)' : 
                               name.length < 3 ? `Too short - need ${3 - name.length} more chars` :
                               'Name too long - max 12 chars';
        setTimeout(() => {
            nameInput.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            nameInput.placeholder = 'Enter your name (A-Z, 0-9, 3-12 chars)';
        }, 3000);
        return;
    }

    if (!currentPlayerScore) {
        alert('No score data available');
        return;
    }

    if (scoreSubmittedGlobally) {
        return; // Button should already be disabled and show shared state
    }

    // Check if running on localhost
    if (!IS_PRODUCTION) {
        alert('Global leaderboard requires deployment to production environment.\nFor now, use "Save Locally Only" option.');
        return;
    }

    // Generate score ID and check if already submitted
    const scoreId = generateScoreId(validatedName, currentPlayerScore.combined, currentPlayerScore.timestamp);
    if (isScoreAlreadySubmitted(validatedName, currentPlayerScore.combined, currentPlayerScore.timestamp)) {
        alert('This score has already been submitted!');
        return;
    }

    // Mark as submitted IMMEDIATELY to prevent retry duplicates
    addSubmittedScore(scoreId);

    // Double-check eligibility as a final safeguard (prevent client-side bypassing)
    try {
        const finalEligibilityCheck = await checkGlobalEligibility(currentPlayerScore);
        if (!finalEligibilityCheck.eligible) {
            alert(`Score does not qualify for global leaderboard. Minimum required: ${finalEligibilityCheck.minScore}`);
            // Remove the score from submitted list since we're not actually submitting
            const submittedScores = getSubmittedScores();
            const filteredScores = submittedScores.filter(id => id !== scoreId);
            localStorage.setItem('submittedScores', JSON.stringify(filteredScores));
            return;
        }
    } catch (error) {
        console.warn('Could not verify final eligibility, proceeding with submission:', error);
        // Continue with submission if eligibility check fails
    }

    // Disable both buttons and show loading state
    globalBtn.disabled = true;
    localBtn.disabled = true;
    globalBtn.textContent = 'Sharing...';

    try {
        // First save locally as backup (this is the working approach from yesterday)
        const scoreEntryWithName = { ...currentPlayerScore, name: validatedName };
        await saveLocalScore(scoreEntryWithName);
        
        // Then try to submit globally
        const result = await submitGlobalScore(validatedName, currentPlayerScore);
        
        // Update rank status
        updateRankStatus(result, false);
        
        // Switch to global view and refresh leaderboard
        currentLeaderboardView = 'global';
        switchLeaderboardView('global');
        const leaderboard = await loadGlobalLeaderboard();
        displayLeaderboard(leaderboard, result.rank);
        
        // Show social sharing options with global rank
        if (result && result.rank) {
            const scoreEntryWithName = { ...currentPlayerScore, name: validatedName };
            showSocialSharing(scoreEntryWithName, result.rank, 'globally');
        }
        
        // Mark as submitted globally (and locally since global saves locally first)
        scoreSubmittedGlobally = true;
        scoreSubmittedLocally = true;
        
        // Update button states
        updateSubmissionButtons();
        
        // Hide submission form
        document.getElementById('leaderboardSubmit').style.display = 'none';
        
    } catch (error) {
        console.error('Global submission failed:', error);
        
        // Update rank status to show it's saved locally but failed globally
        updateRankStatus(null, true);
        
        // Mark as submitted locally only (already saved locally as backup above)
        scoreSubmittedLocally = true;
        
        // Update button states
        updateSubmissionButtons();
        
        // Re-enable global button since it failed
        globalBtn.disabled = false;
        globalBtn.textContent = '🌍 Share Globally (retry)';
        globalBtn.style.opacity = '1';
        
        alert('Global submission failed, but score was saved locally. You can retry global sharing.');
    }
});

// Enhanced name input validation and filtering
function validatePlayerName(name) {
    const filtered = sanitizeName(name);
    return filtered.length >= 3 && filtered.length <= 12 ? filtered : null;
}

document.getElementById('playerNameInput').addEventListener('input', (e) => {
    const input = e.target;
    const original = input.value;
    const filtered = sanitizeName(original);
    
    // Apply filtering
    if (original !== filtered) {
        input.value = filtered;
    }
    
    // Visual feedback for length requirements
    if (filtered.length < 3) {
        input.style.borderColor = '#ff6b6b';
    } else if (filtered.length > 12) {
        input.value = filtered.substring(0, 12);
        input.style.borderColor = '#feca57';
    } else {
        input.style.borderColor = '#00b894';
    }
});

// Handle paste events with validation
document.getElementById('playerNameInput').addEventListener('paste', (e) => {
    setTimeout(() => {
        const input = e.target;
        const filtered = sanitizeName(input.value);
        if (filtered.length > 12) {
            input.value = filtered.substring(0, 12);
        } else {
            input.value = filtered;
        }
    }, 0);
});

// Allow Enter key to submit to local (default)
document.getElementById('playerNameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('submitLocalBtn').click();
    }
});

// Handle keyboard locking for game end screen name input
document.getElementById('playerNameInput').addEventListener('focus', () => {
    keyboardLocked = true;
});

document.getElementById('playerNameInput').addEventListener('blur', () => {
    keyboardLocked = false;
});

// Language detection and README redirect
function getLanguageReadmePage() {
    const userLang = navigator.language || navigator.userLanguage;
    const langCode = userLang.split('-')[0].toLowerCase();
    
    const languageMap = {
        'de': 'readme-de.html',
        'es': 'readme-es.html', 
        'fr': 'readme-fr.html',
        'it': 'readme-it.html',
        'ja': 'readme-ja.html'
    };
    
    return languageMap[langCode] || 'readme-page.html';
}

// README button handler with language detection
document.getElementById('readmeButton').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = getLanguageReadmePage();
});

// Keyboard event listeners
document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => {
        if (!key.classList.contains('disabled')) {
            handleKeyPress(key.dataset.key);
        }
    });
});

// Physical keyboard support
document.addEventListener('keydown', (e) => {
    if (!gameActive || keyboardLocked) return;
    
    if (e.key === 'Backspace') {
        handleKeyPress('backspace');
    } else if (e.key === 'Enter') {
        handleKeyPress('enter');
    } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toLowerCase());
    }
});

// Toggle game length
gameLengthToggle.addEventListener('click', () => {
    gameLength = gameLength === 12 ? 24 : 12;
    gameLengthLabel.textContent = `Game length: ${gameLength} words`;
    gameLengthToggle.classList.toggle('active');
});

// Initialize game length toggle to always show orange background
gameLengthToggle.classList.add('always-active');

// Toggle word length display
lengthToggle.addEventListener('click', () => {
    showWordLength = !showWordLength;
    playerToggleSettings[currentPlayer] = showWordLength; // Remember setting for current player
    toggleUsedThisRound = true; // Mark that toggle was used this round
    lengthToggle.classList.toggle('active');
    
    // Update help button text based on new toggle state
    updateHelpButtonText();
    
    displayWord();
});


// Player selector
playerSelector.addEventListener('click', (e) => {
    if (e.target.classList.contains('player-btn')) {
        // Restore body overflow when starting new game
        document.body.style.overflow = 'hidden';
        
        document.querySelectorAll('.player-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        numPlayers = parseInt(e.target.dataset.players);
        initializePlayers(numPlayers);
        newWord();
    }
});

// Prevent scrolling on mobile except in specific areas
if (isMobile) {
    document.addEventListener('touchmove', function(e) {
        // Allow scrolling in game end screen, app container, and leaderboard
        if (!e.target.closest('.app-container') && 
            !e.target.closest('.game-end-screen') && 
            !e.target.closest('.leaderboard-list')) {
            e.preventDefault();
        }
    }, { passive: false });
}


// Fallback shuffleArray function in case module loading fails
function fallbackShuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Game initialization function - called after modules are loaded
function initializeGame() {
    
    // Check if shuffleArray is available, use fallback if not
    if (typeof window.shuffleArray !== 'function') {
        window.shuffleArray = fallbackShuffleArray;
    }
    
    // Check for saved player names from previous session
    if (sessionStorage.getItem('playerNames')) {
        try {
            // Security: Parse and validate sessionStorage data
            const savedNamesRaw = sessionStorage.getItem('playerNames');
            const savedNumPlayersRaw = sessionStorage.getItem('numPlayers');
            const savedGameLengthRaw = sessionStorage.getItem('gameLength');
            
            // Clear the session storage immediately to prevent reuse
            sessionStorage.removeItem('playerNames');
            sessionStorage.removeItem('numPlayers');
            sessionStorage.removeItem('gameLength');
            
            // Validate and sanitize JSON data
            let savedNames = [];
            if (savedNamesRaw) {
                const parsedNames = JSON.parse(savedNamesRaw);
                if (Array.isArray(parsedNames)) {
                    savedNames = parsedNames.filter(name => 
                        typeof name === 'string' && 
                        name.length >= 1 && 
                        name.length <= 20 &&
                        /^[a-zA-Z0-9\s\-_.]{1,20}$/.test(name)
                    );
                }
            }
            
            // Validate numeric parameters
            const savedNumPlayers = Math.max(1, Math.min(4, parseInt(savedNumPlayersRaw) || 1));
            const savedGameLength = [12, 24].includes(parseInt(savedGameLengthRaw)) ? 
                                    parseInt(savedGameLengthRaw) : gameLength;
            
            // Apply validated game parameters
            if (savedGameLength !== gameLength) {
                gameLength = savedGameLength;
                gameLengthLabel.textContent = `Game length: ${gameLength} words`;
                if (gameLength === 24) {
                    gameLengthToggle.classList.add('active');
                }
            }
            
            // Initialize with validated number of players
            initializePlayers(savedNumPlayers);
            
            // Restore sanitized player names
            if (savedNames.length > 0) {
                savedNames.forEach((name, index) => {
                    if (players[index] && name) {
                        // Additional sanitization layer
                        players[index].name = sanitizeForDisplay(name);
                    }
                });
            }
            
            // Update display and start
            updateScoreDisplay();
            
        } catch (error) {
            // Security: If sessionStorage data is corrupted, start fresh
            initializePlayers(1);
        }
    } else {
        initializePlayers(1);
    }
    
    // Initialize word selection system
    initializeWordSelectionSystem();
    
    // Initialize matrix background
    initMatrixRain();
    
    // Start the first word
    newWord();
}

// Make initializeGame globally available
window.initializeGame = initializeGame;

// Matrix Rain Background Effect - Optimized
function initMatrixRain() {
    const matrixContainer = document.getElementById('matrixContainer');
    
    if (!matrixContainer) {
        console.error('Matrix container not found! Background will not work.');
        return;
    }
    
    const columns = Math.floor(window.innerWidth / 35);
    let matrixBoxCount = 0;
    const MAX_BOXES = Math.min(50, columns * 1.5); // 50 boxes for better visual effect
    
    function createMatrixBox() {
        // Don't create more than MAX_BOXES at once
        if (matrixBoxCount >= MAX_BOXES) return;
        
        const box = document.createElement('div');
        box.className = `matrix-box shade-${Math.floor(Math.random() * 3) + 1}`;
        
        // Random position
        const column = Math.floor(Math.random() * columns);
        const xPos = column * 35 + Math.random() * 25;
        box.style.left = xPos + 'px';
        box.style.top = '-50px'; // Start above viewport to match animation
        
        // Random animation duration for different speeds
        const duration = 12 + Math.random() * 18;
        box.style.animationDuration = duration + 's';
        box.style.animationDelay = Math.random() * 2 + 's';
        
        const size = 20 + Math.random() * 15;
        box.style.width = size + 'px';
        box.style.height = size + 'px';
        
        matrixContainer.appendChild(box);
        matrixBoxCount++;
        
        // Clean removal without recursive setTimeout
        box.addEventListener('animationend', () => {
            box.remove();
            matrixBoxCount--;
        }, { once: true }); // Remove listener after first use
    }
    
    // Use single interval instead of recursive timeouts
    const matrixInterval = setInterval(() => {
        if (matrixBoxCount < MAX_BOXES) {
            createMatrixBox();
        }
    }, 1000 + Math.random() * 1000); // Create new boxes every 1-2 seconds
    
    // Create initial boxes with faster timing
    for (let i = 0; i < 10; i++) {
        setTimeout(createMatrixBox, i * 200 + Math.random() * 500);
    }
}

// Note: Game initialization moved to initializeGame() function
// This is called from index.html after modules are loaded

// Social Sharing Functions
let currentShareData = null;

// Security: Validate and sanitize share data
function validateShareData(data) {
    if (!data || typeof data !== 'object') return null;
    
    try {
        // Validate numeric fields
        const score = parseInt(data.score);
        const streak = parseInt(data.streak);
        const words = parseInt(data.words);
        const rank = parseInt(data.rank);
        const gameTime = parseInt(data.gameTime);
        
        // Check ranges to prevent injection
        if (isNaN(score) || score < 0 || score > 50000) return null;
        if (isNaN(streak) || streak < 0 || streak > 1000) return null;
        if (isNaN(words) || words < 0 || words > 24) return null;
        if (isNaN(rank) || rank < 1 || rank > 1000) return null;
        if (isNaN(gameTime) || gameTime < 0 || gameTime > 7200) return null;
        
        // Validate string fields
        const listType = String(data.listType);
        if (!['locally', 'globally'].includes(listType)) return null;
        
        return {
            score: score,
            streak: streak,
            words: words,
            rank: rank,
            listType: listType,
            gameTime: gameTime
        };
    } catch (error) {
        if (DEBUG) console.warn('Share data validation failed:', error);
        return null;
    }
}

// Show social sharing section after successful score submission
function showSocialSharing(playerData, rank, listType) {
    // Security: Validate data before storing
    const validatedData = validateShareData({ ...playerData, rank, listType });
    if (!validatedData) {
        if (DEBUG) console.warn('Invalid share data provided');
        return;
    }
    
    currentShareData = validatedData;
    const socialSection = document.getElementById('socialShareSection');
    if (socialSection) {
        socialSection.style.display = 'block';
    }
}

// X/Twitter sharing
function shareOnX() {
    if (!currentShareData) return;
    
    // Security: Validate and sanitize all data before use
    const safeData = validateShareData(currentShareData);
    if (!safeData) return;
    
    const { score, streak, words, rank, listType, gameTime } = safeData;
    
    const tweetText = `I just scored ${score} points in BIPARDY! 🎯\n` +
                     `Ranked #${rank} ${listType}\n` +
                     `Streak: ${streak} | Words: ${words} | Time: ${gameTime}s\n\n` +
                     `Play the Bitcoin word game: https://seedmint.github.io/BIP39-QUIZ/\n` +
                     `#Bitcoin #BIP39 #WordGame #Gaming`;
    
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    
    // Security: Validate URL before opening
    if (tweetUrl.startsWith('https://twitter.com/intent/tweet?')) {
        window.open(tweetUrl, '_blank', 'noopener,noreferrer');
    }
}

// Nostr web client sharing
function shareOnNostrWeb() {
    if (!currentShareData) return;
    
    // Security: Validate and sanitize all data before use
    const safeData = validateShareData(currentShareData);
    if (!safeData) return;
    
    const { score, streak, words, rank, listType, gameTime } = safeData;
    
    const nostrText = `Just scored ${score} points in #BIPARDY! 🎯\n` +
                     `Ranked #${rank} ${listType}\n` +
                     `Streak: ${streak} | Words: ${words} | Time: ${gameTime}s\n\n` +
                     `Try the Bitcoin word game: https://seedmint.github.io/BIP39-QUIZ/\n` +
                     `#Bitcoin #BIP39 #WordGame #Gaming #Nostr`;
    
    const nostrUrl = `https://snort.social/notes/compose?text=${encodeURIComponent(nostrText)}`;
    
    // Security: Validate URL before opening
    if (nostrUrl.startsWith('https://snort.social/notes/compose?')) {
        window.open(nostrUrl, '_blank', 'noopener,noreferrer');
    }
}

// Copy text and screenshot for Nostr native clients
async function copyNostrWithScreenshot() {
    if (!currentShareData) return;
    
    try {
        // Security: Validate and sanitize all data before use
        const safeData = validateShareData(currentShareData);
        if (!safeData) {
            showToast('❌ Invalid data. Cannot share.', 'error');
            return;
        }
        
        const { score, streak, words, rank, listType, gameTime } = safeData;
        
        // Create formatted text for Nostr
        const nostrText = `Just scored ${score} points in #BIPARDY! 🎯\n` +
                         `Ranked #${rank} ${listType}\n` +
                         `Streak: ${streak} | Words: ${words} | Time: ${gameTime}s\n\n` +
                         `[Screenshot attached]\n\n` +
                         `Try it: https://seedmint.github.io/BIP39-QUIZ/\n` +
                         `#Bitcoin #BIP39 #WordGame #Gaming #Nostr`;
        
        // Security: Validate clipboard access before using
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
            throw new Error('Clipboard access not available');
        }
        
        // Copy text to clipboard first
        await navigator.clipboard.writeText(nostrText);
        
        // Generate screenshot
        await generateAndCopyScreenshot();
        
        // Show success message
        showToast('📋 Text copied! Screenshot ready to paste. Open your Nostr client!', 'success');
        
    } catch (error) {
        console.error('Copy failed:', error);
        showToast('❌ Copy failed. Please try again.', 'error');
    }
}

// Download screenshot function
async function downloadScreenshot() {
    if (!currentShareData) return;
    
    try {
        // Security: Validate data before use
        const safeData = validateShareData(currentShareData);
        if (!safeData) {
            showToast('❌ Invalid data. Cannot download.', 'error');
            return;
        }
        
        const canvas = await captureLeaderboardScreenshot();
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
            if (!blob) {
                showToast('❌ Failed to generate screenshot.', 'error');
                return;
            }
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            // Security: Sanitize filename to prevent path traversal
            const safeScore = Math.max(0, Math.min(99999, safeData.score));
            const safeRank = Math.max(1, Math.min(999, safeData.rank));
            const timestamp = Date.now();
            
            link.download = `bipardy-score-${safeScore}-rank${safeRank}-${timestamp}.png`;
            link.href = url;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up object URL after a delay to ensure download starts
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        });
        
        showToast('📸 Screenshot downloaded!', 'success');
        
    } catch (error) {
        console.error('Screenshot failed:', error);
        showToast('❌ Screenshot failed. Please try again.', 'error');
    }
}

// Generate and copy screenshot to clipboard
async function generateAndCopyScreenshot() {
    try {
        const canvas = await captureLeaderboardScreenshot();
        
        canvas.toBlob(async (blob) => {
            try {
                if (navigator.clipboard && navigator.clipboard.write) {
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            'image/png': blob
                        })
                    ]);
                } else {
                    // Fallback: auto-download if clipboard not supported
                    downloadScreenshot();
                }
            } catch (clipError) {
                console.warn('Clipboard image copy not supported:', clipError);
                // Auto-download as fallback
                downloadScreenshot();
            }
        });
        
    } catch (error) {
        throw error;
    }
}

// Capture leaderboard screenshot using html2canvas
async function captureLeaderboardScreenshot() {
    const leaderboardList = document.getElementById('leaderboardList');
    
    if (!leaderboardList) {
        throw new Error('Leaderboard not found');
    }
    
    // Security: Validate html2canvas is loaded
    if (typeof html2canvas === 'undefined') {
        throw new Error('Screenshot library not available');
    }
    
    // Security: Configure html2canvas with restricted options
    const options = {
        backgroundColor: '#24243e',
        scale: Math.min(2, window.devicePixelRatio || 1), // Limit scale to prevent memory exhaustion
        logging: false,
        useCORS: false, // Disable CORS to prevent external resource loading
        allowTaint: false, // Prevent tainted canvas
        foreignObjectRendering: false, // Disable foreign objects
        imageTimeout: 5000, // Set timeout to prevent hanging
        removeContainer: true,
        width: Math.min(leaderboardList.scrollWidth, 1200), // Limit dimensions
        height: Math.min(leaderboardList.scrollHeight, 800)
    };
    
    try {
        const canvas = await html2canvas(leaderboardList, options);
        
        // Security: Validate canvas output
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
            throw new Error('Invalid canvas generated');
        }
        
        // Security: Limit canvas size to prevent memory issues
        const maxArea = 1920 * 1080; // Max Full HD
        if (canvas.width * canvas.height > maxArea) {
            throw new Error('Canvas too large for security');
        }
        
        return canvas;
    } catch (error) {
        throw new Error(`Screenshot capture failed: ${error.message}`);
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    // Security: Validate and sanitize inputs
    if (typeof message !== 'string') return;
    
    // Limit message length to prevent DOM bloat
    const safeMessage = String(message).substring(0, 200);
    
    // Security: Validate type to prevent CSS injection
    const validTypes = ['info', 'success', 'error'];
    const safeType = validTypes.includes(type) ? type : 'info';
    
    // Limit number of toasts to prevent DOM spam
    const existingToasts = document.querySelectorAll('.toast');
    if (existingToasts.length >= 5) {
        existingToasts[0].remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${safeType}`;
    toast.textContent = safeMessage; // Safe: textContent prevents XSS
    
    // Security: Set styles safely without template literals
    const backgroundColors = {
        'success': '#4CAF50',
        'error': '#f44336', 
        'info': '#2196F3'
    };
    
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.background = backgroundColors[safeType];
    toast.style.color = 'white';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.fontWeight = '600';
    toast.style.zIndex = '10000';
    toast.style.animation = 'slideInRight 0.3s ease-out';
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (toast && toast.parentNode) {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                try {
                    if (toast && toast.parentNode) {
                        document.body.removeChild(toast);
                    }
                } catch (error) {
                    // Toast already removed, ignore
                }
            }, 300);
        }
    }, 3000);
}
