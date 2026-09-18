class NameGuessingMenu {
  constructor({ ghostId, onComplete }) {
    this.ghostId = ghostId;
    this.onComplete = onComplete; 
    this.element = null;
    this.nameInput = null;
    this.guestBookElement = null;
    this.isGuestBookOpen = false;
  }


  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("NameGuessingMenu");

    this.element.innerHTML = (`
      <h2 class="NameGuessingMenu_title">Guess the Ghost's Name</h2>
      <div class="NameGuessingMenu_content">
        <input type="text" placeholder="Enter ghost's name..." class="NameGuessingMenu_input">
        <div class="NameGuessingMenu_buttons">
          <button class="NameGuessingMenu_button NameGuessingMenu_button--guess">Guess</button>
          <button class="NameGuessingMenu_button NameGuessingMenu_button--guest-book">Guest Book</button>
          <button class="NameGuessingMenu_button NameGuessingMenu_button--cancel">Cancel</button>
        </div>
      </div>
      <p class="NameGuessingMenu_hint">
        Tip: Check the Guest Book for clues. Look for a guest who matches the ghost's memory.
      </p>
    `);

 
    this.nameInput = this.element.querySelector(".NameGuessingMenu_input");
    
 
    this.element.querySelector(".NameGuessingMenu_button--guess").addEventListener("click", () => {
      this.makeGuess();
    });
    
    this.element.querySelector(".NameGuessingMenu_button--guest-book").addEventListener("click", () => {
      this.toggleGuestBook();
    });
    
    this.element.querySelector(".NameGuessingMenu_button--cancel").addEventListener("click", () => {
      this.close();
    });
    
 
    this.createGuestBookElement();
    

    this.nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.makeGuess();
      }
    });
  }
  
  createGuestBookElement() {
    this.guestBookElement = document.createElement("div");
    this.guestBookElement.classList.add("GuestBook");
    
    
    this.guestBookElement.style.maxWidth = "300px"; 
    this.guestBookElement.style.maxHeight = "200px"; 
    this.guestBookElement.style.overflowY = "auto";
    this.guestBookElement.style.overflowX = "hidden";
    

    const activeEntries = window.guestBook.getAllActiveEntries();
    
    
    let guestBookHTML = `
      <div class="GuestBook_header">
        <h3>Grand Hotel Guest Book</h3>
        <button class="GuestBook_close">✕</button>
      </div>
      <div class="GuestBook_entries">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Room</th>
              <th>Notable Detail</th>
              <th>Year</th>
            </tr>
          </thead>
          <tbody>
    `;
    
 
    Object.keys(activeEntries).forEach(name => {
      const entry = activeEntries[name];
      guestBookHTML += `
        <tr class="GuestBook_entry">
          <td>${name}</td>
          <td>${entry.room}</td>
          <td>${entry.description}</td>
          <td>${entry.yearVisited}</td>
        </tr>
      `;
    });
    
    guestBookHTML += `
          </tbody>
        </table>
      </div>
      <div class="GuestBook_footer">
        <p>Click on a name to select it</p>
      </div>
    `;
    
    this.guestBookElement.innerHTML = guestBookHTML;
    

    this.guestBookElement.querySelector(".GuestBook_close").addEventListener("click", () => {
      this.toggleGuestBook();
    });
    

    this.guestBookElement.querySelectorAll(".GuestBook_entry").forEach(entry => {
      entry.addEventListener("click", () => {
        const name = entry.querySelector("td").textContent;
        this.nameInput.value = name;
        this.toggleGuestBook();
      });
    });
  }
  
  toggleGuestBook() {
    if (this.isGuestBookOpen) {
      this.guestBookElement.remove();
      this.isGuestBookOpen = false;
    } else {
      
      this.createGuestBookElement();
      document.querySelector(".game-container").appendChild(this.guestBookElement);
      this.isGuestBookOpen = true;
    }
  }
  makeGuess() {
    const guessedName = this.nameInput.value.trim();

    if (!guessedName) {
      this.showMessage("Please enter a name.");
      return;
    }

    const ghost = utils.getGameObjectByIdFromAnyMap(this.ghostId);

    if (!ghost || typeof ghost.checkNameGuess !== "function") {
      this.showMessage("Something went wrong with this ghost.");
      
      this.onComplete(null); 
      return;
    }

    const result = ghost.checkNameGuess(guessedName);

    if (result.success) {
   
      ghost.hasBeenIdentified = true;

 
      if (ghost.realName) {
          window.guestBook.markAsDisappeared(ghost.realName);
      }

      // Check Chapter 2 completion (Keep this logic)
      const chapter2Ghosts = ["ghost1", "ghost2", "ghost3", "ghost4", "ghost5", "ghost6", "ghost7"];
      const allChapter2Identified = chapter2Ghosts.every(id => {
          const g = utils.getGameObjectByIdFromAnyMap(id);
          return !g || (g && g.hasBeenIdentified);
      });
      if (allChapter2Identified && !utils.gameProgress.chapter2Completed) {
          utils.gameProgress.chapter2Completed = true;
          console.log("Chapter 2 marked as completed!");
      }

   
      ghost.updateTalking();


      this.showMessage(result.message); 

    
      this.onComplete(ghost); 
    } else {
      
      this.showMessage(result.message); 


      this.nameInput.value = "";

 
    }
  }
  
  showMessage(text) {
 
    const existingMessage = this.element.querySelector(".NameGuessingMenu_message");
    if (existingMessage) {
      existingMessage.remove();
    }
    
  
    const message = document.createElement("p");
    message.classList.add("NameGuessingMenu_message");
    message.textContent = text;
    
    this.element.querySelector(".NameGuessingMenu_content").appendChild(message);
  }
  
  close() {

    if (this.isGuestBookOpen && this.guestBookElement) {
      this.guestBookElement.remove();
    }
    
 
    this.element.remove();
 
  }

  init(container) {
    this.createElement();

    
    this.element.querySelector(".NameGuessingMenu_button--cancel").addEventListener("click", () => {
        this.onComplete(null); 
    });

    container.appendChild(this.element);

    setTimeout(() => {
      this.nameInput.focus();
    }, 10);
  }
}