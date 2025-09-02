/**
 * Hall of Fame - Testing and Display Functionality
 * Provides comprehensive testing tools to populate and visualize leaderboards
 */

// Global state
let currentView = 'local';
let currentFilter = 'all';

// Sample names for realistic mock data
const sampleNames = [
    'SATOSHI', 'HODLR', 'BITCOINBEAST', 'MOONSHOT', 'SEEDKING', 'BITCOINBOT',
    'NODERUNNER', 'HASHPOWER', 'BLOCKMASTER', 'COINFLIP', 'GENESIS', 'HALVING',
    'LIGHTNING', 'STACKER', 'DIAMOND', 'WHALE', 'MINER', 'VALIDATOR',
    'CYBERPUNK', 'CYPHERPUNK', 'NINJA', 'PHOENIX', 'TITAN', 'ORACLE',
    'STORM', 'VIPER', 'FALCON', 'DRAGON', 'SHADOW', 'LEGEND'
];

// Encryption/Decryption helpers (simplified versions from main game)
function encryptData(data, seed = 'bipardy-encryption-key') {
    const jsonStr = JSON.stringify(data);
    let encrypted = '';
    for (let i = 0; i < jsonStr.length; i++) {
        const keyChar = seed.charCodeAt(i % seed.length);
        const char = jsonStr.charCodeAt(i);
        encrypted += String.fromCharCode(char ^ keyChar);
    }
    return btoa(encrypted);
}

function decryptData(encryptedData, seed = 'bipardy-encryption-key') {
    try {
        const encrypted = atob(encryptedData);
        let decrypted = '';
        for (let i = 0; i < encrypted.length; i++) {
            const keyChar = seed.charCodeAt(i % seed.length);
            const char = encrypted.charCodeAt(i);
            decrypted += String.fromCharCode(char ^ keyChar);
        }
        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Decryption failed:', error);
        return [];
    }
}

// Mock data generation
function generateMockScore(rank) {
    const name = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    
    // Generate realistic scores based on rank (higher rank = higher score)
    const baseScore = Math.max(100, 5000000 - (rank * 300000) + Math.random() * 200000);
    const streak = Math.floor(Math.random() * 15) + 1;
    const words = Math.random() > 0.3 ? 12 : 24; // 70% chance of 12-word games
    
    // Combined score calculation (same as main game)
    let combinedStr = '';
    if (baseScore > 0) combinedStr += Math.floor(baseScore).toString();
    if (streak > 0) combinedStr += streak.toString();
    if (words > 0) combinedStr += words.toString();
    const combined = parseInt(combinedStr) || 0;
    
    // Realistic game times
    const baseTime = words === 12 ? 120 : 240;
    const gameTime = baseTime + Math.floor(Math.random() * 180);
    
    // Recent dates
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    return {
        name,
        combined,
        words,
        gameTime,
        date: date.toISOString(),
        points: Math.floor(baseScore),
        streak
    };
}

// Local storage management
async function getLocalScores() {
    try {
        const encryptedScores = localStorage.getItem('bipardy-local-scores');
        if (!encryptedScores) return [];
        
        const encryptedData = JSON.parse(encryptedScores);
        const scores = decryptData(encryptedData.data, encryptedData.key);
        
        return scores.sort((a, b) => b.combined - a.combined).slice(0, 12);
    } catch (error) {
        console.error('Error loading local scores:', error);
        return [];
    }
}

async function saveLocalScores(scores) {
    try {
        const trimmedScores = scores.slice(0, 12);
        const encryptionKey = 'bipardy-local-' + Date.now();
        const encryptedData = {
            data: encryptData(trimmedScores, encryptionKey),
            key: encryptionKey,
            timestamp: Date.now()
        };
        
        localStorage.setItem('bipardy-local-scores', JSON.stringify(encryptedData));
        return trimmedScores;
    } catch (error) {
        console.error('Error saving local scores:', error);
        throw error;
    }
}

// Global leaderboard API connection
async function getGlobalScores() {
    try {
        const response = await fetch('/.netlify/functions/get-leaderboard');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success || !Array.isArray(data.leaderboard)) {
            throw new Error('Invalid leaderboard data structure');
        }
        
        return data.leaderboard.slice(0, 12);
    } catch (error) {
        console.error('Error fetching global leaderboard:', error);
        return [];
    }
}


// Display functions
function displayLeaderboard(leaderboard, viewType) {
    const display = document.getElementById('leaderboardDisplay');
    
    if (leaderboard.length === 0) {
        display.innerHTML = `
            <div class="no-data-message">
                <p>🎮 No ${viewType} scores yet!</p>
                <p>Use the testing controls above to populate the leaderboards.</p>
            </div>
        `;
        return;
    }

    // Apply filter
    const filteredLeaderboard = applyFilter(leaderboard);
    
    if (filteredLeaderboard.length === 0) {
        display.innerHTML = `
            <div class="no-data-message">
                <p>🔍 No scores match the current filter</p>
                <p>Try selecting a different game length filter.</p>
            </div>
        `;
        return;
    }

    const headerHtml = `
        <div class="leaderboard-header">
            <div class="leaderboard-rank">#</div>
            <div class="leaderboard-name">Champion</div>
            <div class="leaderboard-game-length">Words</div>
            <div class="leaderboard-game-time">Time</div>
            <div class="leaderboard-score">Combined Score</div>
        </div>
    `;

    const entriesHtml = filteredLeaderboard.map((entry, index) => {
        const rank = index + 1;
        let rankClass = '';
        if (rank === 1) rankClass = 'rank-1';
        else if (rank === 2) rankClass = 'rank-2';
        else if (rank === 3) rankClass = 'rank-3';

        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
        
        return `
            <div class="leaderboard-entry ${rankClass}">
                <div class="leaderboard-rank">${medal}</div>
                <div class="leaderboard-name">${entry.name}</div>
                <div class="leaderboard-game-length">${entry.words}w</div>
                <div class="leaderboard-game-time">${entry.gameTime}s</div>
                <div class="leaderboard-score">${entry.combined.toLocaleString()}</div>
            </div>
        `;
    }).join('');

    display.innerHTML = headerHtml + entriesHtml;
}

function applyFilter(leaderboard) {
    if (currentFilter === 'all') return leaderboard;
    const filterWords = parseInt(currentFilter);
    return leaderboard.filter(entry => entry.words === filterWords);
}

// Event handlers
async function fillLocalLeaderboard() {
    const mockScores = [];
    for (let i = 1; i <= 12; i++) {
        mockScores.push(generateMockScore(i));
    }
    
    await saveLocalScores(mockScores);
    
    if (currentView === 'local') {
        const scores = await getLocalScores();
        displayLeaderboard(scores, 'local');
    }
    
    console.log('Local leaderboard filled with 12 mock scores');
}

async function refreshGlobalLeaderboard() {
    if (currentView === 'global') {
        const scores = await getGlobalScores();
        displayLeaderboard(scores, 'global');
    }
    
    console.log('Global leaderboard refreshed from API');
}

async function clearAllData() {
    // Clear local storage
    localStorage.removeItem('bipardy-local-scores');
    
    // Refresh display
    await loadAndDisplayLeaderboard();
    
    console.log('Local leaderboard data cleared');
}

async function switchView(newView) {
    currentView = newView;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(newView + 'TabBtn').classList.add('active');
    
    await loadAndDisplayLeaderboard();
}

function setFilter(filter) {
    currentFilter = filter;
    
    // Update filter buttons
    document.querySelectorAll('.filter-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    // Reload current view with new filter
    loadAndDisplayLeaderboard();
}

async function loadAndDisplayLeaderboard() {
    const viewType = currentView === 'local' ? 'local' : 'global';
    const scores = currentView === 'local' ? 
        await getLocalScores() : 
        await getGlobalScores();
    
    displayLeaderboard(scores, viewType);
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    // Set up event listeners for existing elements
    document.getElementById('localTabBtn').addEventListener('click', () => switchView('local'));
    document.getElementById('globalTabBtn').addEventListener('click', () => switchView('global'));
    
    // Filter buttons
    document.querySelectorAll('.filter-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            setFilter(e.target.dataset.filter);
        });
    });
    
    // Load initial data
    await loadAndDisplayLeaderboard();
    
    console.log('Hall of Fame initialized');
});