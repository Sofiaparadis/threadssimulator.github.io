// Blueprint for each production country in the game. Each country has its own cost to unlock with a speed multiplier that affects how fast garments are made, color, and an info blurb. 

class Country {
  constructor(name, cost, mult, col, info) {
    this.name = name; // displays country's name
    this.cost = cost; // how much $ it costs to unlock 
    this.mult = mult; // speed multiplier 
    this.col = col;  // the color as [r, g, b] values 
    this.info = info; // short description shown in the UI 
    this.unlocked = (cost === 0); // United States (local) starts free and unlocked
  }

  unlock() {
    this.unlocked = true; // marks a country as unlocked once user buys it
  }

  reset() {
    this.unlocked = (this.cost === 0); // when users reset the game, it resets the country back to its starting state (US stays unlocked while the others become locked again)
  }
}
