class GhostName extends Ghost {
    constructor(config) {
        super(config);

        // Ghost name properties
        this.rememberedDetail = config.rememberedDetail || "";
        this.realName = config.realName || null;
        this.guessAttempts = 0;
        this.maxGuessAttempts = 3;
        this.hasBeenIdentified = false;
        this.lockoutEndTime = null; 

  
                this.initialTalking = config.initialTalking || null; 
                this.initialDialogueDone = false; 
            

        // Set up dialogue based on remembered detail
        this.updateTalking();
    }

    mount(map) {
        super.mount(map);

        console.log(`[GhostName] Mounting ghost: ${this.id}`);
        console.log(`Remembered detail: ${this.rememberedDetail}`);
        console.log(`Current realName: ${this.realName}`);

        if (!this.realName && this.rememberedDetail) {
            this.realName = window.guestBook.getNameByDescription(this.rememberedDetail);
            console.log(`→ Loaded real name from guest book: ${this.realName}`);
        }

        this.updateTalking();
    }

    updateTalking() {
        const now = Date.now();
    
        if (this.hasBeenIdentified) {
            this.talking = [{
                events: [
                    { type: "textMessage", text: "Ah... yes. That's it. Thank you.", faceHero: this.id }, // Optional slightly different phrasing
                    { type: "textMessage", text: "Now I can finally rest..." },
                    { type: "textMessage", text: `${this.realName}'s form shimmers and fades away peacefully...` },
                    { type: "removeObject", objectId: this.id },
                    { type: "textMessage", text: "You feel a sense of calm wash over the room..." }
                ]
            }];

        // Check if currently locked out
        } else if (this.lockoutEndTime && now < this.lockoutEndTime) {
            const remainingMs = this.lockoutEndTime - now;
            const remainingSeconds = Math.ceil(remainingMs / 1000);
            const remainingMinutes = Math.floor(remainingSeconds / 60);
            const displaySeconds = remainingSeconds % 60;
            const timeString = `${remainingMinutes}m ${displaySeconds}s`;
    
            this.talking = [{
                events: [
                    { type: "textMessage", text: "The ghost seems weary from your guesses...", faceHero: this.id },
                    { type: "textMessage", text: `It needs time to recover its spectral form. Try again in about ${timeString}.` }
                ]
            }];
            console.log(`[GhostName] UpdateTalking: Lockout active for ${this.id}. Remaining: ${timeString}`);
    

        } else if (!this.initialDialogueDone && this.initialTalking) {
         
            let initialEvents = [...this.initialTalking[0].events];
    
            initialEvents.push({
                type: "callback",
                callback: () => {
                    console.log(`[GhostName] Initial dialogue finished for ${this.id}. Setting initialDialogueDone = true.`);
                    this.initialDialogueDone = true;
                    this.updateTalking(); 
                }
            });

            this.talking = [{ events: initialEvents }];
            console.log(`[GhostName] UpdateTalking: Setting initial dialogue for ${this.id}.`);
     
    

        } else {
          
            if (this.lockoutEndTime && now >= this.lockoutEndTime) { 
                console.log(`[GhostName] UpdateTalking: Lockout expired for ${this.id}.`);
                this.lockoutEndTime = null;
                this.guessAttempts = 0; 
            }
    
            this.talking = [{
                events: [
                    { type: "textMessage", text: "<g>Can you help me? I need to know who I was.<g>" },
                    { type: "nameGuess", ghostId: this.id } // Triggers the NameGuessingMenu
                ]
            }];
             console.log(`[GhostName] UpdateTalking: Setting guessing dialogue for ${this.id}.`);
        }
    }

    checkNameGuess(name) {
        if (!this.realName) {
          return {
            success: false,
            message: "Hmm... I don’t seem to remember my name just yet.",
          };
        }

        const normalizedGuess = name.trim().toLowerCase();
        const normalizedRealName = this.realName.trim().toLowerCase();

        if (normalizedGuess === normalizedRealName) {
          // Correct Guess
          return {
            success: true,
            message: `Yes! I remember now. I am ${this.realName}!`,
          };
        } else {
          // Incorrect Guess
          this.guessAttempts += 1;
          let message = "No... that doesn't sound right."; // Default failure message

          // Check if max attempts reached
          if (this.guessAttempts >= this.maxGuessAttempts) {
              const lockoutDurationMinutes = 2; // Set lockout duration
              this.lockoutEndTime = Date.now() + (lockoutDurationMinutes * 60 * 1000);
              this.guessAttempts = 0; // Reset attempts for the *next* try after lockout
              message = `Too many wrong guesses! The ghost fades slightly, needing time to recover. Try again in ${lockoutDurationMinutes} minutes.`;
              console.log(`[GhostName] Lockout started for ${this.id}. Ends at: ${new Date(this.lockoutEndTime)}`);
          }

          this.updateTalking();

          return {
            success: false,
            message: message, 
          };
        }
    }
}
