class OverworldEvent {
  constructor({ map, event}) {
    this.map = map;
    this.event = event;
  }
  callback(resolve) {
    if (typeof this.event.callback === "function") {
      this.event.callback(); 
    } else {
      console.warn("Cutscene event 'callback' was called without a valid function.");
    }
    resolve(); 
  }
  stand(resolve) {
    const who = this.map.gameObjects[ this.event.who ];
    who.startBehavior({
      map: this.map
    }, {
      type: "stand",
      direction: this.event.direction,
      time: this.event.time
    })

    //Set up a handler to complete when correct person is done walking, then resolve the event
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonStandComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonStandComplete", completeHandler)
  }

  walk(resolve) {
    const who = this.map.gameObjects[ this.event.who ];
    who.startBehavior({
      map: this.map
    }, {
      type: "walk",
      direction: this.event.direction,
      retry: true
    })

    
    const completeHandler = e => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonWalkingComplete", completeHandler);
        resolve();
      }
    }
    document.addEventListener("PersonWalkingComplete", completeHandler)
  }
  textMessage(resolve) {
    console.log("[OverworldEvent] textMessage triggered:", this.event.text);
  
    if (this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
    }
  
    const message = new TextMessage({
      text: this.event.text,
      onComplete: () => resolve()
    });
  
    message.init(document.querySelector(".game-container"));
  }
  

  changeMap(resolve) {
    const mapName = this.event.map;
  
    if (!window.OverworldMaps[mapName]) {
      console.error(`[OverworldEvent.changeMap] Error: Map "${mapName}" not found in window.OverworldMaps`);
      console.warn("Available maps:", Object.keys(window.OverworldMaps));
      resolve();
      return;
    }
  
    this.map.overworld.startMap(window.OverworldMaps[mapName]);
    resolve();
  }
  

  // Add a new event type for removing objects
  removeObject(resolve) {
    const objectId = this.event.objectId;
    if (this.map.gameObjects[objectId]) {
      delete this.map.gameObjects[objectId];
    }
    resolve();
  }

  nameGuess(resolve) {
    const ghostId = this.event.ghostId;

    const nameGuessingMenu = new NameGuessingMenu({
      ghostId: ghostId,
      onComplete: (resultGhost) => { 
      
        nameGuessingMenu.close();

        // Check if the guess was successful (resultGhost is not null and is identified)
        if (resultGhost && resultGhost.hasBeenIdentified) {
            console.log(`[OverworldEvent] Name guess success for ${ghostId}. Starting ending sequence.`);

            if (resultGhost.talking && resultGhost.talking[0] && resultGhost.talking[0].events) {
                this.map.startCutscene(resultGhost.talking[0].events)
                    .then(() => {
                        // Resolve the original nameGuess event's promise *after* the ending cutscene completes
                        console.log(`[OverworldEvent] Ending sequence finished for ${ghostId}. Resolving nameGuess event.`);
                        resolve();
                    });
            } else {
                 console.error(`[OverworldEvent] Ending sequence not found in ghost.talking for ${ghostId}. Resolving nameGuess event anyway.`);
                 resolve(); 
            }
        } else {
            // Guess failed or was cancelled, just resolve the original nameGuess event's promise
            console.log(`[OverworldEvent] Name guess failed or cancelled for ${ghostId}. Resolving nameGuess event.`);
            resolve();
        }
      }
    });

    nameGuessingMenu.init(document.querySelector(".game-container"));
    // The promise resolves when the onComplete callback calls resolve()
  }

  startReversePuzzle(resolve) {
  
    const story = {
     
      node1: { id: "node1", text: "Pills. Too many pills. The pressure, you see. Another failed marriage. The reviews.", next: "node2" },
    
      node2: { id: "node2", text: "The telegram. They were recasting my role. Younger actress. 'Fresh face,' they said.", next: "node3" },
    
      node3: { id: "node3", text: "My birthday. Forty years old. No one called. I ordered champagne from room service anyway.", next: "node4" },
   
      node4: { id: "node4", text: "Opening night. Standing ovation. The peak, though I didn't know it then.", next: "node5" },

      node5: { id: "node5", text: "First screen test. The director said I had 'it.' Whatever 'it' was.", next: "node6" },
     
      node6: { id: "node6", text: "Farm girl. Nebraska. Dirt poor. Dreams bigger than the sky. That little girl never imagined she'd end up a ghost in a forgotten hotel.", next: null },
    };


const menu = new ReverseMenu({
  nodes: story,
  onComplete: () => {
    
    utils.gameProgress.chapter3Completed = true;
    console.log("Chapter 3 marked as completed!"); 

  
    this.map.startCutscene([
     
      { type: "textMessage", text: "<g>That's my story. From end to beginning. From death to life.</g>", faceHero: this.event.who },
      { type: "textMessage", text: "<g>But to move on, I need something from you. Your ambition. That fire that pushes you forward.</g>", faceHero: this.event.who },
      { type: "textMessage", text: "My drive? My purpose?" },
      { type: "textMessage", text: "<g>The part of you that never stops seeking answers. That's my price.</g>", faceHero: this.event.who },
      { type: "textMessage", text: "<i>I feel it leave me—that restless hunger that's driven me all my life. The need to solve, to know, to uncover.</i>" },

      { type: "textMessage", text: "<g>Thank you. I can move on now. Back to that farm girl with dreams. Back to the beginning.</g>", faceHero: this.event.who },
  
      { who: this.event.who, type: "stand", direction: "up", time: 800 }, 
      { type: "textMessage", text: `${this.event.who}'s form glows brightly, then fades away...` }, 
      { type: "removeObject", objectId: this.event.who },
      { type: "textMessage", text: "<i>A warmth leaves your chest... and something you once were, no longer is. She's moved on.</i>" } // Final inner monologue
    ])
    
    .then(resolve);
  }
});


    menu.init(document.querySelector(".game-container"));

    
  }
  init() {
    return new Promise(resolve => {
      // Ensure the event type exists before calling it
      if (typeof this[this.event.type] === 'function') {
        this[this.event.type](resolve);
      } else {
        console.error(`Unknown event type: ${this.event.type}`);
        resolve(); 
      }
    });
  }
}