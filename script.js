class NumberBaseballGame {
    constructor() {
        this.targetNumber = '';
        this.attempts = 0;
        this.maxAttempts = 10;
        this.gameActive = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.startNewGame();
    }

    initializeElements() {
        this.guessInput = document.getElementById('guess-input');
        this.submitBtn = document.getElementById('submit-btn');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.attemptCount = document.getElementById('attempt-count');
        this.remainingAttempts = document.getElementById('remaining-attempts');
        this.resultsContainer = document.getElementById('results-container');
        this.modal = document.getElementById('game-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalMessage = document.getElementById('modal-message');
        this.modalBtn = document.getElementById('modal-btn');
    }

    attachEventListeners() {
        this.submitBtn.addEventListener('click', () => this.submitGuess());
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.modalBtn.addEventListener('click', () => this.closeModal());
        
        this.guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitGuess();
            }
        });

        // 숫자만 입력 가능하도록 제한하고 0으로 시작하는 것 방지
        this.guessInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9]/g, '');
            
            // 0으로 시작하면 제거
            if (value.length > 0 && value[0] === '0') {
                value = value.substring(1);
            }
            
            // 중복 숫자 제거
            let uniqueValue = '';
            for (let i = 0; i < value.length && uniqueValue.length < 3; i++) {
                if (!uniqueValue.includes(value[i])) {
                    uniqueValue += value[i];
                }
            }
            
            e.target.value = uniqueValue;
        });
    }

    generateTargetNumber() {
        const digits = [];
        
        // 첫 번째 자리는 1-9 중에서 선택 (0이면 안됨)
        const firstDigit = Math.floor(Math.random() * 9) + 1;
        digits.push(firstDigit);
        
        // 나머지 두 자리는 첫 번째 자리와 다른 숫자 중에서 선택
        while (digits.length < 3) {
            const digit = Math.floor(Math.random() * 10);
            if (!digits.includes(digit)) {
                digits.push(digit);
            }
        }
        return digits.join('');
    }

    startNewGame() {
        this.targetNumber = this.generateTargetNumber();
        this.attempts = 0;
        this.gameActive = true;
        
        this.updateUI();
        this.clearResults();
        this.guessInput.value = '';
        this.guessInput.focus();
        this.submitBtn.disabled = false;
        
        console.log('새 게임 시작! 정답:', this.targetNumber); // 개발용 - 실제로는 제거
    }

    updateUI() {
        this.attemptCount.textContent = this.attempts;
        this.remainingAttempts.textContent = this.maxAttempts - this.attempts;
    }

    clearResults() {
        this.resultsContainer.innerHTML = '';
    }

    validateInput(input) {
        // 3자리 숫자인지 확인
        if (input.length !== 3) {
            alert('3자리 숫자를 입력해주세요!');
            return false;
        }

        // 0으로 시작하는지 확인
        if (input[0] === '0') {
            alert('0으로 시작하는 숫자는 입력할 수 없습니다!');
            return false;
        }

        // 모든 자릿수가 다른지 확인
        const digits = input.split('');
        const uniqueDigits = [...new Set(digits)];
        if (uniqueDigits.length !== 3) {
            alert('서로 다른 3자리 숫자를 입력해주세요!');
            return false;
        }

        // 숫자인지 확인
        if (!/^\d{3}$/.test(input)) {
            alert('숫자만 입력해주세요!');
            return false;
        }

        return true;
    }

    calculateResult(guess, target) {
        let strikes = 0;
        let balls = 0;

        for (let i = 0; i < 3; i++) {
            if (guess[i] === target[i]) {
                strikes++;
            } else if (target.includes(guess[i])) {
                balls++;
            }
        }

        return { strikes, balls };
    }

    formatResult(strikes, balls) {
        const parts = [];
        
        if (strikes > 0) {
            parts.push(`<span class="strike">${strikes}S</span>`);
        }
        if (balls > 0) {
            parts.push(`<span class="ball">${balls}B</span>`);
        }
        if (strikes === 0 && balls === 0) {
            parts.push(`<span class="out">OUT</span>`);
        }

        return parts.join(' ');
    }

    addResult(guess, result) {
        const resultElement = document.createElement('div');
        resultElement.className = 'result-item';
        resultElement.innerHTML = `
            <span class="result-guess">${guess}</span>
            <span class="result-feedback">${result}</span>
        `;
        
        this.resultsContainer.insertBefore(resultElement, this.resultsContainer.firstChild);
    }

    submitGuess() {
        if (!this.gameActive) return;

        const guess = this.guessInput.value.trim();
        
        if (!this.validateInput(guess)) {
            this.guessInput.focus();
            return;
        }

        this.attempts++;
        const { strikes, balls } = this.calculateResult(guess, this.targetNumber);
        const resultText = this.formatResult(strikes, balls);
        
        this.addResult(guess, resultText);
        this.updateUI();

        // 게임 종료 조건 확인
        if (strikes === 3) {
            this.endGame(true);
        } else if (this.attempts >= this.maxAttempts) {
            this.endGame(false);
        } else {
            this.guessInput.value = '';
            this.guessInput.focus();
        }
    }

    endGame(won) {
        this.gameActive = false;
        this.submitBtn.disabled = true;

        if (won) {
            this.modalTitle.textContent = '🎉 축하합니다!';
            this.modalMessage.textContent = `${this.attempts}번 만에 정답을 맞추셨습니다!`;
        } else {
            this.modalTitle.textContent = '😢 게임 오버';
            this.modalMessage.textContent = `정답은 ${this.targetNumber}이었습니다.`;
        }

        this.showModal();
    }

    showModal() {
        this.modal.style.display = 'block';
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.startNewGame();
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    new NumberBaseballGame();
});
