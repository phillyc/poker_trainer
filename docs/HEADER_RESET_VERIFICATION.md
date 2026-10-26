# Header Reset — Verification Report

Task: **Verify reset behavior manually and with automated checks** (t_5340a0b1)
Date: 2026-10-26
Branch under test: `wt/t_b159d466` (merge-fast-forwarded into `wt/t_5340a0b1`, commit `bd17289` on top of `origin/main d968484`)

## Summary

The header reset feature (clicking the top-left 🃏 / "Poker Trainer" brand) **works reliably from every tested state** in both Chromium and Firefox, on desktop and mobile viewports, with zero console errors and zero regressions found.

## 1. Automated tests

A vitest harness exists (`tests/header-reset.test.ts`, 519 lines) — 12 tests, all passing:

```
Test Files  1 passed (1)
     Tests  12 passed (12)
```

Coverage includes:
- **Unit (6):** `resetAppToInitialState()` restores every state var (15 vars incl. handsState all-fold, modes, drill states, drag/touch state), idempotence, localStorage preserved, defensive DOM (no throw when elements missing), train-feedback classes cleared.
- **Integration (6):** boots real `src/app.ts`, dispatches real UI events — click on icon, click on text, keyboard Enter, keyboard Space (and non-activation keys do NOT reset), localStorage preserved through a click, repeated clicks (no listener accumulation).

Run with: `npm ci && npm test`

## 2. Manual verification — Chromium (headless Chrome 145, via CDP)

Scenario|Before|After reset|Result
---|---|---|---
Fresh load (default state)|0/169, editor-view|0/169, editor-view, toast "App reset to default state"|✅ idempotent
169 hands painted (Select All)|100.0% — 169/169|0.0% — 0/169|✅
Mid Range-Recall training|range-recall-view, train-only-nav visible, grid in #train-grid-anchor|editor-view, grid back in #editor-view, train-only-nav hidden|✅
Pot Odds drill, answered 1/10|pot-odds-view, progress 1/10|editor-view, stats 0/169, result panels hidden|✅
Pot Odds drill + keyboard **Space**|pot-odds-view|editor-view, nav tab editor, edit mode raise|✅
Pot Odds drill + keyboard **Enter**|pot-odds-view|editor-view, toast shown|✅
Mobile viewport (390×844, touch emulation), nav open + 169 painted + Practice tab|nav-bar mobile-open, backdrop show|nav closed (mobile-open removed, backdrop hidden, hamburger icon restored), editor tab, 0/169|✅
Mobile mid-state reset|select-all painted, nav open, practice tab|nav closed, editor tab, 0/169|✅

**Console:** 0 errors / 0 warnings across all Chromium scenarios.

**localStorage:** `poker-trainer-saved-ranges` preserved after reset (verified with a fake saved range).

## 3. Manual verification — Firefox (Playwright, headless)

Scenario|Before|After reset|Result
---|---|---|---
Fresh load, click brand|0/169, editor-view|0/169, editor-view, toast|✅
Range-Recall mid-train, click brand|range-recall-view|editor-view, grid parent #editor-view, 0/169|✅
Pot Odds drill, answered (next problem shown, 1/10), click brand|pot-odds-view|editor-view, 0/169|✅
Spot Drill + keyboard **Enter**|spot-drill-view|editor-view, 0/169|✅
Mobile 390×844 (Playwright mobile context), nav open + Select All + Practice tab, tap brand|169/169, nav open|nav closed, 0/169, editor tab, editor-view|✅

**Console (console.error + pageerror):** 0 across all Firefox scenarios. **localStorage:** preserved.

## 4. Regression checks

- Select All → 169/169 ✅
- Edit-mode buttons (raise/call) ✅
- Clear All (reset-btn) ✅
- Save Range with painted hands → appears in Library saved list ✅
- Load preset → 30.2% (51/169) ✅
- Start Range-Recall → back-to-editor button ✅
- Paint after returning to editor ✅
- No console errors/warnings in any of the above ✅

## 5. Live URL note

`https://philc.io/poker_trainer/` is served from the `gh-pages` branch, which is only rebuilt on push to `main`
(`.github/workflows/deploy.yml`). At verification time the deployed `app.js` did **not** contain the reset
handler (brand has no `role=button`, clicking after painting leaves 169/169 unchanged) — expected, because
the feature branch has not been merged to `main` yet. The verified bundle is what deploys once merged.

## Verdict

- ✅ Reset works consistently from all tested states (fresh load, painted hands, mid Range-Recall, mid Pot-Odds answered, Spot Drill, mobile nav open, keyboard + click)
- ✅ Automated tests exist and pass (12 vitest tests including integration click/keyboard simulation)
- ✅ No new bugs found — normal interactions intact, zero console errors/warnings