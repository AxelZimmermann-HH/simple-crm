import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, getDocs, updateDoc, collection, query, orderBy, limit } from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { Contact } from '../../models/contact.class';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: Firestore) { }

  async fetchUserDetails2(userId: string): Promise<User | null> {
    try {
      const userDocRef = doc(this.firestore, `users/${userId}`);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        return userData;
      } else {
        console.error('Benutzer nicht gefunden');
        return null;
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdetails:', error);
      throw error;
    }
  }

  updateUserImage(userId: string, imageUrl: string): Promise<void> {
    const userRef = doc(this.firestore, `users/${userId}`);
    return updateDoc(userRef, { image: imageUrl });
  }

  async fetchUserDetails(userId: string): Promise<User | null> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const user = new User({ ...userData });

      // Kontakte laden und sortieren
      const contactsCollectionRef = collection(userDocRef, 'contacts');
      const contactsSnapshot = await getDocs(contactsCollectionRef);

      user.contacts = contactsSnapshot.docs.map((doc) => {
        const contactData = doc.data();
        return new Contact({
          id: doc.id,
          contactDate: contactData["contactDate"] || null,
          channel: contactData["channel"] || '',
          text: contactData["text"] || '',
        });
      });

      user.contacts.sort((a, b) => {
        const dateA = a.contactDate || 0;
        const dateB = b.contactDate || 0;
        return dateB - dateA; // Absteigend sortieren
      });

      return user;
    } else {
      console.error('Benutzer nicht gefunden');
      return null;
    }
  }

  async fetchContacts(userId: string): Promise<Contact[]> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    const contactsCollectionRef = collection(userDocRef, 'contacts');
    const contactsSnapshot = await getDocs(contactsCollectionRef);

    const contacts = contactsSnapshot.docs.map((doc) => {
      const contactData = doc.data();
      return new Contact({
        id: doc.id,
        contactDate: contactData["contactDate"] || null,
        channel: contactData["channel"] || '',
        text: contactData["text"] || '',
      });
    });

    contacts.sort((a, b) => {
      const dateA = a.contactDate || 0;
      const dateB = b.contactDate || 0;
      return dateB - dateA; // Absteigend sortieren
    });

    return contacts;
  }

  async updateContact(userId: string, contact: Contact): Promise<void> {
    if (!userId || !contact.id) {
      throw new Error('Benutzer-ID oder Kontakt-ID fehlt');
    }
  
    const contactDocRef = doc(this.firestore, `users/${userId}/contacts/${contact.id}`);
    await updateDoc(contactDocRef, {
      text: contact.text, // Nur das "text"-Feld aktualisieren
      contactDate: contact.contactDate || null, // Optional: Wenn das Datum geändert wird
      channel: contact.channel || null, // Optional: Wenn der Kanal geändert wird
    });
  }

  async getUserCount(): Promise<number> {
    const usersCollection = collection(this.firestore, 'users');
    const snapshot = await getDocs(usersCollection);
    return snapshot.size; // Gibt die Anzahl der Dokumente zurück
  }

  async getLatestContacts(): Promise<Contact[]> {
    const usersCollectionRef = collection(this.firestore, 'users');
    const usersSnapshot = await getDocs(usersCollectionRef);
    
    let contactPromises: Promise<Contact[]>[] = [];

    // Durchlaufe alle User und erstelle eine Abfrage für deren Kontakte
    for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const contactsCollectionRef = collection(this.firestore, `users/${userId}/contacts`);
        const contactsQuery = query(contactsCollectionRef, orderBy('contactDate', 'desc'), limit(4)); // Holt nur die 4 neuesten Kontakte pro User
        const contactsPromise = getDocs(contactsQuery).then(contactsSnapshot => 
            contactsSnapshot.docs.map((doc) => {
                const contactData = doc.data();
                return new Contact({
                    id: doc.id,
                    contactDate: contactData["contactDate"] ?? 0,
                    channel: contactData["channel"] ?? '',
                    text: contactData["text"] ?? '',
                    company: contactData["company"] ?? '', // Falls vorhanden
                });
            })
        );

        contactPromises.push(contactsPromise);
    }

    // Warten, bis alle Firestore-Abfragen abgeschlossen sind
    const results = await Promise.all(contactPromises);
    
    // Alle Kontakte in ein einziges Array packen und sortieren
    let allContacts = results.flat().sort((a, b) => (b.contactDate ?? 0) - (a.contactDate ?? 0));
    console.log(allContacts);
    // Gib die vier neuesten Kontakte zurück
    return allContacts;
}


}




  
