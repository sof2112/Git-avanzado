import { EVENTS } from "./events.js";

/**
 * HandPoseTracker owns everything hand-related: the webcam capture, the
 * ml5.js handPose model, the detection loop, and drawing the hand skeleton.
 *
 * It captures the camera but NEVER draws the video feed — only the skeleton
 * (bones as lines + circles at the joints) on top of the black canvas.
 *
 * Other modules receive hand data through the EventBus: on every detection
 * frame it emits EVENTS.HANDS_UPDATED with the raw ml5 result (an array of
 * hands; each hand has .keypoints, .keypoints3D, .handedness, plus named
 * points such as hand.index_finger_tip or hand.wrist).
 */
export class HandPoseTracker {
  constructor(p, bus, ml5) {
    this.p = p; // p5 instance (instance mode)
    this.bus = bus; // shared EventBus
    this.ml5 = ml5; // the ml5 global, loaded via <script> in index.html
    this.model = null;
    this.video = null;
    this.connections = [];
    this.hands = [];
  }

  async init() {
    // Create the model first so the hand landmark files start downloading.
    this.model = this.ml5.handPose({ maxHands: 2, flipped: true });
    this.connections = this.model.getConnections();

    // Start the webcam early so the permission prompt appears immediately.
    // `.hide()` keeps capturing while hiding the <video> element.
    this.video = this.p.createCapture(this.p.VIDEO);
    this.video.hide();

    // Wait until the model has fully loaded before starting detection.
    await this.model.ready;

    this.model.detectStart(this.video, (hands) => this.onHands(hands));
  }

  // Called by ml5 on every detection frame.
  onHands(hands) {
    this.hands = hands;
    this.bus.emit(EVENTS.HANDS_UPDATED, hands);
  }

  draw() {
    const p = this.p;
    if (!this.video || this.hands.length === 0) return;

    // Keypoints come in video pixel space. Map them onto the canvas while
    // preserving aspect ratio and centering (letterbox).
    const vw = this.video.elt.videoWidth || 640;
    const vh = this.video.elt.videoHeight || 480;
    const scale = Math.min(p.width / vw, p.height / vh);
    const offsetX = (p.width - vw * scale) / 2;
    const offsetY = (p.height - vh * scale) / 2;
    const x = (k) => k * scale + offsetX;
    const y = (k) => k * scale + offsetY;

    p.push();
    for (const hand of this.hands) {
      const keypoints = hand.keypoints;

      // Bones: lines between connected keypoints.
      p.stroke(0, 255, 160);
      p.strokeWeight(3);
      for (const [a, b] of this.connections) {
        p.line(x(keypoints[a].x), y(keypoints[a].y), x(keypoints[b].x), y(keypoints[b].y));
      }

      // Joints: circles at every keypoint.
      p.noStroke();
      p.fill(255);
      for (const kp of keypoints) {
        p.circle(x(kp.x), y(kp.y), 8);
      }
    }
    p.pop();
  }
}
