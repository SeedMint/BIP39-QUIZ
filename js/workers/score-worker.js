/**
 * Score Calculation Web Worker - Off-thread score processing
 */

// Score calculation constants
const BASE_SCORE = 100;
const STREAK_BONUS = 50;
const TIME_BONUS_MULTIPLIER = 1;

// Message handler
self.addEventListener('message', function(e) {
    const { type, data } = e.data;
    
    try {
        switch (type) {
            case 'calculateScore':
                const result = calculateWordScore(data);
                self.postMessage({
                    type: 'scoreResult',
                    id: data.id,
                    result: result
                });
                break;
                
            case 'calculateStreakBonus':
                const streakResult = calculateStreakBonus(data.streak);
                self.postMessage({
                    type: 'streakBonusResult',
                    id: data.id,
                    result: streakResult
                });
                break;
                
            case 'calculateFinalStats':
                const statsResult = calculateFinalGameStats(data);
                self.postMessage({
                    type: 'finalStatsResult',
                    id: data.id,
                    result: statsResult
                });
                break;
                
            case 'validateScoreData':
                const validationResult = validateScoreInput(data);
                self.postMessage({
                    type: 'validationResult',
                    id: data.id,
                    result: validationResult
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
 * Calculate score for a single word
 */
function calculateWordScore({ isCorrect, streak, timerBonus, wordLength, helpUsed }) {
    if (!isCorrect) {
        return {
            baseScore: 0,
            streakBonus: 0,
            timerBonus: 0,
            helpPenalty: 0,
            total: 0
        };
    }
    
    const baseScore = BASE_SCORE;
    const streakBonus = Math.min(streak * STREAK_BONUS, 500); // Cap at 500
    const actualTimerBonus = Math.round(timerBonus * TIME_BONUS_MULTIPLIER);
    const helpPenalty = helpUsed ? 10 : 0;
    
    const total = Math.max(0, baseScore + streakBonus + actualTimerBonus - helpPenalty);
    
    return {
        baseScore,
        streakBonus,
        timerBonus: actualTimerBonus,
        helpPenalty,
        total
    };
}

/**
 * Calculate streak bonus multiplier
 */
function calculateStreakBonus(streak) {
    if (streak <= 1) return 0;
    return Math.min(streak * STREAK_BONUS, 500);
}

/**
 * Calculate final game statistics
 */
function calculateFinalGameStats({ players, gameLength, totalTime }) {
    const results = [];
    
    for (const player of players) {
        const stats = {
            name: player.name,
            score: player.score,
            correctAnswers: player.correctWords || 0,
            accuracy: gameLength > 0 ? Math.round((player.correctWords || 0) / gameLength * 100) : 0,
            averageTimePerWord: player.correctWords > 0 ? Math.round(totalTime / player.correctWords) : 0,
            bestStreak: player.bestStreak || 0,
            rank: 0 // Will be set after sorting
        };
        
        results.push(stats);
    }
    
    // Sort by score and assign ranks
    results.sort((a, b) => b.score - a.score);
    results.forEach((player, index) => {
        player.rank = index + 1;
    });
    
    return results;
}

/**
 * Validate score input data for security
 */
function validateScoreInput({ score, playerName, gameTime, streak }) {
    const errors = [];
    
    // Score validation
    if (typeof score !== 'number' || score < 0 || score > 50000) {
        errors.push('Invalid score value');
    }
    
    // Player name validation  
    if (typeof playerName !== 'string' || !/^[A-Z0-9]{3,12}$/i.test(playerName)) {
        errors.push('Invalid player name format');
    }
    
    // Game time validation
    if (typeof gameTime !== 'number' || gameTime < 0 || gameTime > 3600) {
        errors.push('Invalid game time');
    }
    
    // Streak validation
    if (typeof streak !== 'number' || streak < 0 || streak > 24) {
        errors.push('Invalid streak value');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Initialize worker
console.log('Score calculation worker initialized');