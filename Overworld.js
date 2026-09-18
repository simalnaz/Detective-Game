class Overworld {
  constructor(config) {
    this.element = config.element;
    this.canvas = this.element.querySelector(".game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.map = null;
  }
 
  startGameLoop() {
    if (!this.map || !this.map.isLoaded) {
      console.warn("Attempted to start game loop before map was loaded.");
      return;
    }

    const step = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
 
      const cameraPerson = this.map.gameObjects.hero;
 
      Object.values(this.map.gameObjects).forEach(object => {
        object.update({
          arrow: this.directionInput.direction,
          map: this.map,
        })
      })
      
   
 
      //Draw Lower layer
      this.map.drawLowerImage(this.ctx, cameraPerson);
 
      //Draw Game Objects
      Object.values(this.map.gameObjects).sort((a,b) => {
        return a.y - b.y;
      }).forEach(object => {
        object.sprite.draw(this.ctx, cameraPerson);
      })
 
      //Draw Upper layer
      this.map.drawUpperImage(this.ctx, cameraPerson);
       
      requestAnimationFrame(() => {
        step();   
      })
    }
    step();
  }
 
  bindActionInput() {
    new KeyPressListener("Enter", () => {
      if (this.map && this.map.isCutscenePlaying) {
        return;
      }
      this.map.checkForActionCutscene()
    })
  }
 
  bindHeroPositionCheck() {
    document.addEventListener("PersonWalkingComplete", e => {
      if (e.detail.whoId === "hero") {
        //Hero's position has changed
        this.map.checkForFootstepCutscene()
      }
    })
  }
 
  async startMap(mapConfig, sourceMapId = null) {

  
        console.log(`[Overworld.startMap] Called.`);
        console.log(`  Received mapConfig:`, mapConfig); // Check what's actually received
        console.log(`  Received sourceMapId: ${sourceMapId}`);
  
        
    if (!mapConfig) {
      console.error(`startMap called with invalid mapConfig (maybe map name "${this.event?.map}" doesn't exist in window.OverworldMaps?)`);
      return;
  }
    this.map = new OverworldMap(mapConfig);
    this.map.overworld = this;
    if (sourceMapId && this.map.config.entryPoints && this.map.config.entryPoints[sourceMapId]) {
      const entryCoordsString = this.map.config.entryPoints[sourceMapId];
      try {
        const [x, y] = entryCoordsString.split(",").map(Number); 

        const hero = this.map.gameObjects.hero;
        if (hero) {
          hero.x = x;
          hero.y = y;
          console.log(`[Overworld] Using entry point from ${sourceMapId}: placing hero at ${x},${y} in ${mapConfig.id}`);
        } else {
          console.warn(`[Overworld] Map ${mapConfig.id} has entry point but no hero object defined!`);
        }
      } catch (e) {
         console.error(`[Overworld] Error parsing entry point coordinates "${entryCoordsString}" for source ${sourceMapId} in map ${mapConfig.id}`, e);
  
      }

    } else {
   
       if (sourceMapId) {
         console.log(`[Overworld] No specific entry point found for source ${sourceMapId} in map ${mapConfig.id}. Using default hero position.`);
       } else {
          }
    }
    this.map.mountObjects();
  
    await this.map.waitForLoad(); 
  }
  


  showCenterText(text, duration = 3000, callback = null) {
 
    const container = document.createElement("div");
    container.classList.add("center-text-container");
    
    const textElement = document.createElement("div");
    textElement.classList.add("semi-transparent-text");
    textElement.innerText = text;
    
    container.appendChild(textElement);
    this.element.appendChild(container);
    
    setTimeout(() => {
      textElement.classList.add("fade-out");
    }, duration - 500);
    
    setTimeout(() => {
      container.remove();
      if (callback) callback();
    }, duration);
  }
  
  async init() {
    await this.startMap(window.OverworldMaps.Garden);

  
    this.bindActionInput();
    this.bindHeroPositionCheck();
  
    this.directionInput = new DirectionInput();
    this.directionInput.init();
  
    this.startGameLoop(); 
    

    this.initCutsceneActions();
  }
  
  
  initCutsceneActions() {
    // Create CenterTextDisplay class if it doesn't exist yet
    if (!window.CenterTextDisplay) {
      window.CenterTextDisplay = class CenterTextDisplay {
        constructor({ text, duration = 3000 }) {
          this.text = text;
          this.duration = duration;
        }

        createElement() {
          this.element = document.createElement("div");
          this.element.classList.add("center-text-container");
          
          this.textElement = document.createElement("div");
          this.textElement.classList.add("semi-transparent-text");
          this.textElement.innerText = this.text;
          
          this.element.appendChild(this.textElement);
          document.querySelector(".game-container").appendChild(this.element);
        }

        init(resolve) {
          this.createElement();
          
          
          setTimeout(() => {
            this.textElement.classList.add("fade-out");
          }, this.duration - 500);
          
        
          setTimeout(() => {
            this.element.remove();
            resolve();
          }, this.duration);
        }
      };
    }
  }
}