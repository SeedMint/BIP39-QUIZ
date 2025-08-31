/* =========================================== */
/* INITIALIZATION & PWA */
/* =========================================== */

// Detect if mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;


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

// BIP-39 wordlist - filtered to only include words with 5+ letters
const bip39Words = [
		  "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid", "acoustic", "acquire", "across", "act", "action", "actor", "actress", "actual", "adapt", "add", "addict", "address", "adjust", "admit", "adult", "advance", "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent", "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album", "alcohol", "alert", "alien", "all", "alley", "allow", "almost", "alone", "alpha", "already", "also", "alter", "always", "amateur", "amazing", "among", "amount", "amused", "analyst", "analyze", "anchor", "ancient", "anger", "angle", "angry", "animal", "ankle", "announce", "annual", "another", "answer", "ant", "anxiety", "any", "apart", "apology", "appear", "apple", "approve", "april", "arch", "arctic", "area", "arena", "argue", "arm", "armed", "armor", "army", "around", "arrange", "arrest", "arrive", "arrow", "art", "artist", "artwork", "ask", "aspect", "assault", "asset", "assist", "assume", "asthma", "athlete", "athletic", "atlas", "atom", "attack", "attend", "attitude", "attorney", "attract", "auction", "audit", "august", "aunt", "author", "auto", "autumn", "average", "avocado", "avoid", "awake", "aware", "away", "awesome", "awful", "awkward", "axis", "baby", "bachelor", "bacon", "badge", "bag", "balance", "balcony", "ball", "bamboo", "banana", "banner", "bar", "barely", "bargain", "barrel", "base", "basic", "basket", "battle", "beach", "bean", "beauty", "because", "become", "beef", "before", "begin", "behave", "behind", "believe", "below", "belt", "bench", "benefit", "best", "betray", "better", "between", "beyond", "bicycle", "bid", "bike", "bind", "biology", "bird", "birth", "bitter", "black", "blade", "blame", "blanket", "blast", "bleak", "bless", "blind", "blood", "blossom", "blouse", "blue", "blur", "blush", "board", "boat", "body", "boil", "bomb", "bone", "bonus", "book", "boost", "border", "boring", "borrow", "boss", "bottom", "bounce", "box", "boy", "bracket", "brain", "brand", "brass", "brave", "bread", "breeze", "brick", "bridge", "brief", "bright", "bring", "brisk", "broccoli", "broken", "bronze", "broom", "brother", "brown", "brush", "bubble", "buddy", "budget", "buffalo", "build", "bulb", "bulk", "bullet", "bundle", "bunker", "burden", "burger", "burst", "bus", "business", "butter", "buyer", "buzz", "cabbage", "cabin", "cable", "cactus", "cage", "cake", "call", "calm", "camera", "camp", "can", "canal", "cancel", "candy", "cannon", "canoe", "canvas", "canyon", "capable", "capital", "captain", "car", "carbon", "card", "cargo", "carpet", "carry", "cart", "case", "cash", "casino", "castle", "casual", "cat", "catalog", "catch", "category", "cattle", "caught", "cause", "caution", "cave", "ceiling", "celery", "cement", "census", "century", "ceramic", "certain", "chair", "chalk", "champion", "change", "chaos", "chapter", "charge", "cheap", "check", "cheese", "chef", "cherry", "chest", "chicken", "chief", "child", "chimney", "choice", "choose", "chronic", "chuckle", "chunk", "churn", "cigar", "cinnamon", "circle", "citizen", "city", "civil", "claim", "clap", "clarify", "claw", "clay", "clean", "clerk", "clever", "click", "client", "cliff", "climb", "clinic", "clip", "clock", "clog", "clone", "close", "cloth", "cloud", "club", "clump", "cluster", "clutch", "coach", "coast", "coconut", "code", "coffee", "coil", "coin", "collect", "color", "column", "combine", "come", "comfort", "comic", "common", "company", "concert", "conduct", "confirm", "connect", "consist", "console", "construct", "contact", "contain", "contest", "context", "continue", "control", "convey", "convince", "cook", "cool", "copper", "copy", "coral", "core", "corn", "correct", "cost", "cotton", "couch", "country", "couple", "course", "cousin", "cover", "coyote", "crack", "cradle", "craft", "cram", "crane", "crash", "crater", "crawl", "crazy", "cream", "credit", "creek", "crew", "cricket", "crime", "crisp", "critic", "crop", "cross", "crouch", "crowd", "crown", "crucial", "cruel", "cruise", "crumble", "crunch", "crush", "cry", "crystal", "cube", "culture", "cup", "cupboard", "curious", "current", "curve", "cushion", "custom", "cute", "cycle", "dad", "damage", "damp", "dance", "danger", "daring", "dash", "daughter", "dawn", "day", "deal", "debate", "debris", "decade", "december", "decide", "decline", "decorate", "decrease", "deer", "defense", "define", "degree", "delay", "deliver", "demand", "demise", "deny", "depart", "depend", "deposit", "depth", "deputy", "derive", "describe", "desert", "design", "desk", "despair", "destroy", "detail", "detect", "develop", "device", "devote", "diagram", "dial", "diamond", "diary", "dice", "diesel", "diet", "differ", "digital", "dignity", "dilemma", "dinner", "dinosaur", "direct", "dirt", "disagree", "discover", "disease", "dish", "dismiss", "disorder", "display", "distance", "divide", "divine", "divorce", "dizzy", "doctor", "document", "dog", "doll", "dolphin", "domain", "donate", "donkey", "donor", "door", "dose", "double", "dove", "draft", "dragon", "drama", "drastic", "draw", "dream", "dress", "drift", "drill", "drink", "drip", "drive", "drop", "drum", "dry", "duck", "dumb", "dune", "during", "dust", "dutch", "duty", "dwarf", "dynamic", "eager", "eagle", "early", "earn", "earth", "easily", "east", "easy", "echo", "ecology", "economy", "edge", "edit", "educate", "effort", "egg", "eight", "either", "elbow", "elder", "electric", "elegant", "element", "elephant", "elevator", "elite", "else", "embark", "embody", "embrace", "emerge", "emotion", "employ", "empower", "empty", "enable", "enact", "end", "endless", "endorse", "enemy", "energy", "enforce", "engage", "engine", "enhance", "enjoy", "enlist", "enough", "enrich", "enroll", "ensure", "enter", "entire", "entry", "envelope", "episode", "equal", "equip", "era", "erase", "erupt", "escape", "essay", "estate", "eternal", "ethics", "evidence", "evil", "evoke", "evolve", "exact", "example", "excess", "exchange", "excite", "exclude", "excuse", "execute", "exercise", "exhaust", "exhibit", "exile", "exist", "exit", "exotic", "expand", "expect", "expire", "explain", "expose", "express", "extend", "extra", "eye", "eyebrow", "fabric", "face", "faculty", "fade", "faint", "faith", "fall", "false", "fame", "family", "famous", "fan", "fancy", "fantasy", "farm", "fashion", "fast", "fat", "fatal", "father", "fatigue", "fault", "favorite", "feature", "february", "federal", "fee", "feed", "feel", "female", "fence", "festival", "fetch", "fever", "few", "fiber", "fiction", "field", "figure", "file", "film", "filter", "final", "find", "fine", "finger", "finish", "fire", "firm", "first", "fiscal", "fish", "fit", "fitness", "fix", "flag", "flame", "flash", "flat", "flavor", "flee", "flight", "flip", "float", "flock", "floor", "flower", "fluid", "flush", "fly", "foam", "focus", "fog", "foil", "fold", "follow", "food", "foot", "force", "forest", "forget", "fork", "fortune", "forum", "forward", "fossil", "foster", "found", "fox", "fragile", "frame", "frequent", "fresh", "friend", "fringe", "frog", "front", "frost", "frown", "frozen", "fruit", "fuel", "fun", "funny", "furnace", "fury", "future", "gadget", "gain", "galaxy", "gallery", "game", "gap", "garage", "garbage", "garden", "garlic", "garment", "gas", "gasp", "gate", "gather", "gauge", "gaze", "general", "genius", "genre", "gentle", "genuine", "gesture", "ghost", "giant", "gift", "giggle", "ginger", "giraffe", "girl", "give", "glad", "glance", "glare", "glass", "glide", "glimpse", "globe", "gloom", "glory", "glove", "glow", "glue", "goat", "goblin", "gold", "good", "goose", "gorilla", "gospel", "gossip", "govern", "gown", "grab", "grace", "grain", "grant", "grape", "grass", "gravity", "great", "green", "grid", "grief", "grit", "grocery", "group", "grow", "grunt", "guard", "guess", "guide", "guilt", "guitar", "gun", "gym", "habit", "hair", "half", "hammer", "hamster", "hand", "happy", "harbor", "hard", "harsh", "harvest", "hat", "have", "hawk", "hazard", "head", "health", "heart", "heavy", "hedgehog", "height", "hello", "helmet", "help", "hen", "hero", "hidden", "high", "hill", "hint", "hip", "hire", "history", "hobby", "hockey", "hold", "hole", "holiday", "hollow", "home", "honey", "hood", "hope", "horn", "horror", "horse", "hospital", "host", "hotel", "hour", "hover", "hub", "huge", "human", "humble", "humor", "hundred", "hungry", "hunt", "hurdle", "hurry", "hurt", "husband", "hybrid", "ice", "icon", "idea", "identify", "idle", "ignore", "ill", "illegal", "illness", "image", "imitate", "immense", "immune", "impact", "impose", "improve", "impulse", "inch", "include", "income", "increase", "index", "indicate", "indoor", "industry", "infant", "inflict", "inform", "inhale", "inherit", "initial", "inject", "injury", "inmate", "inner", "innocent", "input", "inquiry", "insane", "insect", "inside", "inspire", "install", "intact", "interest", "into", "invest", "invite", "involve", "iron", "island", "isolate", "issue", "item", "ivory", "jacket", "jaguar", "jar", "jazz", "jealous", "jeans", "jelly", "jewel", "job", "join", "joke", "journey", "joy", "judge", "juice", "jumble", "jump", "junction", "junk", "just", "kangaroo", "keen", "keep", "ketchup", "key", "kick", "kid", "kidney", "kind", "kingdom", "kiss", "kit", "kitchen", "kite", "kittens", "kiwi", "knee", "knife", "knock", "know", "lab", "label", "labor", "ladder", "lady", "lake", "lamp", "language", "laptop", "large", "later", "latin", "laugh", "laundry", "lava", "law", "lawn", "lawsuit", "layer", "lazy", "leader", "leaf", "learn", "lease", "least", "leave", "lecture", "left", "leg", "legal", "legend", "lemon", "lend", "length", "lens", "leopard", "lesson", "letter", "level", "liar", "liberty", "library", "license", "life", "lift", "light", "like", "limb", "limit", "link", "lion", "liquid", "list", "little", "live", "lizard", "load", "loan", "lobster", "local", "lock", "logic", "lonely", "long", "loop", "lottery", "loud", "lounge", "love", "loyal", "lucky", "luggage", "lumber", "lunar", "lunch", "luxury", "lyrics", "machine", "mad", "magic", "magnet", "maize", "major", "make", "mammal", "man", "manage", "mandate", "mango", "mansion", "manual", "maple", "marble", "march", "margin", "marine", "market", "marriage", "mask", "mass", "master", "match", "material", "math", "matrix", "matter", "maximum", "maze", "meadow", "mean", "measure", "meat", "mechanic", "medal", "media", "melody", "melt", "member", "memory", "mention", "menu", "mercy", "merge", "merit", "merry", "mesh", "message", "metal", "method", "middle", "midnight", "milk", "million", "mimic", "mind", "mineral", "minimal", "minimum", "minor", "minute", "miracle", "mirror", "misery", "miss", "mistake", "mix", "mixed", "mixture", "mobile", "mode", "model", "modify", "mom", "moment", "monitor", "monster", "month", "moon", "moral", "more", "morning", "mosquito", "mother", "motion", "motor", "mountain", "mouse", "move", "movie", "much", "muffin", "mule", "multiply", "muscle", "museum", "mushroom", "music", "must", "mutual", "myself", "mystery", "myth", "naive", "name", "napkin", "narrow", "nasty", "nation", "nature", "near", "neck", "need", "negative", "neglect", "neither", "nephew", "nerve", "nest", "net", "network", "neutral", "never", "news", "next", "nice", "night", "noble", "noise", "nominee", "noodle", "normal", "north", "nose", "notable", "note", "nothing", "notice", "novel", "now", "nuclear", "number", "nurse", "nut", "oasis", "obey", "object", "oblige", "obscure", "observe", "obtain", "obvious", "occur", "ocean", "october", "odds", "offer", "office", "often", "oil", "okay", "old", "olive", "olympic", "omit", "once", "one", "onion", "online", "only", "open", "opera", "opinion", "oppose", "option", "orange", "orbit", "orchard", "order", "ordinary", "organ", "orient", "original", "orphan", "ostrich", "other", "outdoor", "outer", "output", "outside", "oval", "oven", "over", "own", "owner", "oxygen", "oyster", "ozone", "pact", "paddle", "page", "pair", "palace", "palm", "panda", "panel", "panic", "panther", "paper", "parade", "parent", "park", "parrot", "party", "pass", "patch", "path", "patient", "patrol", "pattern", "pause", "pave", "payment", "peace", "peanut", "pepper", "perfect", "permit", "person", "pet", "phone", "photo", "phrase", "physical", "piano", "picnic", "picture", "piece", "pig", "pigeon", "pill", "pilot", "pink", "pioneer", "pipe", "pistol", "pitch", "pizza", "place", "planet", "plastic", "plate", "play", "please", "pledge", "pluck", "plug", "plunge", "poem", "poet", "point", "polar", "pole", "police", "pond", "pony", "pool", "popular", "portion", "position", "possible", "post", "potato", "pottery", "pouch", "pound", "powder", "power", "practice", "praise", "predict", "prefer", "prepare", "present", "pretty", "prevent", "price", "pride", "primary", "print", "priority", "prison", "private", "prize", "problem", "process", "produce", "profit", "program", "project", "promote", "proof", "property", "prose", "protest", "protocol", "provide", "public", "pudding", "pull", "pulp", "pulse", "pumpkin", "punch", "pupil", "puppy", "purchase", "purity", "purple", "purpose", "pursue", "push", "put", "puzzle", "pyramid", "quality", "quantum", "quarter", "question", "quick", "quit", "quite", "quote", "rabbit", "raccoon", "race", "racket", "radar", "radio", "rail", "rain", "raise", "rally", "ramp", "ranch", "random", "range", "rapid", "rare", "rate", "rather", "raven", "raw", "razor", "ready", "real", "reason", "rebel", "rebuild", "recall", "receive", "recipe", "record", "reduce", "reflect", "reform", "refuse", "region", "regret", "regular", "reject", "relax", "release", "relief", "rely", "remain", "remark", "remind", "remove", "render", "renew", "rental", "repair", "repeat", "replace", "report", "require", "rescue", "resemble", "resist", "resource", "response", "result", "resume", "retire", "retreat", "return", "reunion", "reveal", "review", "reward", "rhythm", "ribbon", "rice", "rich", "ride", "ridge", "rifle", "right", "rigid", "ring", "riot", "ripen", "rise", "risk", "ritual", "rival", "river", "road", "roast", "robot", "robust", "rocket", "romance", "roof", "rookie", "room", "rose", "rotate", "rough", "round", "route", "royal", "rubber", "rude", "rug", "rule", "run", "rush", "rust", "sad", "saddle", "sadness", "safe", "sail", "salad", "salmon", "salt", "salute", "same", "sample", "sand", "satisfy", "satoshi", "sauce", "sausage", "save", "say", "scale", "scan", "scare", "scatter", "scene", "scheme", "school", "science", "scissors", "scorpion", "scout", "scrap", "screen", "script", "scrub", "sea", "search", "season", "seat", "second", "secret", "section", "sector", "secure", "segment", "select", "sell", "seminar", "senior", "sense", "sentence", "series", "service", "session", "settle", "setup", "seven", "shadow", "shaft", "shallow", "share", "shed", "shell", "sheriff", "shield", "shift", "shine", "ship", "shiver", "shock", "shoe", "shoot", "shop", "short", "shoulder", "shove", "shrimp", "shrug", "shuffle", "shy", "sibling", "sick", "side", "siege", "sight", "sign", "silent", "silk", "silly", "silver", "similar", "simple", "since", "sing", "siren", "sister", "situate", "six", "size", "skate", "sketch", "ski", "skill", "skin", "skirt", "skull", "slab", "slack", "slam", "slang", "slate", "slave", "sleep", "sleeve", "slide", "slight", "slim", "slogan", "slot", "slow", "slush", "small", "smart", "smile", "smoke", "smooth", "snack", "snake", "snap", "sniff", "snow", "soap", "soccer", "social", "sock", "soda", "soft", "solar", "soldier", "solid", "solution", "solve", "someone", "song", "soon", "sorry", "sort", "soul", "sound", "soup", "source", "south", "space", "spare", "spatial", "spawn", "speak", "special", "speed", "spell", "spend", "sphere", "spice", "spider", "spike", "spin", "spirit", "split", "spoil", "sport", "spot", "spray", "spread", "spring", "spy", "square", "squeeze", "squirrel", "stable", "stadium", "staff", "stage", "stamp", "staple", "star", "start", "state", "stay", "steak", "steel", "stem", "step", "stereo", "stick", "still", "sting", "stock", "stomach", "stone", "stool", "story", "stove", "strategy", "street", "strike", "strong", "struggle", "student", "stuff", "stumble", "style", "subject", "submit", "subway", "success", "such", "sugar", "suggest", "suit", "summer", "sun", "sunny", "sunset", "super", "supply", "supreme", "sure", "surface", "surge", "surprise", "surround", "survey", "suspect", "sustain", "swallow", "swamp", "swarm", "swear", "sweet", "swift", "swim", "swing", "switch", "sword", "symbol", "symptom", "syndrome", "system", "table", "tackle", "tactic", "tadpole", "tag", "tail", "talent", "talk", "tank", "tape", "target", "task", "taste", "tattle", "taught", "tax", "team", "tell", "temper", "temple", "tennis", "tent", "term", "test", "text", "thank", "that", "theme", "theory", "there", "they", "thing", "this", "thought", "three", "thrive", "throw", "thumb", "thunder", "ticket", "tide", "tiger", "tilt", "timber", "time", "tiny", "tip", "tired", "tissue", "title", "toast", "tobacco", "today", "toddler", "toe", "together", "toilet", "token", "tomato", "tomorrow", "tone", "tongue", "tonight", "tool", "tooth", "top", "topic", "topple", "torch", "tornado", "tortoise", "toss", "total", "tourist", "toward", "tower", "town", "toy", "track", "trade", "traffic", "tragic", "train", "transfer", "trap", "travel", "tray", "treat", "tree", "trend", "trial", "tribe", "trick", "trigger", "trim", "trip", "trophy", "trouble", "truck", "true", "truly", "trumpet", "trust", "truth", "try", "tube", "tuition", "tumble", "tuna", "tunnel", "turkey", "turn", "turtle", "twelve", "twist", "two", "type", "typical", "ugly", "umbrella", "unable", "unaware", "uncle", "uncover", "under", "undo", "unfair", "unfold", "unhappy", "uniform", "unique", "unit", "universe", "unknown", "unlock", "until", "unusual", "unveil", "update", "upgrade", "uphold", "uplift", "upon", "upper", "upset", "urban", "urge", "usage", "use", "used", "useful", "useless", "usual", "utility", "vacant", "vacuum", "vague", "valid", "valley", "valve", "van", "vanish", "vapor", "variable", "vault", "vegetable", "vehicle", "velvet", "vendor", "venture", "venue", "verb", "verify", "version", "very", "vessel", "veteran", "viable", "vibrant", "vicious", "victory", "video", "view", "village", "vintage", "violin", "virtual", "virus", "visa", "visit", "visual", "vital", "vivid", "vocal", "voice", "void", "volcano", "volume", "vote", "voyage", "wage", "wagon", "wait", "walk", "wall", "walnut", "want", "warfare", "warm", "warrior", "wash", "wasp", "waste", "water", "wave", "way", "wealth", "weapon", "wear", "weasel", "weather", "web", "wedding", "weekend", "weird", "welcome", "west", "wet", "whale", "what", "wheat", "wheel", "when", "where", "whip", "whisper", "wide", "width", "wife", "wild", "will", "win", "window", "wine", "wing", "wink", "winner", "winter", "wire", "wisdom", "wise", "wish", "witness", "wolf", "woman", "wonder", "wood", "wool", "word", "work", "world", "worry", "worth", "wrap", "wrist", "write", "wrong", "yard", "year", "yellow", "you", "young", "youth", "zebra", "zero", "zone", "zoo"
].filter(word => word.length >= 5);

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
let playerToggleSettings = [];
let toggleUsedThisRound = false;
let helpUsedCount = 0;
let wrongGuessCount = 0;

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
    
    // Show timer UI
    const timerContainer = document.getElementById('timerContainer');
    const timerProgress = document.getElementById('timerProgress');
    const timerBonus = document.getElementById('timerBonus');
    
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
    
    // Update bonus every 100ms for smooth updates
    timerInterval = setInterval(updateTimerBonus, 100);
    
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
    const timerBonus = document.getElementById('timerBonus');
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
    const timerBonus = document.getElementById('timerBonus');
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
    const timerContainer = document.getElementById('timerContainer');
    const timerBonus = document.getElementById('timerBonus');
    
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

// Client-side entropy collection
let entropyPool = [];
let lastMouseTime = 0;
let lastKeyTime = 0;
let entropyCounter = 0;

// DOM elements
const letterContainer = document.getElementById('letterContainer');
const helpButton = document.getElementById('helpButton');

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
const skipButton = document.getElementById('skipButton');
const submitButton = document.getElementById('submitButton');
const message = document.getElementById('message');
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

// Client-side entropy collection functions
function addEntropy(source, value) {
    const timestamp = performance.now();
    const entropy = {
        source: source,
        value: value,
        time: timestamp,
        counter: entropyCounter++
    };
    
    entropyPool.push(entropy);
    
    // Keep entropy pool manageable (last 1000 events)
    if (entropyPool.length > 1000) {
        entropyPool.shift();
    }
}

function collectMouseEntropy(event) {
    const currentTime = performance.now();
    const timeDelta = currentTime - lastMouseTime;
    
    if (timeDelta > 10) { // Throttle to avoid spam
        const entropy = (event.clientX * event.clientY * timeDelta) % 0xFFFFFFFF;
        addEntropy('mouse', entropy);
        lastMouseTime = currentTime;
    }
}

function collectKeyEntropy(event) {
    const currentTime = performance.now();
    const timeDelta = currentTime - lastKeyTime;
    
    if (timeDelta > 5) { // Throttle
        const entropy = (event.keyCode * timeDelta * currentTime) % 0xFFFFFFFF;
        addEntropy('keyboard', entropy);
        lastKeyTime = currentTime;
    }
}

function collectTouchEntropy(event) {
    const currentTime = performance.now();
    let entropy = currentTime % 0xFFFFFFFF;
    
    if (event.touches && event.touches.length > 0) {
        const touch = event.touches[0];
        entropy = (touch.clientX * touch.clientY * currentTime * event.touches.length) % 0xFFFFFFFF;
    }
    
    addEntropy('touch', entropy);
}

function collectDeviceEntropy() {
    // Collect various device-specific entropy sources
    const deviceEntropy = [
        screen.width * screen.height,
        window.devicePixelRatio * 1000,
        Date.now() % 0xFFFF,
        navigator.hardwareConcurrency || 4,
        window.innerWidth * window.innerHeight,
        (navigator.connection?.downlink || Math.random()) * 1000
    ];
    
    const combined = deviceEntropy.reduce((a, b) => (a * b) % 0xFFFFFFFF, 1);
    addEntropy('device', combined);
}

// Enhanced crypto-based random number generator with entropy mixing
function secureRandom() {
    // Start with crypto random
    const cryptoArray = new Uint32Array(1);
    crypto.getRandomValues(cryptoArray);
    let cryptoRandom = cryptoArray[0];
    
    // Mix with collected entropy if available
    if (entropyPool.length > 0) {
        let entropyMix = 0;
        
        // Use last few entropy sources
        const recentEntropy = entropyPool.slice(-10);
        recentEntropy.forEach(entry => {
            entropyMix ^= entry.value;
            entropyMix ^= (entry.time * entry.counter) % 0xFFFFFFFF;
        });
        
        // XOR crypto random with entropy mix
        cryptoRandom ^= entropyMix;
    }
    
    return cryptoRandom / (0xFFFFFFFF + 1);
}

// Initialize entropy collection
function initializeEntropyCollection() {
    // Collect initial device entropy
    collectDeviceEntropy();
    
    // Set up event listeners for continuous entropy collection
    document.addEventListener('mousemove', collectMouseEntropy, { passive: true });
    document.addEventListener('keydown', collectKeyEntropy, { passive: true });
    document.addEventListener('keyup', collectKeyEntropy, { passive: true });
    document.addEventListener('touchstart', collectTouchEntropy, { passive: true });
    document.addEventListener('touchmove', collectTouchEntropy, { passive: true });
    
    // Periodic entropy collection
    setInterval(() => {
        collectDeviceEntropy();
        addEntropy('periodic', (performance.now() * Math.random()) % 0xFFFFFFFF);
    }, 5000);
    
    console.log('Client-side entropy collection initialized');
}

// Fisher-Yates shuffle algorithm with crypto random
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(secureRandom() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Initialize word pool (called on game start)
function initializeWordPool() {
    wordPool = shuffleArray(bip39Words);
    poolIndex = 0;
    console.log(`Word pool initialized with ${wordPool.length} words`);
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
            console.log('Recently used list trimmed to prevent infinite loop');
        }
        
    } while (recentlyUsedWords.includes(selectedWord) && attempts <= 60);

    // Track the selected word
    recentlyUsedWords.push(selectedWord);
    
    // Maintain recently used list at 210 entries max
    if (recentlyUsedWords.length > 210) {
        recentlyUsedWords.shift(); // Remove oldest entry
    }

    // Update session statistics
    const currentCount = sessionWordStats.get(selectedWord) || 0;
    sessionWordStats.set(selectedWord, currentCount + 1);

    // Debug logging
    console.log(`Selected word: "${selectedWord}" (attempt ${attempts}, recently used: ${recentlyUsedWords.length})`);
    
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
    // Initialize entropy collection first
    initializeEntropyCollection();
    
    // Then initialize word pool with enhanced randomness
    initializeWordPool();
    
    // Add debug commands to console
    window.bipardyStats = logSessionStats;
    window.bipardyEntropy = logEntropyStats;
    
    console.log('Advanced word selection system with client-side entropy initialized!');
    console.log('Debug commands:');
    console.log('  - bipardyStats() - Word selection statistics');
    console.log('  - bipardyEntropy() - Entropy collection statistics');
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
function checkGuess() {
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
            showGameEndScreen(currentPlayer);
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
        players[currentPlayer].streak = 0;
        updateScoreDisplay();
        
        // Check if player has reached 2 wrong guesses (applies to both single and multiplayer)
        if (wrongGuessCount >= 2) {
            // Stop timer when player fails
            stopTimer();
            
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
function help() {
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
                showGameEndScreen(currentPlayer);
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
function skip() {
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
        showGameEndScreen(currentPlayer);
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
    // Don't allow editing during active gameplay
    if (!gameActive && document.querySelector('.name.editing')) {
        return; // Already editing another name
    }

    const currentName = players[playerIndex].name;
    
    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'name-input';
    input.value = currentName;
    input.maxLength = 12; // Reasonable limit
    
    // Add editing class for visual feedback
    nameElement.classList.add('editing');
    
    // Replace text with input
    nameElement.textContent = '';
    nameElement.appendChild(input);
    
    // Focus and select all text
    input.focus();
    input.select();
    
    // Handle saving the name
    function saveName() {
        const newName = input.value.trim();
        if (newName && newName !== currentName) {
            players[playerIndex].name = newName;
        }
        
        // Remove editing class and restore normal display
        nameElement.classList.remove('editing');
        nameElement.removeChild(input);
        nameElement.textContent = players[playerIndex].name;
    }
    
    // Save on Enter key or blur
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveName();
        } else if (e.key === 'Escape') {
            // Cancel editing - restore original name
            nameElement.classList.remove('editing');
            nameElement.removeChild(input);
            nameElement.textContent = currentName;
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

// Local Storage Management
function getLocalScores() {
    try {
        const scores = localStorage.getItem('bipardy-local-scores');
        return scores ? JSON.parse(scores) : [];
    } catch (error) {
        console.error('Error reading local scores:', error);
        return [];
    }
}

function saveLocalScore(scoreEntry) {
    try {
        const scores = getLocalScores();
        scores.push(scoreEntry);
        // Sort by combined score (descending) and keep top 50
        scores.sort((a, b) => b.combined - a.combined);
        const trimmedScores = scores.slice(0, 50);
        localStorage.setItem('bipardy-local-scores', JSON.stringify(trimmedScores));
        return trimmedScores;
    } catch (error) {
        console.error('Error saving local score:', error);
        return getLocalScores();
    }
}

function getPersonalBest(gameLength) {
    const scores = getLocalScores();
    const personalBests = scores.filter(score => score.gameLength === gameLength);
    return personalBests.length > 0 ? personalBests[0] : null;
}

// Global Leaderboard (GitHub-based)
async function loadGlobalLeaderboard() {
    try {
        const response = await fetch('/.netlify/functions/get-leaderboard');
        if (!response.ok) throw new Error('Failed to load global leaderboard');
        return await response.json();
    } catch (error) {
        console.error('Error loading global leaderboard:', error);
        return [];
    }
}

async function submitGlobalScore(name, scoreData) {
    try {
        const gameTime = Math.round((Date.now() - gameStartTime) / 1000);
        const payload = {
            ...scoreData,
            name: name.trim(),
            gameTime: gameTime
        };

        const response = await fetch('/.netlify/functions/submit-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to submit global score');
        }

        return await response.json();
    } catch (error) {
        console.error('Error submitting global score:', error);
        throw error;
    }
}

// Combined leaderboard loading
async function loadLeaderboard() {
    if (currentLeaderboardView === 'local') {
        return getLocalScores();
    } else {
        return await loadGlobalLeaderboard();
    }
}

function displayLeaderboard(leaderboard, currentPlayerRank = null, highlightScore = null) {
    const leaderboardList = document.getElementById('leaderboardList');
    
    if (leaderboard.length === 0) {
        const viewType = currentLeaderboardView === 'local' ? 'local scores' : 'global scores';
        leaderboardList.innerHTML = `
            <div class="leaderboard-header">
                <div class="leaderboard-rank">Rank</div>
                <div class="leaderboard-name">Name</div>
                <div class="leaderboard-game-length">Words</div>
                <div class="leaderboard-game-time">Time</div>
                <div class="leaderboard-score">Score</div>
            </div>
            <div style="text-align: center; color: rgba(255, 255, 255, 0.6); padding: 20px;">
                No ${viewType} yet. ${currentLeaderboardView === 'local' ? 'Play a game!' : 'Be the first!'}
            </div>
        `;
        return;
    }

    const headerHtml = `
        <div class="leaderboard-header">
            <div class="leaderboard-rank">Rank</div>
            <div class="leaderboard-name">Name</div>
            <div class="leaderboard-game-length">Words</div>
            <div class="leaderboard-game-time">Time</div>
            <div class="leaderboard-score">Score</div>
        </div>
    `;

    const entriesHtml = leaderboard.map((entry, index) => {
        const rank = index + 1;
        const isCurrentPlayer = currentPlayerRank === rank;
        const isHighlighted = highlightScore && 
            entry.combined === highlightScore.combined && 
            entry.timestamp === highlightScore.timestamp;
        const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : '';
        const currentClass = (isCurrentPlayer || isHighlighted) ? 'current-player' : '';
        
        return `
            <div class="leaderboard-entry ${rankClass} ${currentClass}" ${(isCurrentPlayer || isHighlighted) ? 'id="current-player-entry"' : ''}>
                <div class="leaderboard-rank">#${rank}</div>
                <div class="leaderboard-name">${entry.name}</div>
                <div class="leaderboard-game-length">${entry.words || 0}</div>
                <div class="leaderboard-game-time">${entry.gameTime || 0}s</div>
                <div class="leaderboard-score">${entry.combined.toLocaleString()}</div>
            </div>
        `;
    }).join('');

    leaderboardList.innerHTML = headerHtml + entriesHtml;

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
        rankStatus.innerHTML = `🌍 Saved locally + shared globally, but didn't make top 21. Keep practicing!`;
        rankStatus.className = 'rank-status no-leaderboard';
    } else {
        rankStatus.innerHTML = `❌ Failed to share globally. Your score is saved locally.`;
        rankStatus.className = 'rank-status no-leaderboard';
    }
}

function showPersonalBestInfo(scoreEntry, gameLength) {
    const personalBest = getPersonalBest(gameLength);
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
function showGameEndScreen(triggeringPlayerIndex) {
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
            qualifyingPlayers.forEach(playerData => {
                const scoreEntryWithName = { ...playerData.scoreEntry, name: playerData.player.name };
                saveLocalScore(scoreEntryWithName);
            });
            
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
                
                // Pre-fill the name input with the winner's name
                document.getElementById('playerNameInput').value = winnerData.player.name;
                
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
                    ${player.name}
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
        showPersonalBestInfo(scoreEntry, gameLength);
        
        // Load and display local leaderboard by default
        currentLeaderboardView = 'local';
        loadLeaderboard().then(leaderboard => {
            displayLeaderboard(leaderboard);
        });
        
        // Pre-fill name input with player name if available
        const nameInput = document.getElementById('playerNameInput');
        nameInput.value = player.name || '';
    }
    
    // Enable body scrolling for the modal
    document.body.style.overflow = 'auto';
    
    // Show the screen
    gameEndScreen.style.display = 'flex';
}

// Event listeners
submitButton.addEventListener('click', checkGuess);
helpButton.addEventListener('click', help);
skipButton.addEventListener('click', skip);

// Attribution - no longer clickable (donation moved to README)

// Continue button handler
document.getElementById('continueButton').addEventListener('click', () => {
    window.location.href = 'donate.html';
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

    if (!name) {
        nameInput.focus();
        nameInput.style.borderColor = '#ff6b6b';
        setTimeout(() => {
            nameInput.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        }, 2000);
        return;
    }

    if (!currentPlayerScore) {
        alert('No score data available');
        return;
    }

    if (scoreSubmittedLocally) {
        return; // Button should already be disabled and show saved state
    }

    // Disable button and show loading state
    localBtn.disabled = true;
    localBtn.textContent = 'Saving...';

    try {
        // Add name to score entry and save locally
        const scoreEntryWithName = { ...currentPlayerScore, name };
        const updatedScores = saveLocalScore(scoreEntryWithName);
        
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
        
        // Mark as submitted locally
        scoreSubmittedLocally = true;
        
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

    if (!name) {
        nameInput.focus();
        nameInput.style.borderColor = '#ff6b6b';
        setTimeout(() => {
            nameInput.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        }, 2000);
        return;
    }

    if (!currentPlayerScore) {
        alert('No score data available');
        return;
    }

    if (scoreSubmittedGlobally) {
        return; // Button should already be disabled and show shared state
    }

    // Disable both buttons and show loading state
    globalBtn.disabled = true;
    localBtn.disabled = true;
    globalBtn.textContent = 'Sharing...';

    try {
        // First save locally as backup
        const scoreEntryWithName = { ...currentPlayerScore, name };
        saveLocalScore(scoreEntryWithName);
        
        // Then try to submit globally
        const result = await submitGlobalScore(name, currentPlayerScore);
        
        // Update rank status
        updateRankStatus(result, false);
        
        // Switch to global view and refresh leaderboard
        currentLeaderboardView = 'global';
        switchLeaderboardView('global');
        const leaderboard = await loadGlobalLeaderboard();
        displayLeaderboard(leaderboard, result.rank);
        
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
        updateRankStatus(null, false);
        
        // Mark as submitted locally (global submission saves locally first)
        scoreSubmittedLocally = true;
        
        // Update button states
        updateSubmissionButtons();
        
        // Re-enable global button since it failed (local button will be disabled by updateSubmissionButtons)
        globalBtn.disabled = false;
        globalBtn.textContent = '🌍 Share Globally (retry)';
        globalBtn.style.opacity = '1';
    }
});

// Allow Enter key to submit to local (default)
document.getElementById('playerNameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('submitLocalBtn').click();
    }
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
    if (!gameActive) return;
    
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

// Initialize game
initializePlayers(1);
newWord();

// Matrix Rain Background Effect
function initMatrixRain() {
    const matrixContainer = document.getElementById('matrixContainer');
    const columns = Math.floor(window.innerWidth / 35);
    
    // Create boxes for each column with random delays
    for (let i = 0; i < columns; i++) {
        // Each column gets a completely random start delay (0-12 seconds)
        const columnDelay = Math.random() * 12000;
        
        // Create 2 boxes per column
        for (let j = 0; j < 2; j++) {
            const boxDelay = columnDelay + (j * 2000) + (Math.random() * 3000);
            setTimeout(() => createMatrixBox(i, true), boxDelay);
        }
    }

    function createMatrixBox(column, isInitial = false) {
        const box = document.createElement('div');
        box.className = `matrix-box shade-${Math.floor(Math.random() * 3) + 1}`;
        
        // Random horizontal position within column
        const xPos = column * 35 + Math.random() * 25;
        box.style.left = xPos + 'px';
        
        // Random animation duration for different speeds (back to slower)
        const duration = 12 + Math.random() * 18; // Slower, cinematic speed
        box.style.animationDuration = duration + 's';
        
        if (isInitial) {
            // For initial boxes, start them at random positions in their fall cycle
            // This creates the illusion that rain has already been falling
            const randomStartPercent = Math.random() * 100; // 0-100%
            const animationDelay = -duration * (randomStartPercent / 100); // Negative delay = already started
            box.style.animationDelay = animationDelay + 's';
        } else {
            // For continuous boxes, use small random delay
            const delay = Math.random() * 2;
            box.style.animationDelay = delay + 's';
        }
        
        // Random size for depth effect
        const size = 20 + Math.random() * 15;
        box.style.width = size + 'px';
        box.style.height = size + 'px';
        
        // Rare blinking (5% chance)
        if (Math.random() > 0.95) {
            setTimeout(() => {
                box.classList.add('blink');
                setTimeout(() => {
                    box.classList.remove('blink');
                }, 500);
            }, Math.random() * duration * 1000);
        }
        
        matrixContainer.appendChild(box);
        
        // Create new boxes continuously
        box.addEventListener('animationend', () => {
            box.remove();
            setTimeout(() => createMatrixBox(column, false), Math.random() * 3000);
        });
    }

    // Add occasional blinking to existing boxes
    setInterval(() => {
        const boxes = document.querySelectorAll('.matrix-box:not(.blink)');
        if (boxes.length > 0 && Math.random() > 0.7) {
            const randomBox = boxes[Math.floor(Math.random() * boxes.length)];
            randomBox.classList.add('blink');
            setTimeout(() => {
                randomBox.classList.remove('blink');
            }, 500);
        }
    }, 2000);

    // Handle window resize
    window.addEventListener('resize', () => {
        const newColumns = Math.floor(window.innerWidth / 35);
        const currentBoxes = matrixContainer.children.length;
        
        if (newColumns * 2 > currentBoxes) {
            for (let i = Math.floor(currentBoxes / 2); i < newColumns; i++) {
                for (let j = 0; j < 2; j++) {
                    const boxDelay = (j * 2000) + (Math.random() * 5000);
                    setTimeout(() => createMatrixBox(i, true), boxDelay);
                }
            }
        }
    });
}

// Initialize advanced word selection system
initializeWordSelectionSystem();

// Initialize matrix rain effect
initMatrixRain();
