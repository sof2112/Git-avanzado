import { EventBus } from "./js/events.js";
import { HandPoseTracker } from "./js/handpose.js";
import { GameLogic } from "./js/gamelogic.js";
import { UI } from "./js/ui.js";

// p5 runs in "instance mode" so the app can use ES modules. The p5
// constructor and the ml5 global come from the <script> tags in index.html.
const sketch = (p) => {
  const bus = new EventBus();
  const handPose = new HandPoseTracker(p, bus, globalThis.ml5);
  const game = new GameLogic(p, bus);
  const ui = new UI(p, bus);

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    game.init();
    ui.init();
    // Async: starts webcam + model download, then emits hand events.
    handPose.init().catch((error) => {
      console.error("Failed to start hand tracking:", error);
    });
  };

  p.draw = () => {
    p.background(0); // black canvas: the camera is never drawn, only the skeleton
    handPose.draw();
    game.draw();
    ui.draw();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};

new globalThis.p5(sketch);
