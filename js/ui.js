/**
 * UI is the View for the HUD and interface elements (score, menus, etc.).
 * It subscribes to EventBus events it cares about and draws on the p5 canvas
 * in its draw() method, called from the sketch's draw loop.
 */
export class UI {
  constructor(p, bus) {
    this.p = p;
    this.bus = bus;
  }

  init() {
    // TODO: subscribe to the events the HUD needs (e.g. score updates).
  }

  draw() {
    // TODO: render the HUD (score, menu, messages, etc.).
  }
}
