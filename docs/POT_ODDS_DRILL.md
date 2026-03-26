# Feature: Pot Odds Drill

## Concept: What Are Pot Odds?

Pot odds measure the ratio between the cost of a call and the potential reward (the pot). They answer: **"What minimum equity (% chance of winning) do I need to profitably call this bet?"**

### The Formula

```
Required Equity = Call Amount / (Pot + Opponent's Bet + Call Amount)
```

Or more simply:
```
Required Equity = Call / Final Pot
```

Where **Final Pot** = current pot + opponent's bet + your call.

### Example

- Pot: $100
- Opponent bets: $50
- Final pot if you call: $100 + $50 + $50 = $200
- Required equity: $50 / $200 = **25%**

You need ≥25% equity to make a profitable call.

### Common Bet Size → Required Equity Reference

| Bet as % of Pot | Required Equity |
|-----------------|----------------|
| 25%             | ~17%           |
| 33%             | ~20%           |
| 50%             | ~25%           |
| 66%             | ~28%           |
| 75%             | ~30%           |
| 100% (pot)      | ~33%           |
| 150%            | ~38%           |
| 200%            | ~40%           |

### Why This Drill Matters

In live poker, you have seconds to decide. Players who can instantly estimate required equity make better call/fold decisions under pressure. The drill trains **speed and accuracy** of this mental math — no cards, no ranges, just pure pot odds calculation.

---

## Drill Design

### User Experience

1. User navigates to Train Mode and selects **"Pot Odds"** as the training mode (alongside existing Range Recall and Spot Drill)
2. A clean display shows:
   - **Pot** amount (large, prominent heading) — e.g., "Pot: $1,243"
   - **Bet** amount (subheading) — e.g., "Bet: $850"
3. Four multiple-choice buttons appear, each showing a percentage (e.g., "20%", "33%", "41%", "55%")
4. One button is the correct answer (or closest to correct). The other three are plausible distractors.
5. User taps/clicks their answer:
   - ✓ Correct → brief green flash + toast, advance to next problem
   - ✗ Wrong → brief red flash + toast showing correct answer, advance after 1s delay
6. After N rounds (configurable, default 10), show results summary

### Problem Generation

#### Pot & Bet Ranges

Generate realistic poker scenarios:

- **Pot range**: $20 – $5,000 (weighted toward common sizes)
- **Bet range**: 25% – 200% of pot (common bet sizing)
- Use "messy" numbers (not always round) to simulate real play: $843, $1,175, $67, etc.

#### Generating Scenarios

```typescript
function generatePotOddsProblem(): PotOddsProblem {
  // 1. Pick a pot size
  const pot = randomPot();  // e.g., $1,243
  
  // 2. Pick a bet as a fraction of pot (25%-200%)
  const betFraction = randomBetFraction();  // e.g., 0.68
  const bet = Math.round(pot * betFraction);  // e.g., $845
  
  // 3. Calculate correct equity
  const finalPot = pot + bet + bet;  // pot + bet + call
  const correctEquity = Math.round((bet / finalPot) * 100);  // e.g., 27%
  
  // 4. Generate distractors (plausible wrong answers)
  const options = generateOptions(correctEquity);  // e.g., [18%, 27%, 35%, 44%]
  
  return { pot, bet, correctEquity, options };
}
```

#### Distractor Generation

- Always include the correct answer
- Generate 3 distractors that are **plausible but wrong**:
  - One "close miss" (±3-5%)
  - One "common mistake" (e.g., bet/pot instead of bet/finalPot)
  - One clearly wrong but not absurd (±10-15%)
- Shuffle all 4 options
- Ensure no duplicates and all values between 5%-70%

### Difficulty Levels (Future Enhancement)

For v1, keep it simple — one difficulty. Future versions could add:

- **Easy**: Round numbers, common bet sizes (1/3, 1/2, pot)
- **Medium**: Messier numbers, wider bet sizing range
- **Hard**: Multi-bet scenarios, implied odds considerations

### Scoring & Feedback

- Track: correct/total, accuracy %, average response time
- After each batch of 10:
  - Show accuracy percentage
  - Show average time per answer
  - "Continue" button to do 10 more
  - "Restart" button to reset stats
- Optional: streak counter for consecutive correct answers

---

## Technical Plan

### New Files

- `src/pot-odds.ts` — All pot odds drill logic (generation, validation, state)

### Modified Files

- `src/types.ts` — Add `PotOddsDrillState` interface and `'pot-odds'` to `TrainingMode`
- `src/state.ts` — Add pot odds state variables and setters
- `src/training.ts` — Add pot odds mode to `switchTrainingMode()` and `updateTrainingModeDisplay()`
- `src/app.ts` — Wire up pot odds button event listeners
- `index.html` — Add pot odds training mode button + drill UI section
- `styles.css` / `components.css` — Styles for pot odds drill display

### Type Additions (`src/types.ts`)

```typescript
// Extend TrainingMode
export type TrainingMode = 'range-recall' | 'spot-drill' | 'pot-odds';

// New interfaces
export interface PotOddsProblem {
  pot: number;
  bet: number;
  correctEquity: number;  // percentage as integer (e.g., 25)
  options: number[];       // four percentage choices
}

export interface PotOddsDrillState {
  problems: PotOddsProblem[];
  currentIndex: number;
  correctAnswers: number;
  totalAttempts: number;
  results: Array<{
    problem: PotOddsProblem;
    userAnswer: number;
    correct: boolean;
    responseTimeMs: number;
  }>;
  questionStartTime: number;  // timestamp when current question was displayed
  batchSize: number;          // problems per round (default 10)
}
```

### HTML Structure (new section in `index.html`)

```html
<!-- Pot Odds Drill Mode -->
<div class="pot-odds-mode train-only" style="display: none;">
  <div class="pot-odds-display">
    <div class="pot-odds-scenario">
      <div class="pot-amount">
        <span class="pot-label">POT</span>
        <span id="pot-value" class="pot-value">$1,243</span>
      </div>
      <div class="bet-amount">
        <span class="bet-label">BET</span>
        <span id="bet-value" class="bet-value">$850</span>
      </div>
    </div>
    <p class="pot-odds-instruction">What equity do you need to call?</p>
    <div class="pot-odds-options" id="pot-odds-options">
      <button class="pot-odds-btn" data-equity="20">20%</button>
      <button class="pot-odds-btn" data-equity="29">29%</button>
      <button class="pot-odds-btn" data-equity="35">35%</button>
      <button class="pot-odds-btn" data-equity="44">44%</button>
    </div>
  </div>
  <div class="pot-odds-progress">
    <p>Progress: <span id="pot-odds-progress-text">0 / 10</span></p>
  </div>
</div>

<!-- Pot Odds Results -->
<div id="pot-odds-result" class="pot-odds-result train-only" style="display: none;"></div>
```

### CSS Styling (matching existing design system)

The pot odds drill UI should:

- Use the dark theme from `design-tokens.css` (surface colors, gold primary)
- Pot amount: `--text-4xl` or `--text-5xl`, Noto Serif, gold color (`--primary`)
- Bet amount: `--text-3xl`, slightly muted
- Option buttons: large tap targets (min 80px × 48px), `--surface-container-high` background
- Correct flash: brief green glow using `--success`
- Wrong flash: brief red glow using `--error`
- Centered layout, works on mobile

### Integration Points

1. **Training mode selector**: Add a third button "Pot Odds" next to "Range Recall" and "Spot Drill"
2. **Mode switching**: Pot Odds drill doesn't need a loaded range — it's standalone. The mode toggle should allow entering Pot Odds even without a range selected.
3. **State management**: Follows same pattern as spot drill (state object, generate → display → handle answer → advance)

### Implementation Order

1. Add types and state scaffolding
2. Build `src/pot-odds.ts` with problem generation + drill logic
3. Add HTML structure for the drill UI
4. Add CSS styles matching design system
5. Wire up event listeners in `src/app.ts`
6. Integrate into training mode switching in `src/training.ts`
7. Compile TypeScript → test in browser
8. Polish: animations, mobile responsiveness, edge cases

---

## Scope & Non-Goals

### In Scope (v1)
- Single-scenario pot odds calculation drill
- 4-option multiple choice
- Accuracy + response time tracking
- Results summary after 10 rounds
- Continue / restart flow
- Mobile-friendly
- Matches existing design system

### Out of Scope (future)
- Difficulty levels
- Implied odds / reverse implied odds
- Multi-street scenarios
- Leaderboard / history persistence
- Outs-to-equity conversion (rule of 2 and 4)
- Custom pot/bet ranges

---

## References

- [Upswing Poker — How to Calculate Pot Odds](https://upswingpoker.com/pot-odds-step-by-step/)
- [GTO Wizard — What Are Pot Odds?](https://blog.gtowizard.com/what-are-pot-odds-in-poker/)
- [Wikipedia — Pot odds](https://en.wikipedia.org/wiki/Pot_odds)
