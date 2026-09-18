class GameObject {
  constructor(config) {
    this.id = null;
    this.isMounted = false;
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.direction = config.direction || "down";
    this.sprite = new Sprite({
      gameObject: this,
      src: config.src || "/images/characters/people/detective.png",
      animations: config.animations || null,
    });

    this.behaviorLoop = config.behaviorLoop || [];
    this.behaviorLoopIndex = 0;

    this.talking = config.talking || [];

  }

  mount(map) {
    console.log("mounting!")
    this.isMounted = true;

    setTimeout(() => {
      this.doBehaviorEvent(map);
    }, 10)
  }

  update(state) {
    this.updateSprite(state);
  }

  updateSprite() {
    if (this.movingProgressRemaining > 0) {
      this.sprite.setAnimation("walk-"+this.direction);
      return;
    }
    this.sprite.setAnimation("idle-"+this.direction);
  }

  async doBehaviorEvent(map) {
    if (!map.gameObjects[this.mapId]) {
      return;
    }

    //Don't do anything if there is a more important cutscene 
    if (map.isCutscenePlaying || this.behaviorLoop.length === 0 || this.isStanding) {
      return;
    }

    //Setting up the event with relevant info
    let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
    eventConfig.who = this.id;

    //Create an event instance out of our next event config
    const eventHandler = new OverworldEvent({ map, event: eventConfig });
    await eventHandler.init();

    //Setting the next event to fire
    this.behaviorLoopIndex += 1;
    if (this.behaviorLoopIndex === this.behaviorLoop.length) {
      this.behaviorLoopIndex = 0;
    }
    if (!this.isStanding && !map.isCutscenePlaying) {
      this.doBehaviorEvent(map);
    }

}
}

class Book extends GameObject {
  constructor(config) {
    super(config); 
    this.talking = config.talking || [];

    this.id = config.id || "book";

    this.sprite = new Sprite({
      gameObject: this,
      src: config.src || "/images/characters/objects/GuestBook.png", 
      animations: { 
        "idle-down":  [[0,0]],
        "idle-left":  [[0,0]],
        "idle-right": [[0,0]],
        "idle-up":    [[0,0]],
        "walk-down":  [[0,0]],
        "walk-left":  [[0,0]],
        "walk-right": [[0,0]],
        "walk-up":    [[0,0]],
      }
    });

    this.behaviorLoop = [];
  }

  update() {
  }
}
