class GuestBook {
  constructor() {
    // Our hash map of guest entries
    //Extra ghosts
    this.entries = {
      "Sugar Wright": {
        room: 204,
        description: "bakes lemon cake",
        yearVisited: 1923,
        disappeared: false
      },
      "Jack Fleming": {
        room: 112,
        description: "carries a golden pocket watch",
        yearVisited: 1931,
        disappeared: false
      },
      "Marianne Collins": {
        room: 317,
        description: "always wears white gloves",
        yearVisited: 1945,
        disappeared: false
      },
      "Frederick Bennett": {
        room: 101,
        description: "collects vintage stamps",
        yearVisited: 1952,
        disappeared: false
      },
      "Josephine Hayes": {
        room: 209,
        description: "plays the violin at midnight",
        yearVisited: 1919,
        disappeared: false
      },
      "Elliot": {
        room: 118,
        description: "carries a golden pocket watch", 
        yearVisited: 1925,
        disappeared: false
      },
      "Thomas Henderson": {
        room: 304,
        description: "49th of anniversary with his wife",
        yearVisited: 1938,
        disappeared: false
      },
      "Eleanor Henderson": {
        room: 305,
        description: "dedicated her life to love",
        yearVisited: 1938,
        disappeared: false
      },
      "Reginald Foster": {
        room: 421,
        description: "complains, every day, every second",
        yearVisited: 1912,
        disappeared: false
      },
      "Marilyn Winters": {
        room: 156,
        description: "sees the world black and white",
        yearVisited: 1957,
        disappeared: false
      }
    };
    
    this.descriptionIndex = {};
    
    this.buildDescriptionIndex();
  }
  
  buildDescriptionIndex() {
    Object.keys(this.entries).forEach(name => {
      const description = this.entries[name].description;
      this.descriptionIndex[description] = name;
    });
  }
  
  getNameByDescription(description) {
    return this.descriptionIndex[description] || null;
  }
  
  markAsDisappeared(name) {
    if (this.entries[name]) {
      this.entries[name].disappeared = true;
      return true;
    }
    return false;
  }
  
  getAllActiveEntries() {
    // Return entries that haven't disappeared yet
    const activeEntries = {};
    
    Object.keys(this.entries).forEach(name => {
      if (!this.entries[name].disappeared) {
        activeEntries[name] = this.entries[name];
      }
    });
    
    return activeEntries;
  }
}

window.guestBook = new GuestBook();