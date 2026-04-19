// Blueprint that draws the landing page the player sees before the game starts. Once the player clicks "Start", gameState becomes "game" and the simulation begins

function drawIntro() {
  // draw image scaled to fill the full canvas, then a dark overlay so text stays readable
  image(introBg, 0, 0, width, height);
  fill(0, 0, 0, 10); // tweak the last value (0-255) to make overlay darker or lighter
  noStroke();
  rect(0, 0, width, height);

// title
  fill(20);
  textStyle(BOLD);
  textSize(42);
  textAlign(CENTER, TOP);
  text("Thread Count", width / 2, height / 2 - 160); 
  textStyle(NORMAL);

// tagline
  fill(120);
  textSize(20);
  textAlign(CENTER, TOP);
  text("Visualizing Fast Fashion at Scale", width / 2, height / 2 - 108);

// divider
  stroke(210);
  strokeWeight(1);
  line(width / 2 - 140, height / 2 - 82, width / 2 + 140, height / 2 - 82);
  noStroke(); // turn off stroke so shapes drawn after this line do not have an outline 

// description paragraph 
  fill(60);
  textSize(15);
  textAlign(CENTER, TOP); // passing x, y, width, height to text() tells p5 to wrap the text inside that box instead of drawing it all on one line
  text(
    "This is a production simulator is set inside a fast fashion factory. " +
    "Click to make garments, buy upgrades to speed up production, and outsource work to countries around the world. " +
    "As your factory scales up, the true cost of fast fashion (in water, carbon emissions) starts to show. " +
    "Every garment has a price beyond the tag.",
    width / 2 - 280, height / 2 - 50, 560, 120
  );

// explains how to play 
  fill(140);
  textSize(15);
  textAlign(CENTER, TOP);
  text("Click \"Make a garment\"  to produce  ·  Buy upgrades to automate  ·  Unlock countries to scale", width / 2, height / 2 + 55);

// start button 
  let btnW = 140;
  let btnH = 40;
  let btnX = width  / 2 - btnW / 2;
  let btnY = height / 2 + 90;

  fill(20);
  noStroke();
  rect(btnX, btnY, btnW, btnH, 8);

  fill(255);
  textSize(13);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text("Start", btnX + btnW / 2, btnY + btnH / 2);
  textStyle(NORMAL);

// when clicked, it sets gameState to "game" which switches the simulation on
  buttonList.push({
    x: btnX, y: btnY, w: btnW, h: btnH,
    action: function() { gameState = "game"; }
  });
}
