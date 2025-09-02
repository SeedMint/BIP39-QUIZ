/**
 * Timer Module - Optimized timer management with reduced update frequency
 */

const TIMER_DURATION = 21; // seconds
const MAX_TIMER_BONUS = 21;

class TimerManager {
    constructor() {
        this.timerActive = false;
        this.timerStartTime = 0;
        this.currentTimerBonus = 0;
        this.timerInterval = null;
        this.timerTimeout = null;
        
        // Cache DOM elements
        this.elements = {
            timerContainer: null,
            timerProgress: null,
            timerBonus: null
        };
        
        this.callbacks = {
            onExpire: null,
            onUpdate: null
        };
    }
    
    init(elements, callbacks = {}) {
        this.elements = elements;
        this.callbacks = callbacks;
    }
    
    startTimer() {
        if (this.timerActive) return;
        
        this.timerActive = true;
        this.timerStartTime = Date.now();
        this.currentTimerBonus = MAX_TIMER_BONUS;
        
        // Show timer elements
        this.elements.timerContainer.style.display = 'block';
        this.elements.timerBonus.textContent = `+${MAX_TIMER_BONUS} Bonus`;
        this.elements.timerBonus.style.opacity = '1';
        
        // Start progress animation with CSS
        requestAnimationFrame(() => {
            this.elements.timerProgress.style.transition = 'width 50ms ease-out';
            this.elements.timerProgress.style.width = '100%';
            
            setTimeout(() => {
                this.elements.timerProgress.style.transition = `width ${TIMER_DURATION}s linear`;
                this.elements.timerProgress.style.width = '0%';
            }, 50);
        });
        
        // Reduced update frequency: 250ms instead of 100ms
        this.timerInterval = setInterval(() => this.updateTimerBonus(), 250);
        
        // Auto-expire timer
        this.timerTimeout = setTimeout(() => this.expireTimer(), TIMER_DURATION * 1000);
    }
    
    updateTimerBonus() {
        if (!this.timerActive) return;
        
        const elapsed = (Date.now() - this.timerStartTime) / 1000;
        const remaining = Math.max(0, TIMER_DURATION - elapsed);
        const progress = remaining / TIMER_DURATION;
        
        // Calculate bonus proportionally
        this.currentTimerBonus = Math.round(MAX_TIMER_BONUS * progress);
        
        // Update display less frequently for better performance
        if (this.elements.timerBonus) {
            this.elements.timerBonus.textContent = `+${this.currentTimerBonus} Bonus`;
        }
        
        // Call update callback if provided
        if (this.callbacks.onUpdate) {
            this.callbacks.onUpdate(this.currentTimerBonus, progress);
        }
    }
    
    expireTimer() {
        if (!this.timerActive) return;
        
        this.timerActive = false;
        this.currentTimerBonus = 0;
        
        // Clear intervals
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.timerTimeout) {
            clearTimeout(this.timerTimeout);
            this.timerTimeout = null;
        }
        
        // Hide timer with smooth transition
        if (this.elements.timerBonus) {
            this.elements.timerBonus.style.opacity = '0';
        }
        
        setTimeout(() => {
            if (this.elements.timerContainer) {
                this.elements.timerContainer.style.display = 'none';
            }
        }, 300);
        
        // Call expire callback if provided
        if (this.callbacks.onExpire) {
            this.callbacks.onExpire();
        }
    }
    
    stopTimer() {
        if (!this.timerActive) return;
        
        this.timerActive = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.timerTimeout) {
            clearTimeout(this.timerTimeout);
            this.timerTimeout = null;
        }
        
        // Reset display
        if (this.elements.timerProgress) {
            this.elements.timerProgress.style.width = '0%';
        }
        if (this.elements.timerContainer) {
            this.elements.timerContainer.style.display = 'none';
        }
    }
    
    getCurrentBonus() {
        return this.timerActive ? this.currentTimerBonus : 0;
    }
    
    isActive() {
        return this.timerActive;
    }
}

// Export singleton instance
export const timerManager = new TimerManager();
export { TIMER_DURATION, MAX_TIMER_BONUS };