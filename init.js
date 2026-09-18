const openingScreen = new OpeningScreen();

openingScreen.onStart(() => {
startGame();
});
function startGame() {
  console.log("Opening screen 'Start' clicked. Initializing game...");

  try {

    const overworld = new Overworld({
      element: document.querySelector(".game-container"),
    });

    window.overworld = overworld;

    overworld.init().then(() => {
      console.log("Overworld initialized successfully.");

      if (window.keyArrayDisplay) {
        window.keyArrayDisplay.init();
        console.log("KeyArrayDisplay initialized.");
      } else {
        console.warn("window.keyArrayDisplay not found after game init!");
      }

      const notebookMenu = new NotebookMenu();
      notebookMenu.init(document.querySelector(".game-container"));
      window.notebookMenu = notebookMenu;

      const notebookIcon = document.getElementById("notebook-icon");
      if (notebookIcon) {
        notebookIcon.addEventListener("click", () => {
          notebookMenu.toggle();
        });
      }

      window.letterRead = false;
      const letterIcon = document.getElementById("letter-icon");

      function handleLetterClick() {
        if (!letterIcon) return;
        letterIcon.style.animation = "none";
        letterIcon.style.display = "none";
        window.letterRead = true;

        if (window.overworld && window.overworld.map) {
          window.overworld.map.startCutscene([
            { type: "textMessage", text: "Dear Detective Lumen," },
            { type: "textMessage", text: "I hope this letter finds you well. I am writing regarding the troubling situation at the Grand Spectre Hotel." },
            { type: "textMessage", text: "Several spirits are trapped here, unable to move on to the afterlife." },
            { type: "textMessage", text: "I believe your unique skills as both a detective and a medium will be invaluable in resolving this matter." },
            { type: "textMessage", text: "Please come to the hotel garden as soon as possible. I will meet you there to explain the situation in detail." },
            { type: "textMessage", text: "Sincerely,\nThe Hotel Manager" },
            { type: "stand", who: "hero", direction: "down", time: 500 },
            { type: "walk", who: "hero", direction: "down", time: 500 },
            { type: "walk", who: "hero", direction: "down", time: 500 },
            { type: "textMessage", text: "<i>The letter feels heavier than paper should.</i>" },
            { type: "textMessage", text: "<i>Three days ago, it arrived without a return address.</i>" },
            { type: "textMessage", text: "<i>\"Help them move on,\" it said.</i>" },
            { type: "textMessage", text: "<i>\"They need someone who can see.\"</i>" },
            { type: "textMessage", text: "<i>I've handled strange cases before, but something about this one... it feels like the pen strokes are reaching into me.</i>" }
          ])
          .then(() => {
            if (window.overworld && typeof window.overworld.showCenterText === 'function') {
              window.overworld.showCenterText("Enter the Hotel", 4000);
            }
          });
        }
      }

      if (letterIcon) {
        letterIcon.addEventListener("click", handleLetterClick);
      }
    });

  } catch (error) {
    console.error("Error initializing Overworld:", error);
  }
}

openingScreen.mount(document.querySelector(".game-container"));
console.log("Opening screen mounted. Waiting for player to click Start...");