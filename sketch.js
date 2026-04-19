// core functions, game state variables, country/upgrade data, logic for producing garments, spawning them on screen, resetting the game, and mouse clicks

let introBg;

// one t shirt image with color per country, loaded in preload() and indexed to match the countries array order- instead of tint
let tshirtImgs = [];

function preload() {
  introBg        = loadImage('introbg.jpg'); // only used on the intro screen
  tshirtImgs[0]  = loadImage('tshirt_us.png');
  tshirtImgs[1]  = loadImage('tshirt_mx.png');
  tshirtImgs[2]  = loadImage('tshirt_bd.png');
  tshirtImgs[3]  = loadImage('tshirt_vn.png');
  tshirtImgs[4]  = loadImage('tshirt_cn.png');
}

// layout for sidebar
let SIDEBAR_WIDTH = 260;
let PADDING = 14;

// gameState controls whether we're on the intro screen or in the simulation
// "intro" shows the landing page drawn in intro.js
// "game"  runs the full simulation
let gameState = "intro";

// game state variables 
let money = 0; // current $ balance
let totalGarments = 0; // total garments produced 
let garmentRate = 0; // garments produced / second (increases w/ upgrades)
let isPaused = false; // pause 
let lastTime = 0; // timestamp of the last frame, used to calculate time between frames 
let leftover = 0; // fractional garments saved between frames (makes sure no fractions of garment
let activeCountry = 0; // index (0-4) of which country is currently selected its 0-4 because we have 5 countries

// object arrays
let garmentList = [];  // holds all garments currently floating on screen
let buttonList  = [];  // holds all clickable buttons drawn by ui.js each frame (cleared and rebuilt every frame so buttons always reflect the current game state)

// upgrades data: creates 4 upgrades using Upgrade.js
let upgrades = [ 
  new Upgrade("Hire a worker",       "+1/sec",  25,   1 ),
  new Upgrade("Add sewing machines", "+2/sec",  90,   2 ),
  new Upgrade("Open a workshop",     "+6/sec",  400,  6 ),
  new Upgrade("Automated factory",   "+10/sec", 1500, 10),
];

// countries data: index order must match tshirtImgs[] order above
let countries = [
  new Country("United States (local)", 0,    1,   [100, 145, 210], "Base speed x1. Every upgrade works at face value."),
  new Country("Mexico",                60,   2,   [210, 140,  60], "x2 speed. Lower wages, faster output per dollar."),
  new Country("Bangladesh",            250,  4,   [190,  80, 120], "x4 speed. One of the world's biggest garment exporters."),
  new Country("Vietnam",               700,  6.5, [ 80, 180, 130], "x6.5 speed. Rapidly growing manufacturing hub."),
  new Country("China",                 2500, 10,  [210,  70,  70], "x10 speed. World's largest textile producer."),
];

// setup function
function setup() {
  createCanvas(windowWidth, windowHeight);
  lastTime = millis(); // records starting time so delta time can be calculated from the first frame (prevents garments from spawning the moment the game opens) we learned this the hard way
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // if user resizes the browser, this automatically resizes the canvas to match 
}

// draw function 
function draw() {
  buttonList = []; // clears button list at the start of every frame so last frame's buttons don't stack

  // if we're still on the intro page, draw that and stop — don't run the simulation yet
  if (gameState === "intro") {
    drawIntro(); // defined in intro.js
    return;
  }

  // calculates delta time (how many seconds have passed since the last frame). capped at 0.5s so switching tabs doesn't burst-produce garments
  let dt = min((millis() - lastTime) / 1000, 0.5);
  lastTime = millis();

  // auto-production: accumulate fractional garments so none are lost
  // also blocked if a popup is currently showing (isPopupActive() comes from WaterCO2.js)
  if (!isPaused && !isPopupActive() && garmentRate > 0) {
    let effectiveRate = garmentRate * countries[activeCountry].mult; // multiplies garmentRate by the active country's speed multiplier 
    leftover += effectiveRate * dt; // adds the fractional amount earned this frame to leftover 
    let n = floor(leftover); // once leftover reaches a whole number, that many garments are produced and subtracted back out so no partial garments are lost 
    if (n > 0) {
      produceGarments(n);
      leftover -= n;
    }
  }

  // plain background for the game canvas — introbg is only used on the intro screen to prevent lag that it was causing
  background(232, 230, 226);

  // update + draw garments, remove off-screen ones (backwards loop using splice)
  for (let i = garmentList.length - 1; i >= 0; i--) {
    // garments also freeze when a popup is active so nothing moves while the user is reading
    if (!isPaused && !isPopupActive()) garmentList[i].update(); // if game isn't paused, move garment upward
    if (garmentList[i].isOffScreen()) { // if garment has floated off the top of the screen, delete it from the list 
      garmentList.splice(i, 1);
    } else { // otherwise, display garment on screen 
      garmentList[i].display();
    }
  }

  // drawSidebar sends all the game's current info like money, garments, countries, etc. to ui.js so it can draw the sidebar 
  drawSidebar(money, totalGarments, garmentRate, activeCountry, countries, upgrades, isPaused);

  // pause overlay - when the game is paused, it draws a semi transparent dark overlay over the canvas area and displays "PAUSED" in the center 
  if (isPaused) {
    fill(0, 0, 0, 55);
    noStroke();
    rect(SIDEBAR_WIDTH, 0, width - SIDEBAR_WIDTH, height);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(22);
    text("PAUSED", SIDEBAR_WIDTH + (width - SIDEBAR_WIDTH) / 2, height / 2);
  }

  // draws the milestone popup on top of everything if one is active — defined in WaterCO2.js
  drawPopupIfActive();
}

// game logic 
function produceGarments(amount) { // adds to the garment and money counts then spawns up to 12 visual garments per frame (we capped it so the screen doesn't get overwhelmed in one frame)
  totalGarments += amount;
  money         += amount;
  let toSpawn    = min(amount, 12);
  for (let i = 0; i < toSpawn; i++) spawnGarment();
  checkMilestones(totalGarments); // checks after every batch whether a water or CO2 milestone has been crossed — defined in WaterCO2.js
}

function spawnGarment() {
  // stores activeCountry index at spawn time so the garment always uses the right image
  // switching countries later won't affect garments already on screen
  let baseSpeed = random(0.8, 2.2); // gives it a random base speed + a small boost based on how fast the game is currently running
  let boost     = min(garmentRate * countries[activeCountry].mult * 0.008, 4);

  let g = new Garment( // spawns garments just below the bottom of the screen at a random horizontal position 
    SIDEBAR_WIDTH + 20 + random(width - SIDEBAR_WIDTH - 40),
    height + 20,
    baseSpeed + boost,
    activeCountry // index into tshirtImgs[] and countries[]
  );

  garmentList.push(g); // adds it to garmentList and if there are over 500 garments, it removes the oldest ones to keep memory in check
  if (garmentList.length > 500) garmentList.shift();
}

function resetGame() { // resets every single game state variable back to 0/default and clears garmentList
  money         = 0;
  totalGarments = 0;
  garmentRate   = 0;
  isPaused      = false;
  leftover      = 0;
  activeCountry = 0;
  garmentList   = [];
  // also resets every upgrade and country so it returns to starting state
  for (let i = 0; i < upgrades.length; i++)  upgrades[i].reset();
  for (let i = 0; i < countries.length; i++) countries[i].reset();
  resetWaterCO2(); // resets the water and CO2 popup flags so they can fire again — defined in WaterCO2.js
}

function setActiveCountry(i) { activeCountry = i; }
function togglePause()        { isPaused = !isPaused; }

function buyUpgrade(u) {
  if (u.canAfford(money) && !isPaused) {
    money       -= u.cost;
    garmentRate += u.purchase();
  }
}

function mousePressed() { // every time user clicks, loops through all the buttons and checks if the mouse position is inside any of them. if match is found, it runs that button's action and stops
  for (let i = 0; i < buttonList.length; i++) {
    let b = buttonList[i];
    if (mouseX > b.x && mouseX < b.x + b.w &&
        mouseY > b.y && mouseY < b.y + b.h) {
      b.action(); // called with no arguments so the mouse event object doesn't get passed through
      return; // only one button fires per click
    }
  }
}
