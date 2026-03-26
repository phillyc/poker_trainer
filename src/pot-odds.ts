import { PotOddsProblem, PotOddsDrillState } from './types';
import { potOddsDrillState, setPotOddsDrillState } from './state';
import { showToast } from './ui';

const BATCH_SIZE = 10;

/**
 * Generate a random pot amount between $20 and $5000 with messy numbers
 */
function randomPot(): number {
    // Weighted toward common sizes — use a mix of ranges
    const r = Math.random();
    let base: number;
    if (r < 0.4) {
        // Small pots $20-$200
        base = 20 + Math.random() * 180;
    } else if (r < 0.75) {
        // Medium pots $200-$1000
        base = 200 + Math.random() * 800;
    } else {
        // Large pots $1000-$5000
        base = 1000 + Math.random() * 4000;
    }
    return Math.round(base);
}

/**
 * Generate a random bet fraction between 25% and 200% of pot
 */
function randomBetFraction(): number {
    // Common bet sizes with some noise
    const commonFractions = [0.25, 0.33, 0.5, 0.66, 0.75, 1.0, 1.5, 2.0];
    const r = Math.random();
    if (r < 0.3) {
        // Pick a common fraction with slight noise
        const base = commonFractions[Math.floor(Math.random() * commonFractions.length)];
        return base + (Math.random() * 0.1 - 0.05);
    }
    // Otherwise random between 0.25 and 2.0
    return 0.25 + Math.random() * 1.75;
}

/**
 * Generate a single pot odds problem
 */
function generatePotOddsProblem(): PotOddsProblem {
    const pot = randomPot();
    const betFraction = randomBetFraction();
    const bet = Math.round(pot * betFraction);

    // Correct equity: call / (pot + bet + call), where call = bet
    const correctEquity = Math.round((bet / (pot + bet + bet)) * 100);

    const options = generateOptions(correctEquity, pot, bet);

    return { pot, bet, correctEquity, options };
}

/**
 * Generate 4 options including the correct answer and 3 smart distractors
 */
function generateOptions(correct: number, pot: number, bet: number): number[] {
    const options = new Set<number>();
    options.add(correct);

    // Common mistake: bet/pot (forgetting to include the call in final pot)
    const commonMistake = Math.round((bet / (pot + bet)) * 100);
    if (commonMistake !== correct && commonMistake >= 5 && commonMistake <= 70) {
        options.add(commonMistake);
    }

    // Close miss: ±3-5%
    const closeMisses = [
        correct + 3 + Math.floor(Math.random() * 3),
        correct - 3 - Math.floor(Math.random() * 3),
    ];
    for (const cm of closeMisses) {
        if (options.size < 4 && cm !== correct && cm >= 5 && cm <= 70) {
            options.add(cm);
        }
    }

    // Far off: ±10-15%
    const farOffs = [
        correct + 10 + Math.floor(Math.random() * 6),
        correct - 10 - Math.floor(Math.random() * 6),
    ];
    for (const fo of farOffs) {
        if (options.size < 4 && fo >= 5 && fo <= 70 && !options.has(fo)) {
            options.add(fo);
        }
    }

    // Fill remaining with random values if needed
    let attempts = 0;
    while (options.size < 4 && attempts < 50) {
        const rand = 5 + Math.floor(Math.random() * 66);
        if (!options.has(rand)) {
            options.add(rand);
        }
        attempts++;
    }

    // Shuffle
    const arr = Array.from(options);
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

/**
 * Generate a batch of problems
 */
function generateBatch(size: number): PotOddsProblem[] {
    const problems: PotOddsProblem[] = [];
    for (let i = 0; i < size; i++) {
        problems.push(generatePotOddsProblem());
    }
    return problems;
}

/**
 * Format a dollar amount with commas
 */
function formatDollars(amount: number): string {
    return '$' + amount.toLocaleString();
}

/**
 * Display the current problem
 */
function displayCurrentProblem(): void {
    if (!potOddsDrillState) return;

    const problem = potOddsDrillState.problems[potOddsDrillState.currentIndex];
    if (!problem) return;

    const potValue = document.getElementById('pot-value');
    const betValue = document.getElementById('bet-value');
    const optionsContainer = document.getElementById('pot-odds-options');
    const progressText = document.getElementById('pot-odds-progress-text');

    if (potValue) potValue.textContent = formatDollars(problem.pot);
    if (betValue) betValue.textContent = formatDollars(problem.bet);

    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        problem.options.forEach((equity) => {
            const btn = document.createElement('button');
            btn.className = 'pot-odds-btn';
            btn.dataset.equity = String(equity);
            btn.textContent = equity + '%';
            btn.addEventListener('click', () => handlePotOddsAnswer(equity));
            optionsContainer.appendChild(btn);
        });
    }

    if (progressText) {
        progressText.textContent = `${potOddsDrillState.currentIndex} / ${potOddsDrillState.batchSize}`;
    }

    // Record question start time
    potOddsDrillState.questionStartTime = Date.now();
}

/**
 * Start a new pot odds drill session
 */
export function startPotOddsDrill(): void {
    const problems = generateBatch(BATCH_SIZE);

    setPotOddsDrillState({
        problems,
        currentIndex: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        results: [],
        questionStartTime: Date.now(),
        batchSize: BATCH_SIZE,
    });

    // Hide results, show drill
    const resultDiv = document.getElementById('pot-odds-result');
    if (resultDiv) resultDiv.style.display = 'none';

    const drillMode = document.querySelector('.pot-odds-mode') as HTMLElement;
    if (drillMode) drillMode.style.display = 'block';

    displayCurrentProblem();
}

/**
 * Handle the user selecting an answer
 */
export function handlePotOddsAnswer(userAnswer: number): void {
    if (!potOddsDrillState) return;

    const problem = potOddsDrillState.problems[potOddsDrillState.currentIndex];
    if (!problem) return;

    const responseTimeMs = Date.now() - potOddsDrillState.questionStartTime;
    const correct = userAnswer === problem.correctEquity;

    potOddsDrillState.results.push({
        problem,
        userAnswer,
        correct,
        responseTimeMs,
    });

    potOddsDrillState.totalAttempts++;
    if (correct) {
        potOddsDrillState.correctAnswers++;
    }

    // Visual feedback on the buttons
    const optionsContainer = document.getElementById('pot-odds-options');
    if (optionsContainer) {
        const buttons = optionsContainer.querySelectorAll('.pot-odds-btn');
        buttons.forEach((btn) => {
            const el = btn as HTMLButtonElement;
            const eq = parseInt(el.dataset.equity || '0', 10);
            el.disabled = true;
            if (eq === problem.correctEquity) {
                el.classList.add('pot-odds-correct');
            }
            if (eq === userAnswer && !correct) {
                el.classList.add('pot-odds-wrong');
            }
        });
    }

    if (correct) {
        showToast('✓ Correct!', 'success');
    } else {
        showToast(`✗ Wrong! Correct: ${problem.correctEquity}%`, 'error');
    }

    // Advance after delay
    potOddsDrillState.currentIndex++;

    setTimeout(() => {
        if (!potOddsDrillState) return;
        if (potOddsDrillState.currentIndex >= potOddsDrillState.batchSize) {
            showPotOddsResults();
        } else {
            displayCurrentProblem();
        }
    }, 1000);
}

/**
 * Show results after a batch
 */
export function showPotOddsResults(): void {
    if (!potOddsDrillState) return;

    const resultDiv = document.getElementById('pot-odds-result');
    if (!resultDiv) return;

    const accuracy = potOddsDrillState.totalAttempts > 0
        ? ((potOddsDrillState.correctAnswers / potOddsDrillState.totalAttempts) * 100).toFixed(1)
        : '0.0';

    const avgTime = potOddsDrillState.results.length > 0
        ? (potOddsDrillState.results.reduce((sum, r) => sum + r.responseTimeMs, 0) / potOddsDrillState.results.length / 1000).toFixed(1)
        : '0.0';

    // Build results breakdown
    let breakdownHtml = '<div class="pot-odds-breakdown">';
    potOddsDrillState.results.forEach((r, i) => {
        const icon = r.correct ? '✓' : '✗';
        const cls = r.correct ? 'pot-odds-result-correct' : 'pot-odds-result-wrong';
        breakdownHtml += `<div class="pot-odds-result-row ${cls}">
            <span class="pot-odds-result-num">${i + 1}.</span>
            <span class="pot-odds-result-icon">${icon}</span>
            <span>Pot ${formatDollars(r.problem.pot)} / Bet ${formatDollars(r.problem.bet)}</span>
            <span class="pot-odds-result-answer">→ ${r.correct ? r.userAnswer + '%' : r.userAnswer + '% (correct: ' + r.problem.correctEquity + '%)'}</span>
            <span class="pot-odds-result-time">${(r.responseTimeMs / 1000).toFixed(1)}s</span>
        </div>`;
    });
    breakdownHtml += '</div>';

    resultDiv.innerHTML = `
        <h3>Pot Odds Drill Results</h3>
        <p class="accuracy">Accuracy: ${accuracy}%</p>
        <p>✓ Correct: ${potOddsDrillState.correctAnswers} / ${potOddsDrillState.totalAttempts}</p>
        <p>⏱ Avg Response: ${avgTime}s</p>
        ${breakdownHtml}
        <div class="pot-odds-results-actions">
            <button id="pot-odds-continue-btn" class="train-button submit-button">Continue (10 more)</button>
            <button id="pot-odds-restart-btn" class="train-button reset-button">Restart</button>
        </div>
    `;
    resultDiv.style.display = 'block';

    // Hide the drill display
    const drillMode = document.querySelector('.pot-odds-mode') as HTMLElement;
    if (drillMode) drillMode.style.display = 'none';

    // Wire up buttons
    const continueBtn = document.getElementById('pot-odds-continue-btn');
    const restartBtn = document.getElementById('pot-odds-restart-btn');

    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            if (!potOddsDrillState) return;
            // Keep cumulative stats, generate new batch
            const newProblems = generateBatch(BATCH_SIZE);
            potOddsDrillState.problems = newProblems;
            potOddsDrillState.currentIndex = 0;
            potOddsDrillState.results = [];
            potOddsDrillState.correctAnswers = 0;
            potOddsDrillState.totalAttempts = 0;

            resultDiv.style.display = 'none';
            if (drillMode) drillMode.style.display = 'block';
            displayCurrentProblem();
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            startPotOddsDrill();
        });
    }
}
