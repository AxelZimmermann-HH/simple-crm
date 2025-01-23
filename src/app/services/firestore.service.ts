import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { User } from '../../models/user.class';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: Firestore) { }

  async fetchUserDetails(userId: string): Promise<User | null> {
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
}
