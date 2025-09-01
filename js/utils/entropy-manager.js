/**
 * Entropy Manager - Secure random number generation with client-side entropy collection
 * Provides cryptographically secure randomness enhanced with user interaction entropy
 */

// Entropy collection state
let entropyPool = [];
let lastMouseTime = 0;
let lastKeyTime = 0;
let entropyCounter = 0;

/**
 * Add entropy from various sources to the entropy pool
 * @param {string} source - Source identifier (mouse, keyboard, touch, device, periodic)
 * @param {number} value - Entropy value to add
 */
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

/**
 * Collect entropy from mouse movements
 * @param {MouseEvent} event - Mouse event
 */
function collectMouseEntropy(event) {
    const currentTime = performance.now();
    const timeDelta = currentTime - lastMouseTime;
    
    if (timeDelta > 50) { // Throttle to avoid spam (5x less frequent)
        const entropy = (event.clientX * event.clientY * timeDelta) % 0xFFFFFFFF;
        addEntropy('mouse', entropy);
        lastMouseTime = currentTime;
    }
}

/**
 * Collect entropy from keyboard events
 * @param {KeyboardEvent} event - Keyboard event
 */
function collectKeyEntropy(event) {
    const currentTime = performance.now();
    const timeDelta = currentTime - lastKeyTime;
    
    if (timeDelta > 25) { // Throttle (5x less frequent)
        const entropy = (event.keyCode * timeDelta * currentTime) % 0xFFFFFFFF;
        addEntropy('keyboard', entropy);
        lastKeyTime = currentTime;
    }
}

/**
 * Collect entropy from touch events
 * @param {TouchEvent} event - Touch event
 */
function collectTouchEntropy(event) {
    const currentTime = performance.now();
    let entropy = currentTime % 0xFFFFFFFF;
    
    if (event.touches && event.touches.length > 0) {
        const touch = event.touches[0];
        entropy = (touch.clientX * touch.clientY * currentTime * event.touches.length) % 0xFFFFFFFF;
    }
    
    addEntropy('touch', entropy);
}

/**
 * Collect device-specific entropy
 */
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

/**
 * Enhanced crypto-based random number generator with entropy mixing
 * @returns {number} Random number between 0 and 1
 */
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

/**
 * Fisher-Yates shuffle algorithm with secure random
 * @param {Array} array - Array to shuffle
 * @returns {Array} New shuffled array
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(secureRandom() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Initialize entropy collection system
 */
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
    
    // Only log in development mode
    const DEBUG = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (DEBUG) console.log('Client-side entropy collection initialized');
}

// Export functions for use by other modules
export { 
    secureRandom, 
    shuffleArray, 
    initializeEntropyCollection,
    addEntropy 
};