# Poker Range Presets

This file explains how to add or modify preset ranges in the Poker Range Trainer.

## Editing Presets

All presets are stored in `presets.json`. You can edit this file directly without recompiling TypeScript!

### File Structure

Presets support **three formats**:

#### Format 1: Simple (All Hands = Raise)
```json
{
  "preset-id": {
    "name": "Display Name",
    "description": "Brief description of this range",
    "hands": ["AA", "KK", "AKs", "AKo"]
  }
}
```

#### Format 2: Grouped by Action (Recommended ⭐)
```json
{
  "preset-id": {
    "name": "Display Name",
    "description": "Brief description of this range",
    "hands": {
      "raise": ["AA", "KK", "AKs"],
      "call": ["QQ", "JJ"],
      "mix": ["AKo", "AQo"]
    }
  }
}
```

#### Format 3: Individual Hand Mapping
```json
{
  "preset-id": {
    "name": "Display Name",
    "description": "Brief description of this range",
    "hands": {
      "AA": "raise",
      "KK": "raise",
      "AKs": "mix",
      "AKo": "call"
    }
  }
}
```

### Fields

- **preset-id**: Unique identifier (lowercase, use hyphens). This must match the `data-preset` attribute in the HTML button.
- **name**: Human-readable name shown in tooltips or future UI
- **description**: Brief explanation of the preset
- **hands**: Can be:
  - Array of hand strings (all set to "raise")
  - Object grouped by action (e.g., `{"raise": [...], "call": [...]}`) - **Recommended**
  - Object mapping each hand to an action (e.g., `{"AA": "raise", "KK": "call"}`)

### Action Types

When using the advanced format, you can specify these actions:

- `"raise"` - Red (full)
- `"call"` - Green (full)
- `"mix"` - Red/Green split (raise or call)
- `"fold"` - Gray (not included in the range, so you typically wouldn't list these)

### Hand Notation

Use standard poker notation:
- **Pairs**: `AA`, `KK`, `QQ`, `JJ`, `TT`, `99`, `88`, `77`, `66`, `55`, `44`, `33`, `22`
- **Suited**: Add `s` suffix → `AKs`, `KQs`, `76s`, etc.
- **Offsuit**: Add `o` suffix → `AKo`, `KQo`, `76o`, etc.

### Example 1: Simple Preset (All Raise)

1. Open `presets.json`
2. Add a new entry:

```json
{
  "premium-hands": { ... },
  "top-20-percent": { ... },
  "button-opening": {
    "name": "Button Opening Range",
    "description": "Wide opening range from the button position",
    "hands": [
      "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "44", "33", "22",
      "AKs", "AQs", "AJs", "ATs", "A9s", "A8s", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s",
      "KQs", "KJs", "KTs", "K9s", "K8s", "K7s", "K6s", "K5s",
      "QJs", "QTs", "Q9s",
      "JTs", "J9s",
      "T9s", "T8s",
      "98s", "87s", "76s", "65s", "54s",
      "AKo", "AQo", "AJo", "ATo",
      "KQo", "KJo"
    ]
  }
}
```

### Example 2: Advanced Preset (Grouped by Action - Recommended)

```json
{
  "bb-defense-vs-btn": {
    "name": "BB Defense vs Button",
    "description": "Big blind defense range against button open",
    "hands": {
      "raise": ["AA", "KK", "QQ", "AKs", "AQs", "AKo"],
      "mix": ["JJ", "TT", "AJs", "ATs", "KQs", "AQo"],
      "call": ["99", "88", "77", "A9s", "A8s", "KJs", "QJs", "AJo"]
    }
  }
}
```

This format is much cleaner and easier to edit - just group hands by their action type!

3. Add a button in `index.html` (in the "Built-in Presets" section):

```html
<button class="preset-button" data-preset="button-opening">Button Opening</button>
```

4. Save and refresh the browser - no compilation needed!

## Tips

- Keep hands in logical order (pairs, then suited by rank, then offsuit)
- Use comments in arrays are not supported in JSON, so add descriptions to the "description" field
- Validate your JSON syntax at https://jsonlint.com/ before saving
- The app loads presets on startup, so just refresh the page to see changes

## Common Ranges You Might Add

- **UTG Opening**: Tight range for under the gun
- **MP Opening**: Middle position range
- **CO Opening**: Cut-off position range
- **SB Defending**: Small blind defense vs button open
- **BB Defending**: Big blind defense vs various positions
- **3-Bet Range**: Hands to 3-bet with
- **Polarized**: Strong hands + bluffs
- **Linear**: Top X% of hands

## Troubleshooting

- **Preset button doesn't work**: Check that `data-preset` value matches the key in `presets.json`
- **Changes don't appear**: Hard refresh the browser (Ctrl+F5 or Cmd+Shift+R)
- **Syntax error**: Validate JSON at jsonlint.com
- **Hand not appearing**: Check hand notation (AA, AKs, AKo format)

## Technical Details

- Presets are loaded via `fetch()` on app initialization
- All loaded hands are set to "raise" action by default
- The preset system is independent from saved ranges (which are stored in localStorage)

