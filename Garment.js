// Blueprint for every floating garment the user sees on the canvas. Each garment knows its own position, speed, and which pre-colored image to draw.
// countryIndex is locked in at spawn time — switching countries later won't affect garments already on screen.

class Garment {
  constructor(x, y, speed, countryIndex) {
    this.x            = x;
    this.y            = y;
    this.speed        = speed;
    this.size         = 22;         // controls how big the t-shirt renders — bump this up if shirts feel too small
    this.countryIndex = countryIndex; // index into tshirtImgs[] — set once at spawn, never changes
  }

  update() {
    this.y -= this.speed; // moves the garment upward each frame
  }

  display() {
    // draws the pre-colored PNG for this garment's country — no tint(), no pixel processing, just a plain image draw
    push();
    translate(this.x, this.y);
    imageMode(CENTER);
    image(tshirtImgs[this.countryIndex], 0, 0, this.size * 1.6, this.size * 1.2); // slightly wider than tall to match t-shirt proportions
    pop();
  }

  isOffScreen() {
    return this.y < -50; // 50px buffer so shirts fully disappear before being removed from the array
  }
}
