class Inventory {
    constructor() {
      this.items = [];
      this.onUpdate = null;
    }
  //For later 
    addItem(item) {
      const existingItem = this.items.find(i => i.id === item.id);
      
      if (existingItem) {
        if (item.stackable) {
          existingItem.quantity += item.quantity || 1;
        }
      } else {
  
        if (!item.hasOwnProperty('quantity')) {
          item.quantity = 1;
        }
        this.items.push(item);
      }
  

      if (this.onUpdate) {
        this.onUpdate();
      }
      
      return true;
    }
  
    removeItem(itemId) {
      const itemIndex = this.items.findIndex(item => item.id === itemId);
      
      if (itemIndex > -1) {
        this.items.splice(itemIndex, 1);
        

        if (this.onUpdate) {
          this.onUpdate();
        }
        
        return true;
      }
      
      return false;
    }
  
    hasItem(itemId) {
      return this.items.some(item => item.id === itemId);
    }
  
    getItem(itemId) {
      return this.items.find(item => item.id === itemId);
    }
  
    getItems() {
      return this.items;
    }
  
    // Method to set callback when inventory changes
    setUpdateCallback(callback) {
      this.onUpdate = callback;
    }
  }
  

  window.playerInventory = new Inventory();