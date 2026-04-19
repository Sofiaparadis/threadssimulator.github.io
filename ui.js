// Handles all the sidebar drawing (stats, buttons, upgrades, and countries)

// this function receives all current game state from sketch.js 
function drawSidebar(money, totalGarments, garmentRate, activeCountry, countries, upgrades, isPaused) {
  let y = 20; // running vertical position tracker - every section adds to it to move down the sidebar

  // white panel + dividing line to separate it from the canvas - can obviously change later when we focus on design 
  fill(255);
  noStroke();
  rect(0, 0, SIDEBAR_WIDTH, height);
  stroke(215);
  line(SIDEBAR_WIDTH, 0, SIDEBAR_WIDTH, height);
  noStroke();

  // title of the game title
  fill(20);
  textStyle(BOLD);
  textSize(14);
  textAlign(LEFT, TOP);
  text("Thread Count", PADDING, y);
  textStyle(NORMAL);
  y += 24;

  // active country indicator - reads the active country's color and draws a small colored dot next to its name 
  let col = countries[activeCountry].col;
  fill(col[0], col[1], col[2]);
  noStroke();
  ellipse(PADDING + 5, y + 6, 10, 10);
  // draws the country name in uppercase followed by its speed multiplier for better legibility 
  fill(120);
  textSize(10);
  textAlign(LEFT, TOP);
  text(countries[activeCountry].name.toUpperCase() + "  x" + countries[activeCountry].mult, PADDING + 14, y + 2);
  y += 20;

  // stats rows - calculates the effective garments per second then bundles the 3 stat rows into an array 
  let perSec = round(garmentRate * countries[activeCountry].mult);
  let stats  = [
    ["Money",         "$" + nfc(floor(money))],
    ["Garments made", nfc(totalGarments)],
    ["Per second",    str(perSec)],
  ];
  // loops through each stat and draws its label in small grey text, then its value in larger dark text below it 
  for (let i = 0; i < stats.length; i++) {
    fill(150);
    textSize(10);
    textAlign(LEFT, TOP);
    text(stats[i][0].toUpperCase(), PADDING, y);
    fill(20);
    textSize(19); // bigger so key numbers are easy to read at a glance
    text(stats[i][1], PADDING, y + 13);
    y += 38;
  }

  y += 4; // little extra gap before the "Make a garment" button to visually separate it from the stats row above it

  // garment button (main click button that produces garments - disabled when paused) - largest button because it's the primary action
  drawButton("Make a garment  +$1", PADDING, y, SIDEBAR_WIDTH - PADDING * 2, 36, !isPaused,
    function() { if (!isPaused) produceGarments(1); },
    14 // bigger font for the most important button
  );
  y += 44;

  // pause / restart buttons side by side
  let halfW = floor((SIDEBAR_WIDTH - PADDING * 2 - 6) / 2); // calculates half the available button width so both buttons sit side by side 
  
  // draws the pause/resume button - label switches between pause and resume depending on state 
  drawButton(isPaused ? "Resume" : "Pause", PADDING, y, halfW, 28, true,
    function() { togglePause(); }
  );
  
  drawButton("Restart", PADDING + halfW + 6, y, halfW, 28, true, function() { resetGame(); }); // draws the restart button 
  y += 42;

  // ── Water + CO2 counters ──────────────────────────────────────────────────
  // these call WaterCO2.js helper functions to get the formatted current totals
  drawSectionLabel("Environmental Impact", y);
  y += 16;

  // water counter - blue to match the water popup
  fill(150);
  textSize(10);
  textAlign(LEFT, TOP);
  text("WATER USED", PADDING, y);
  fill(41, 128, 185);
  textSize(15);
  text(getWaterDisplay(totalGarments), PADDING, y + 13);
  fill(170);
  textSize(9);
  text("2,700 L per garment", PADDING, y + 31);
  y += 46;

  // CO2 counter - green to match the CO2 popup
  fill(150);
  textSize(10);
  textAlign(LEFT, TOP);
  text("CO\u2082 EMITTED", PADDING, y);
  fill(39, 174, 96);
  textSize(15);
  text(getCO2Display(totalGarments), PADDING, y + 13);
  fill(170);
  textSize(9);
  text("10.6 kg CO\u2082e per garment", PADDING, y + 31);
  y += 50;

  // upgrades section: loop through the upgrades array
  drawSectionLabel("Upgrades", y); // upgrades header 
  y += 16;

  // loops through every upgrade and checks if the player can afford it. builds the button label showing the name, rate info, current cost, and how many times it's been bought in the brackets
  for (let i = 0; i < upgrades.length; i++) {
    let u = upgrades[i];
    let canAfford = u.canAfford(money) && !isPaused;
    let label = u.name + "  " + u.info + "  $" + nfc(u.cost) + "  [" + u.count + "]";

    // draws the button - when clicked, deducts the cost from money and increases the count, scales up the price, and returns the rate boost 
    drawButton(label, PADDING, y, SIDEBAR_WIDTH - PADDING * 2, 30, canAfford,
      function() { buyUpgrade(u); },
      11 // slightly bigger than before
    );
    y += 35;
  }

  // countries section
  y += 4;
  // draws production country section header 
  drawSectionLabel("Production Country", y);
  y += 16;

  // loops through every country and checks if it's the currently active one. builds the label and if unlocked it shows the multiplier, if locked it shows the unlock cost 
  for (let i = 0; i < countries.length; i++) {
    let c        = countries[i];
    let isActive = (i === activeCountry);
    let label    = c.unlocked ? c.name + "  x" + c.mult : c.name + "  $" + c.cost;
    let canClick = (c.unlocked || money >= c.cost) && !isPaused;

    // draws the country button
    drawCountryButton(label, PADDING, y, SIDEBAR_WIDTH - PADDING * 2, 30, canClick, isActive, c.col,
      function() {
        if (!c.unlocked && money >= c.cost && !isPaused) { // when clicked, if locked and affordable, deducts the cost, unlocks it, and switches to it 
          money -= c.cost;
          c.unlock();
          setActiveCountry(i);
        } else if (c.unlocked) { // if already unlocked, just switches to it 
          setActiveCountry(i);
        }
      },
      11 // slightly bigger than before
    );
    y += 35;
  }

  // country info blurb - draws the active country's info blurb at the bottom of the sidebar in small grey text 
  fill(150);
  textSize(9);
  textAlign(LEFT, TOP);
  text(countries[activeCountry].info, PADDING, y + 4);
}

// button helpers 

// small reusable helper that draws a grey uppercase section header (used for upgrades, environmental impact, and production country)
function drawSectionLabel(txt, y) {
  fill(150);
  textSize(9);
  textAlign(LEFT, TOP);
  text(txt.toUpperCase(), PADDING, y);
}

// draws a rounded rectangle - white with a grey border if enabled, slightly grey with a light border if disabled - can obviously change later
// fontSize is optional — defaults to 10, but callers can pass a bigger size for important buttons
function drawButton(label, x, y, w, h, enabled, action, fontSize) {
  let fs = fontSize || 10; // use provided font size or fall back to 10
  if (enabled) { fill(255); stroke(185); }
  else         { fill(245); stroke(215); }
  strokeWeight(1);
  rect(x, y, w, h, 6);

  // draws the label text - dark if enabled, light grey if disabled - can obviously be changed later 
  fill(enabled ? 20 : 185);
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(fs);
  text(label, x + 8, y + h / 2);

  if (enabled) buttonList.push({ x, y, w, h, action }); // only adds the button to buttonlist if it's enabled, disabled buttons can't be clicked 
}

// country button - same as drawButton but with 3 visual states
function drawCountryButton(label, x, y, w, h, enabled, isActive, col, action, fontSize) {
  let fs = fontSize || 10;
  if (isActive) { fill(245); stroke(col[0], col[1], col[2]); strokeWeight(2); } // colored border matching the country
  else if (enabled) { fill(255); stroke(185); strokeWeight(1); } 
  // normal 
  else { fill(245); stroke(215); strokeWeight(1); } // greyed out 
  rect(x, y, w, h, 6); 

  // draws a thin colored stripe on the left edge of the button using the country's color (better visuals for users)
  noStroke();
  fill(col[0], col[1], col[2], 200);
  rect(x, y, 4, h, 6, 0, 0, 6);

  // draws the label text then registers the button if enabled 
  fill(enabled ? 20 : 185);
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(fs);
  text(label, x + 12, y + h / 2);

  if (enabled) buttonList.push({ x, y, w, h, action });
}
