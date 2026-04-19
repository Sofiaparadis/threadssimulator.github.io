// Blueprint that tracks how much water and CO2 the player has used based on how many garments they've produced AND shows educational popups at certain production milestones (1, 10, 1000, 1500 garments)

// real-world stats per garment
const WATER_PER_GARMENT = 2700;  // how much water one garment costs in real life (liters) Source: WWF
const CO2_PER_GARMENT   = 10.6; // how much CO2 one garment produces in real life (in kg) Source: carbonfact

// the four milestone thresholds (each pops up once when totalGarments crosses it). each one has a garment threshold, which includes type, title, big stat, body text, and a color
const MILESTONES = [
  {
    at: 1, // pops up when the player makes 1 garment 
    type: "water", // categorizes the popup 
    title: "Water usage",
    stat: "2,700 liters", // number shown on pop up 
    body: "1 t-shirt uses 2,700 liters of water. That's enough drinking water for one person for 5.6 years!", // Source: CDC - avg person drinks 44 ounces of water/day = 1.3L, 2700 / (1.3 x 365) = ~5.6 years
    color: [41, 128, 185] // blue for water
  },
  {
    at: 1000, // pops up when the player makes 1000 garments
    type: "water",
    title: "Water usage milestone",
    stat: "2.7 million liters",
    body: "You've used 2.7 million liters of water. That's more than a full Olympic swimming pool.", // Source: USA Today - an Olympic pool holds ~660,000 gallons of water = ~2,500,000 liters
    color: [41, 128, 185]
  },
  {
    at: 10, // pops up when the player makes 10 garments
    type: "co2",
    title: "Carbon emissions",
    stat: "106 kg CO\u2082e", // \u2082 is the unicode character for the subscript 2 in CO2
    body: "10 garments produced the same emissions as leaving a lightbulb on for over a year.", // Source: 100W bulb uses ~750kg CO2/year, 106kg / 750kg = ~1.4 years
    color: [39, 174, 96]
  },
  {
    at: 1500, // pops up when the player makes 1500 garments
    type: "co2",
    title: "Carbon emissions milestone",
    stat: "15,900 kg CO\u2082e",
    body: "You've emitted as much CO\u2082 as the average American produces in an entire year.", // Source: US per capita carbon footprint ~16.2 metric tons
    color: [39, 174, 96]
  },
];

// tracks which milestones have already popped up so each only shows once
let shownMilestones = new Set();

// queue so if two milestones hit on the same frame, they show in order instead of one overwriting the other
let popupQueue   = [];
let popupActive  = false;
let currentPopup = null; // the popup currently on screen (null if none)

// called every time garments are produced and checks if any milestone has just been crossed
function checkMilestones(totalGarments) {
  for (let i = 0; i < MILESTONES.length; i++) {
    let m = MILESTONES[i];
    if (totalGarments >= m.at && !shownMilestones.has(m.at)) {
      shownMilestones.add(m.at);
      // if nothing is showing, show it immediately — otherwise add it to the queue so it doesn't overwrite
      if (!popupActive) {
        currentPopup = m;
        popupActive  = true;
      } else {
        popupQueue.push(m);
      }
    }
  }
}

// these two are called by ui.js to show the live counters in the sidebar
function getWaterDisplay(totalGarments) { return formatWater(totalGarments * WATER_PER_GARMENT); }
function getCO2Display(totalGarments)   { return formatCO2(totalGarments * CO2_PER_GARMENT); }

// sketch.js calls this every frame to know whether to freeze the game
function isPopupActive() { return popupActive; }

// called when the player clicks "Got it"
function dismissPopup() {
  popupActive  = false;
  currentPopup = null;
  // if another popup was waiting, show it after a short pause
  if (popupQueue.length > 0) {
    setTimeout(function() {
      currentPopup = popupQueue.shift(); // shift takes from the front so they show in the right order
      popupActive  = true;
    }, 300);
  }
}

// draws the popup card - called at the end of draw() in sketch.js so it sits on top of everything
function drawPopupIfActive() {
  if (!popupActive || !currentPopup) return;

  // dim the whole screen behind the card
  fill(0, 0, 0, 140);
  noStroke();
  rect(0, 0, width, height);

  // card size and centered position
  let cardW = 340, cardH = 210;
  let cardX = width  / 2 - cardW / 2;
  let cardY = height / 2 - cardH / 2;

  // white card background
  fill(255); stroke(220); strokeWeight(1);
  rect(cardX, cardY, cardW, cardH, 10);

  // colored top stripe (blue for water, green for CO2)
  let c = currentPopup.color;
  fill(c[0], c[1], c[2]); noStroke();
  rect(cardX, cardY, cardW, 5, 10, 10, 0, 0);

  // title
  fill(20); textStyle(BOLD); textSize(11); textAlign(CENTER, TOP);
  text(currentPopup.title.toUpperCase(), width / 2, cardY + 18);
  textStyle(NORMAL);

  // big stat number
  fill(c[0], c[1], c[2]); textSize(24); textAlign(CENTER, TOP);
  text(currentPopup.stat, width / 2, cardY + 36);

  // body text
  fill(60); textSize(12); textAlign(CENTER, TOP);
  text(currentPopup.body, cardX + 24, cardY + 80, cardW - 48, 90);

  // "Got it" button
  let btnW = 90, btnH = 30;
  let btnX = width / 2 - btnW / 2;
  let btnY = cardY + cardH - 44;

  fill(245); stroke(200); strokeWeight(1);
  rect(btnX, btnY, btnW, btnH, 6);

  fill(20); noStroke(); textSize(11); textAlign(CENTER, CENTER);
  text("Got it", btnX + btnW / 2, btnY + btnH / 2);

  buttonList.push({ x: btnX, y: btnY, w: btnW, h: btnH, action: function() { dismissPopup(); } });
}

// resets everything on game restart so all four popups can fire again
function resetWaterCO2() {
  shownMilestones.clear();
  popupQueue   = []; // also clear the queue so no stale popups carry over
  popupActive  = false;
  currentPopup = null;
}

// formatting — convert raw numbers into readable strings
function formatWater(liters) {
  if (liters >= 1e9) return (liters / 1e9).toFixed(2) + "B liters";
  if (liters >= 1e6) return (liters / 1e6).toFixed(2) + "M liters";
  if (liters >= 1e3) return (liters / 1e3).toFixed(1) + "k liters";
  return Math.round(liters) + " liters";
}

function formatCO2(kg) {
  if (kg >= 1e6)  return (kg / 1e6).toFixed(2)  + "M kg CO\u2082e";
  if (kg >= 1000) return (kg / 1000).toFixed(2) + " tonnes CO\u2082e";
  return kg.toFixed(1) + " kg CO\u2082e";
}
