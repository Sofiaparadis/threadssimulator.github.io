// Blueprint for each purchasable upgrade in the game (workers, machines, workshop, and factory). Each upgrade tracks how many times it's been bought and automatically increases its own price each time 

class Upgrade {
  constructor(name, info, baseCost, rate) {
    this.name = name; // displays name of upgrade
    this.info = info; // shows the rate bonus
    this.baseCost = baseCost; // the original price 
    this.cost = baseCost; // increases with each purchase 
    this.rate = rate; // how much this upgrade adds to garmentRate per purchase 
    this.count = 0; // starts at 0 and tracks how many times this upgrade has been bought 
  }

  // called when the player buys this upgrade 
  purchase() {
    this.count += 1; // increases the purchase count by 1
    this.cost = floor(this.baseCost * pow(1.65, this.count)); // recalculates the new cost using the formula - each purchase makes the next one 65% more expensive (we picked 65% so it's cheap enough to keep buying upgrades and feel progress but expensive enough that you can't just spam buy everything immediately)
    return this.rate; // added back to garmentRate 
  }

  canAfford(money) {
    return money >= this.cost; // returns true if the player has enough money to buy this upgrade, false if not (button would be greyed out)
  }

  reset() { // resets upgrades back to its starting state 
    this.count = 0;
    this.cost = this.baseCost;
  }
}
