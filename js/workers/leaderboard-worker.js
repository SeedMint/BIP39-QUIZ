/**
 * Leaderboard Processing Web Worker - Off-thread leaderboard operations
 */

// Message handler
self.addEventListener('message', function(e) {
    const { type, data } = e.data;
    
    try {
        switch (type) {
            case 'processLocalLeaderboard':
                const localResult = processLocalLeaderboardData(data);
                self.postMessage({
                    type: 'localLeaderboardResult',
                    id: data.id,
                    result: localResult
                });
                break;
                
            case 'processGlobalLeaderboard':
                const globalResult = processGlobalLeaderboardData(data);
                self.postMessage({
                    type: 'globalLeaderboardResult', 
                    id: data.id,
                    result: globalResult
                });
                break;
                
            case 'calculateRanking':
                const rankResult = calculatePlayerRanking(data);
                self.postMessage({
                    type: 'rankingResult',
                    id: data.id,
                    result: rankResult
                });
                break;
                
            case 'filterAndSort':
                const filteredResult = filterAndSortLeaderboard(data);
                self.postMessage({
                    type: 'filteredResult',
                    id: data.id,
                    result: filteredResult
                });
                break;
                
            default:
                throw new Error(`Unknown message type: ${type}`);
        }
    } catch (error) {
        self.postMessage({
            type: 'error',
            id: data?.id,
            error: error.message
        });
    }
});

/**
 * Process local leaderboard data with virtual scrolling preparation
 */
function processLocalLeaderboardData({ scores, currentScore, playerName }) {
    const processed = [];
    
    // Validate and process each score
    for (let i = 0; i < scores.length; i++) {
        const score = scores[i];
        
        // Security validation
        if (!isValidScoreEntry(score)) continue;
        
        processed.push({
            rank: i + 1,
            name: sanitizeName(score.name),
            score: Math.max(0, Math.min(50000, score.score)),
            date: score.date || 'Unknown',
            accuracy: Math.max(0, Math.min(100, score.accuracy || 0)),
            gameLength: Math.max(1, Math.min(24, score.gameLength || 12)),
            isCurrentPlayer: score.name === playerName && score.score === currentScore
        });
    }
    
    // Sort by score (should already be sorted but ensure consistency)
    processed.sort((a, b) => b.score - a.score);
    
    // Update ranks after sorting
    processed.forEach((entry, index) => {
        entry.rank = index + 1;
    });
    
    return {
        entries: processed,
        totalCount: processed.length,
        currentPlayerRank: processed.findIndex(p => p.isCurrentPlayer) + 1 || null
    };
}

/**
 * Process global leaderboard data
 */
function processGlobalLeaderboardData({ scores, currentScore, playerName }) {
    const processed = [];
    
    for (let i = 0; i < scores.length; i++) {
        const score = scores[i];
        
        if (!isValidScoreEntry(score)) continue;
        
        processed.push({
            rank: i + 1,
            name: sanitizeName(score.name),
            score: Math.max(0, Math.min(50000, score.score)),
            date: formatDate(score.timestamp),
            accuracy: Math.max(0, Math.min(100, score.accuracy || 0)),
            gameLength: Math.max(1, Math.min(24, score.gameLength || 12)),
            isCurrentPlayer: score.name === playerName && Math.abs(score.score - currentScore) < 10
        });
    }
    
    return {
        entries: processed,
        totalCount: processed.length,
        currentPlayerRank: processed.findIndex(p => p.isCurrentPlayer) + 1 || null
    };
}

/**
 * Calculate player ranking and eligibility
 */
function calculatePlayerRanking({ score, leaderboard, threshold = 21 }) {
    const eligibleScores = leaderboard.filter(entry => entry.score >= 100);
    eligibleScores.sort((a, b) => b.score - a.score);
    
    const playerRank = eligibleScores.findIndex(entry => entry.score <= score) + 1 || eligibleScores.length + 1;
    const isEligible = playerRank <= threshold;
    const percentile = eligibleScores.length > 0 ? Math.round((1 - (playerRank - 1) / eligibleScores.length) * 100) : 100;
    
    return {
        rank: playerRank,
        isEligible,
        percentile,
        totalPlayers: eligibleScores.length,
        scoreNeededForEligibility: eligibleScores[threshold - 1]?.score || 0
    };
}

/**
 * Filter and sort leaderboard data with search/filter options
 */
function filterAndSortLeaderboard({ scores, filters = {} }) {
    let filtered = [...scores];
    
    // Filter by minimum score
    if (filters.minScore) {
        filtered = filtered.filter(score => score.score >= filters.minScore);
    }
    
    // Filter by game length
    if (filters.gameLength) {
        filtered = filtered.filter(score => score.gameLength === filters.gameLength);
    }
    
    // Filter by date range
    if (filters.dateFrom || filters.dateTo) {
        filtered = filtered.filter(score => {
            const scoreDate = new Date(score.timestamp || score.date);
            if (filters.dateFrom && scoreDate < new Date(filters.dateFrom)) return false;
            if (filters.dateTo && scoreDate > new Date(filters.dateTo)) return false;
            return true;
        });
    }
    
    // Search by name
    if (filters.nameSearch) {
        const searchTerm = filters.nameSearch.toLowerCase();
        filtered = filtered.filter(score => 
            score.name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort by specified field
    const sortField = filters.sortBy || 'score';
    const sortOrder = filters.sortOrder || 'desc';
    
    filtered.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        
        if (sortOrder === 'asc') {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
    });
    
    return {
        entries: filtered,
        totalCount: filtered.length,
        appliedFilters: filters
    };
}

/**
 * Validate score entry for security
 */
function isValidScoreEntry(score) {
    if (!score || typeof score !== 'object') return false;
    
    // Required fields
    if (typeof score.name !== 'string' || typeof score.score !== 'number') return false;
    
    // Validate name format
    if (!/^[A-Z0-9]{3,12}$/i.test(score.name)) return false;
    
    // Validate score range
    if (score.score < 0 || score.score > 50000) return false;
    
    // Validate optional fields if present
    if (score.accuracy !== undefined && (score.accuracy < 0 || score.accuracy > 100)) return false;
    if (score.gameLength !== undefined && (score.gameLength < 1 || score.gameLength > 24)) return false;
    
    return true;
}

/**
 * Sanitize player name for display
 */
function sanitizeName(name) {
    if (typeof name !== 'string') return 'Anonymous';
    
    // Remove any potentially dangerous characters and limit length
    return name.replace(/[<>&"']/g, '').substring(0, 12);
}

/**
 * Format timestamp to readable date
 */
function formatDate(timestamp) {
    if (!timestamp) return 'Unknown';
    
    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (error) {
        return 'Unknown';
    }
}

// Initialize worker
console.log('Leaderboard processing worker initialized');