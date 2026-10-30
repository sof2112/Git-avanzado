# AGENTS.md

Static p5.js + ml5.js project. No build system, package manager, tests, linter, or CI — there is no `package.json`. Entry point is `index.html`; serve the repo root directly (any static server, e.g. `npx serve .`).

## Loading & module system

`index.html` loads two libraries as global `<script>` tags, then the app as an ES module:

- p5.js 2.3.3 (CDN) → global `p5`
- ml5.js 1.4.0 (CDN) → global `ml5`
- `sketch.js` via `<script type="module">`

App code uses **ES modules + p5 instance mode**. `sketch.js` is the composition root: it calls `new p5(sketch)` and wires the feature modules together. Do not switch back to p5 global mode or plain `<script>` tags for app files.

## Architecture

```
sketch.js       → composition root: p5 instance mode, wires modules, runs draw()
js/events.js    → EventBus (pub/sub) + EVENTS constants
js/handpose.js  → HandPoseTracker: webcam + ml5 handPose + skeleton rendering
js/gamelogic.js → GameLogic: game state and rules (Model)
js/ui.js        → UI: HUD (View)
```

Modules communicate **only** through the shared `EventBus` — they do not import or call each other directly. `handpose` emits `EVENTS.HANDS_UPDATED` with the raw ml5 hand array; `gamelogic` subscribes and reacts. Keep this pattern when adding features.

Each feature module takes `(p, bus)` in its constructor: `p` is the p5 instance, `bus` is the EventBus. Rendering lives in each module's `draw()` method, called from the sketch's draw loop.

## Hand tracking

- `ml5.handPose()` (capital P) is the current v1.x API. Do NOT use the old `ml5.handpose()` (lowercase p) — it is deprecated.
- The camera is captured but never drawn: `p.createCapture(p.VIDEO)` + `.hide()`. Only the skeleton is rendered on the black canvas.
- Hand keypoints arrive in video pixel space; `handpose.js` maps them to the canvas (letterboxed) in its `draw()`.

## Gotchas

- `ml5.handPose()` returns the model instance immediately; wait on `model.ready` before calling `detectStart()`, otherwise detection can run before the model finishes downloading.
