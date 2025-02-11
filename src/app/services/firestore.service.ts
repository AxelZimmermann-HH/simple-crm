import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, getDocs, updateDoc, collection, query, orderBy, DocumentReference, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { Contact } from '../../models/contact.class';

@Injectable({
  providedIn: 'root'
})

export class FirestoreService {

  constructor(private firestore: Firestore) { }

  /**
   * Fetches user details from Firestore, including their contacts.
   * @param userId The ID of the user to fetch.
   * @returns A Promise resolving to the user object or null if not found.
   */
  async fetchUserDetails(userId: string): Promise<User | null> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        console.error('User not found');
        return null;
    }

    const userData = userDoc.data();
    const user = new User({ ...userData });

    // user.contacts = await this.fetchUserContacts(userDocRef);
    // this.sortContactsByDate(user.contacts);

    return user;
  }

  /**
  * Fetches the contacts for a given user.
  * @param userDocRef The Firestore document reference for the user.
  * @returns A Promise resolving to an array of contacts.
  */
  private async fetchUserContacts(userDocRef: DocumentReference): Promise<Contact[]> {
    const contactsCollectionRef = collection(userDocRef, 'contacts');
    const contactsSnapshot = await getDocs(contactsCollectionRef);

    return contactsSnapshot.docs.map((doc) => {
        const contactData = doc.data();
        return new Contact({
            id: doc.id,
            contactDate: contactData["contactDate"] || null,
            channel: contactData["channel"] || '',
            text: contactData["text"] || '',
        });
    });
  }

  /**
  * Sorts an array of contacts by contact date in descending order.
  * @param contacts The array of contacts to be sorted.
  */
  private sortContactsByDate(contacts: Contact[]): void {
    contacts.sort((a, b) => {
        const dateA = a.contactDate || 0;
        const dateB = b.contactDate || 0;
        return dateB - dateA;
    });
  }

  /** 
   * Edits image URL in Firestore 
   */
  updateUserImage(userId: string, imageUrl: string): Promise<void> {
    const userRef = doc(this.firestore, `users/${userId}`);
    return updateDoc(userRef, { image: imageUrl });
  }

  
    /**
   * Fetches and returns the list of contacts for a specific user.
   * @param userId The ID of the user whose contacts should be retrieved.
   * @returns A sorted array of contacts.
   */
  async fetchContacts(userId: string): Promise<Contact[]> {
    const contactsSnapshot = await this.getContactsSnapshot(userId);
    let contacts = this.mapContacts(contactsSnapshot);
    return this.sortContacts(contacts);
  }

  /**
  * Retrieves the Firestore snapshot of contacts for a given user.
  * @param userId The ID of the user.
  * @returns A Firestore snapshot of the user's contacts.
  */
  private async getContactsSnapshot(userId: string) {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    const contactsCollectionRef = collection(userDocRef, 'contacts');
    return await getDocs(contactsCollectionRef);
  }

  /**
  * Maps Firestore documents to an array of Contact objects.
  * @param contactsSnapshot The Firestore snapshot containing contact data.
  * @returns An array of Contact objects.
  */
  private mapContacts(contactsSnapshot: any): Contact[] {
    return contactsSnapshot.docs.map((doc: QueryDocumentSnapshot<any>) => {
        const contactData = doc.data();
        return new Contact({
            id: doc.id,
            contactDate: contactData["contactDate"] || null,
            channel: contactData["channel"] || '',
            text: contactData["text"] || '',
        });
    });
  }

  /**
  * Sorts an array of contacts by date, with the newest contacts first.
  * @param contacts The array of contacts to be sorted.
  * @returns The sorted array of contacts.
  */
  private sortContacts(contacts: Contact[]): Contact[] {
    return contacts.sort((a, b) => {
        const dateA = a.contactDate || 0;
        const dateB = b.contactDate || 0;
        return dateB - dateA; 
    });
  }

  /**
   * Updating contact in Firestore after editing.
   * @param userId string
   * @param contact object
   */
  async updateContact(userId: string, contact: Contact): Promise<void> {
    if (!userId || !contact.id) {
      throw new Error('Benutzer-ID oder Kontakt-ID fehlt');
    }
  
    const contactDocRef = doc(this.firestore, `users/${userId}/contacts/${contact.id}`);
    await updateDoc(contactDocRef, {
      text: contact.text, 
      contactDate: contact.contactDate || null, 
      channel: contact.channel || null, 
    });
  }

  /**
   * Gets the number of all clients from the collection in firestore.
   * @returns number
   */
  async getUserCount(): Promise<number> {
    const usersCollection = collection(this.firestore, 'users');
    const snapshot = await getDocs(usersCollection);
    return snapshot.size;
  }

  /**
   * Retrieves all contacts from all users in Firestore.
   * @returns A sorted array of all contacts from Firestore.
   */
  async getAllContacts(): Promise<Contact[]> {
    const usersSnapshot = await this.getUsersSnapshot();
    const contactPromises = this.getContactPromises(usersSnapshot);
    return this.processContactPromises(contactPromises);
  }

  /**
  * Fetches the Firestore snapshot for all users.
  * @returns A Firestore snapshot containing all users.
  */
  private async getUsersSnapshot() {
    const usersCollectionRef = collection(this.firestore, 'users');
    return await getDocs(usersCollectionRef);
  }

  /**
  * Creates an array of promises that fetch contacts for each user.
  * @param usersSnapshot The Firestore snapshot containing all users.
  * @returns An array of promises that resolve to contact arrays.
  */
  private getContactPromises(usersSnapshot: any): Promise<Contact[]>[] {
    return usersSnapshot.docs.map((userDoc: QueryDocumentSnapshot<any>) => {
        return this.fetchContactsForUser(userDoc);
    });
  }

  /**
  * Fetches contacts for a specific user and returns a promise.
  * @param userDoc The Firestore document snapshot for a user.
  * @returns A promise that resolves to an array of contacts for the given user.
  */
  private fetchContactsForUser(userDoc: QueryDocumentSnapshot<any>): Promise<Contact[]> {
    const userId = userDoc.id;
    const contactsCollectionRef = collection(this.firestore, `users/${userId}/contacts`);
    const contactsQuery = query(contactsCollectionRef, orderBy('contactDate', 'desc'));

    return getDocs(contactsQuery).then((contactsSnapshot) =>
        contactsSnapshot.docs.map((doc) => this.mapContact(doc, userId))
    );
  }

  /**
  * Maps Firestore contact document data to a Contact object.
  * @param doc The Firestore document snapshot for a contact.
  * @param userId The ID of the user to whom the contact belongs.
  * @returns A Contact object.
  */
  private mapContact(doc: QueryDocumentSnapshot<any>, userId: string): Contact {
    const contactData = doc.data();
    return new Contact({
        id: doc.id,
        contactDate: contactData["contactDate"] ?? 0,
        channel: contactData["channel"] ?? '',
        text: contactData["text"] ?? '',
        company: contactData["company"] ?? '',
        companyId: contactData["companyId"] ?? userId
    });
  }

  /**
  * Processes an array of contact promises and returns a sorted list of all contacts.
  * @param contactPromises An array of promises that resolve to contact arrays.
  * @returns A sorted array of all contacts.
  */
  private async processContactPromises(contactPromises: Promise<Contact[]>[]): Promise<Contact[]> {
    const results = await Promise.all(contactPromises);
    return results.flat().sort((a, b) => (b.contactDate ?? 0) - (a.contactDate ?? 0));
  }
}




  
