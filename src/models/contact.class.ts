export class Contact {
    timestamp: number; // Timestamp (z. B. Unix-Epoch-Zeit)
    text: string; // Text der Nachricht oder des Kontakts
  
    constructor(obj?: any) {
      this.timestamp = obj ? obj.timestamp : Date.now(); // Standard: aktuelles Datum
      this.text = obj ? obj.text : ''; // Standard: leerer Text
    }
  }