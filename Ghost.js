class Ghost extends Person {
  constructor(config) {
    super(config);
    this.movingProgressRemaining = 0;
    this.isStanding = false;
  }

  startBehavior(state, behavior) {
    // Set character direction to whatever behavior has
    this.direction = behavior.direction;
  
    if (behavior.type === "stand") {
      this.isStanding = true;
      setTimeout(() => {
        utils.emitEvent("GhostStandComplete", {
          whoId: this.id
        })
        this.isStanding = false;
      }, behavior.time)
    }
  }

  updatePosition() {
    const [property, change] = this.directionUpdate[this.direction];
    this[property] += change;
    this.movingProgressRemaining -= 1;
  }
}