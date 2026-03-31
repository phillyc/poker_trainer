import { PotOddsProblem, PotOddsDrillState, PotOddsDifficulty } from './types';
import { potOddsDrillState, setPotOddsDrillState } from './state';
import { showToast } from './ui';

const BATCH_SIZE = 10;

// ─── Easy Mode Preset Combinations ───────────────────────────────────────────
// These produce clean integer equity values: bet / (pot + bet*2)
// Equity = 25%, 33%, 40%, 43% are the most common.
const EASY_COMBOS: { pot: number; bet: number; equity: number }[] = [
    // ½ pot → 25%
    { pot: 100, bet: 50,  equity: 25 },
    { pot: 200, bet: 100, equity: 25 },
    { pot: 400, bet: 200, equity: 25 },
    { pot:  50, bet: 25,  equity: 25 },
    { pot:  80, bet: 40,  equity: 25 },
    // pot (1x) → 33%
    { pot: 100, bet: 100, equity: 33 },
    { pot:  50, bet:  50, equity: 33 },
    { pot: 200, bet: 200, equity: 33 },
    { pot:  30, bet:  30, equity: 33 },
    // 2x pot → 40%
    { pot: 100, bet: 200, equity: 40 },
    { pot:  50, bet: 100, equity: 40 },
    { pot: 200, bet: 400, equity: 40 },
    // ¾ pot → 43% (rounds to 43)
    { pot: 100, bet:  75, equity: 43 },
    { pot: 200, bet: 150, equity: 43 },
    { pot:  80, bet:  60, equity: 43 },
];

const HELP_HTML = `
<div class="pot-odds-help-content">
    <p><strong>Pot odds</strong> tell you how often you need to win for a call to break even.</p>
    <p><strong>Formula:</strong><br>
    Equity Needed = Bet ÷ (Pot + Bet + Your Call)</p>
    <p><strong>Simplified (same math):</strong><br>
    Equity Needed = Bet ÷ (Pot + Bet×2)</p>
    <div class="pot-odds-help-example">
        <strong>Example:</strong><br>
        Pot: $100 | Bet: $50<br>
        Equity = 50 ÷ (100 + 50 + 50)<br>
        Equity = 50 ÷ 200 = <strong>25%</strong><br>
        You need at least 25% equity to call.
    </div>
</div>
`;

// ─── Normal Mode Generators ───────────────────────────────────────────────────

function randomPot(): number {
    const r = Math.random();
    let base: number;
    if (r < 0.4) {
        base = 20 + Math.random() * 180;
    } else if (r < 0.75) {
        base = 200 + Math.random() * 800;
    } else {
        base = 1000 + Math.random() * 4000;
    }
    return Math.round(base);
}

function randomBetFraction(): number {
    const commonFractions = [0.25, 0.33, 0.5, 0.66, 0.75, 1.0, 1.5, 2.0];
    const r = Math.random();
    if (r < 0.3) {
        const base = commonFractions[Math.floor(Math.random() * commonFractions.length)];
        return base + (Math.random() * 0.1 - 0.05);
    }
    return 0.25 + Math.random() * 1.75;
}

// ─── Problem Generation ───────────────────────────────────────────────────────

function generatePotOddsProblem(difficulty: PotOddsDifficulty): PotOddsProblem {
    if (difficulty === 'easy') {
        const combo = EASY_COMBOS[Math.floor(Math.random() * EASY_COMBOS.length)];
        const options = generateEasyOptions(combo.equity);
        return {
            pot: combo.pot,
            bet: combo.bet,
            correctEquity: combo.equity,
            options,
        };
    }

    // Normal mode
    const pot = randomPot();
    const betFraction = randomBetFraction();
    const bet = Math.round(pot * betFraction);
    const correctEquity = Math.round((bet / (pot + bet + bet)) * 100);
    const options = generateOptions(correctEquity, pot, bet);
    return { pot, bet, correctEquity, options };
}

function generateEasyOptions(correct: number): number[] {
    // Always include the correct answer plus smart distractors
    const distractors = new Set<number>();
    distractors.add(correct);

    // Common mistakes for each equity tier
    const mistakeMap: Record<number, number[]> = {
        25: [33, 20, 40],   // forgetting to include call
        33: [50, 25, 43],   // thinking it's half
        40: [50, 33, 25],   // bet/pot instead of bet/(pot+2*bet)
        43: [33, 50, 25],   // rounding error
    };
    const mistakes = mistakeMap[correct] || [correct - 5, correct + 5, correct + 10];
    for (const m of mistakes) {
        if (distractors.size < 4 && m >= 10 && m <= 60) distractors.add(m);
    }
    while (distractors.size < 4) {
        const r = 10 + Math.floor(Math.random() * 51);
        if (r !== correct) distractors.add(r);
    }

    const arr = Array.from(distractors);
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

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

    const arr = Array.from(options);
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

function generateBatch(size: number, difficulty: PotOddsDifficulty): PotOddsProblem[] {
    const problems: PotOddsProblem[] = [];
    for (let i = 0; i < size; i++) {
        problems.push(generatePotOddsProblem(difficulty));
    }
    return problems;
}

// ─── Formatting ───────────────────────────────────────────────────────────────

function formatDollars(amount: number): string {
    return '$' + amount.toLocaleString();
}

// ─── Difficulty & Help Toggle ───────────────────────────────────────────────

export function setDifficulty(difficulty: PotOddsDifficulty): void {
    if (!potOddsDrillState) return;
    potOddsDrillState.difficulty = difficulty;
    updateDifficultyToggle();
    updateHelpVisibility();
    // Restart the drill with the new difficulty
    restartWithNewDifficulty(difficulty);
}

function restartWithNewDifficulty(difficulty: PotOddsDifficulty): void {
    const problems = generateBatch(BATCH_SIZE, difficulty);
    setPotOddsDrillState({
        ...potOddsDrillState,
        problems,
        currentIndex: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        results: [],
        questionStartTime: Date.now(),
        difficulty,
    });

    // Hide results if showing
    const resultDiv = document.getElementById('pot-odds-result');
    if (resultDiv) resultDiv.style.display = 'none';

    const drillMode = document.querySelector('.pot-odds-mode') as HTMLElement;
    if (drillMode) drillMode.style.display = 'block';

    displayCurrentProblem();
}

function updateDifficultyToggle(): void {
    if (!potOddsDrillState) return;
    const easyBtn = document.getElementById('pot-odds-easy-btn');
    const normalBtn = document.getElementById('pot-odds-normal-btn');
    if (easyBtn && normalBtn) {
        easyBtn.classList.toggle('active', potOddsDrillState.difficulty === 'easy');
        normalBtn.classList.toggle('active', potOddsDrillState.difficulty === 'normal');
    }
}

function updateHelpVisibility(): void {
    if (!potOddsDrillState) return;
    const helpPanel = document.getElementById('pot-odds-help');
    if (helpPanel) {
        // Show in easy mode, hide in normal mode
        const isEasy = potOddsDrillState.difficulty === 'easy';
        helpPanel.style.display = isEasy ? 'block' : 'none';
    }
}

export function toggleHelp(): void {
    const helpPanel = document.getElementById('pot-odds-help');
    if (helpPanel) {
        const isHidden = helpPanel.style.display === 'none';
        helpPanel.style.display = isHidden ? 'block' : 'none';
    }
}

// ─── Display ─────────────────────────────────────────────────────────────────

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

    potOddsDrillState.questionStartTime = Date.now();
}

// ─── Drill Session ───────────────────────────────────────────────────────────

export function startPotOddsDrill(): void {
    // Default to normal difficulty
    const difficulty: PotOddsDifficulty = 'normal';
    const problems = generateBatch(BATCH_SIZE, difficulty);

    setPotOddsDrillState({
        problems,
        currentIndex: 0,
        correctAnswers: 0,
        totalAttempts: 0,
        results: [],
        questionStartTime: Date.now(),
        batchSize: BATCH_SIZE,
        difficulty,
    });

    // Build the help panel HTML (injected once)
    injectHelpPanel();
    injectDifficultyToggle();

    // Hide results, show drill
    const resultDiv = document.getElementById('pot-odds-result');
    if (resultDiv) resultDiv.style.display = 'none';

    const drillMode = document.querySelector('.pot-odds-mode') as HTMLElement;
    if (drillMode) drillMode.style.display = 'block';

    updateDifficultyToggle();
    updateHelpVisibility();
    displayCurrentProblem();
}

function injectDifficultyToggle(): void {
    // Only inject once
    if (document.getElementById('pot-odds-difficulty')) return;

    const drillMode = document.querySelector('.pot-odds-mode');
    if (!drillMode) return;

    const container = document.createElement('div');
    container.id = 'pot-odds-difficulty';
    container.className = 'pot-odds-difficulty';
    container.innerHTML = `
        <button id="pot-odds-easy-btn" class="difficulty-btn">Easy</button>
        <button id="pot-odds-normal-btn" class="difficulty-btn active">Normal</button>
    `;

    // Insert at the top of .pot-odds-display
    const display = drillMode.querySelector('.pot-odds-display');
    if (display) {
        display.insertBefore(container, display.firstChild);
    }

    // Wire up toggle buttons
    document.getElementById('pot-odds-easy-btn')?.addEventListener('click', () => setDifficulty('easy'));
    document.getElementById('pot-odds-normal-btn')?.addEventListener('click', () => setDifficulty('normal'));
}

function injectHelpPanel(): void {
    // Only inject once
    if (document.getElementById('pot-odds-help')) return;

    const drillMode = document.querySelector('.pot-odds-mode');
    if (!drillMode) return;

    const panel = document.createElement('div');
    panel.id = 'pot-odds-help';
    panel.className = 'pot-odds-help';
    panel.innerHTML = `
        <div class="pot-odds-help-header">
            <span class="pot-odds-help-title">How to Calculate Pot Odds</span>
            <button id="pot-odds-help-toggle" class="pot-odds-help-toggle" aria-label="Toggle help">−</button>
        </div>
        ${HELP_HTML}
    `;

    // Insert after the difficulty toggle inside .pot-odds-display
    const display = drillMode.querySelector('.pot-odds-display');
    if (display) {
        display.insertBefore(panel, display.children[1]); // after difficulty toggle
    }

    // Wire up collapse button
    document.getElementById('pot-odds-help-toggle')?.addEventListener('click', () => {
        const content = panel.querySelector('.pot-odds-help-content');
        const toggle = document.getElementById('pot-odds-help-toggle');
        if (content) {
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? 'block' : 'none';
            if (toggle) toggle.textContent = isHidden ? '−' : '+';
        }
    });

    // Start with content visible (easy mode default)
    const content = panel.querySelector('.pot-odds-help-content');
    if (content) content.style.display = 'block';
}

// ─── Answer Handling ─────────────────────────────────────────────────────────

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

    // Visual feedback
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

// ─── Results ──────────────────────────────────────────────────────────────────

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

    const drillMode = document.querySelector('.pot-odds-mode') as HTMLElement;
    if (drillMode) drillMode.style.display = 'none';

    const continueBtn = document.getElementById('pot-odds-continue-btn');
    const restartBtn = document.getElementById('pot-odds-restart-btn');

    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            if (!potOddsDrillState) return;
            const newProblems = generateBatch(BATCH_SIZE, potOddsDrillState.difficulty);
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
