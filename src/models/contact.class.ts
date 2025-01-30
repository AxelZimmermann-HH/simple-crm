export class Contact {
    id?: string;
    contactDate?: number; // Timestamp (z. B. Unix-Epoch-Zeit)
    channel: string;
    text: string; // Text der Nachricht oder des Kontakts
    company: string;

  
    constructor(obj?: any) {
      this.id = obj ? obj.id : undefined;
      this.contactDate = obj ? obj.contactDate : ''; // Standard: leer
      this.channel = obj ? obj.channel : '';
      this.text = obj ? obj.text : ''; // Standard: leerer Text
      this.company = obj ? obj.company : '';
    }
  }