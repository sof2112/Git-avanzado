import { EVENTS } from "./events.js";

/**
 * GameLogic is the Model: it owns the game state and rules, and reacts to
 * hand data produced by HandPoseTracker. It never talks to HandPoseTracker
 * or UI directly — it only subscribes to EventBus events.
 */
export class GameLogic {
  constructor(p, bus) {
    this.p = p;
    this.bus = bus;
    this.hands = [];
  }

  init() {
    // Receive hand landmarks every detection frame.
    this.bus.on(EVENTS.HANDS_UPDATED, (hands) => {
      this.hands = hands;
      // TODO: implement game rules using hand landmarks.
      // e.g. hands[0].index_finger_tip.x / .y
    });
  }

  draw() {
    // TODO: render game state (entities, score, etc.) here.
  }
}
