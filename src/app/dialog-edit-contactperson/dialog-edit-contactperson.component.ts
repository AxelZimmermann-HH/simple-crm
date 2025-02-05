import { Inject, Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { User } from '../../models/user.class';
import { doc, setDoc, Firestore } from '@angular/fire/firestore';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { FirestoreService } from '../services/firestore.service';

@Component({
  selector: 'app-dialog-edit-contactperson',
  standalone: true,
  imports: [MatProgressBarModule, MatDialogContent, MatInputModule, MatNativeDateModule, MatFormFieldModule, MatIconModule, MatDatepickerModule, MatDialogActions, MatButtonModule, FormsModule],
  templateUrl: './dialog-edit-contactperson.component.html',
  styleUrl: './dialog-edit-contactperson.component.scss'
})
export class DialogEditContactpersonComponent {

  loading = false;
  user: User = new User;

  /**
   * Component constructor for editing a user's contact person.
   * Injects dialog data, Firestore, FirestoreService, and MatDialogRef.
   * @param {object} data - The injected data containing the user ID.
   * @param {Firestore} firestore - Firestore instance for database operations.
   * @param {MatDialogRef<DialogEditContactpersonComponent>} dialogRef - Reference to the dialog instance.
   * @param {FirestoreService} firestoreService - Service for Firestore operations.
   */
  constructor(@Inject(MAT_DIALOG_DATA) public data: { id: string }, private firestore: Firestore, public dialogRef: MatDialogRef<DialogEditContactpersonComponent>, private firestoreService: FirestoreService) {

  }

  /**
   * Initializes the component by fetching user details from Firestore.
   * If the user ID is found, it loads user data; otherwise, logs an error.
   * @returns {Promise<void>} Resolves after user data is loaded.
   */
  async ngOnInit(): Promise<void> {
    const userId = this.data.id;
    if (userId) {
      try {
        const userData = await this.firestoreService.fetchUserDetails(userId);
        if (userData) {
          this.user = { ...this.user, ...userData };
        }
      } catch (error) {
        console.error('Fehler beim Laden des Benutzers:', error);
      }
    } else {
      console.error('Keine User-ID in den Dialogdaten gefunden');
    }
  }

  /**
   * Saves the user data to Firestore.
   * Ensures the user ID exists before updating.
   * @returns {Promise<void>} Resolves after successfully saving the user.
   */
  async saveUser(): Promise<void> {
    if (!this.data.id) {
        console.error('User ID is missing.');
        return;
    }

    this.loading = true;
    try {
        await this.updateUserInFirestore();
        this.dialogRef.close(this.user);
    } catch (error) {
        console.error('Error saving user data:', error);
    } finally {
        this.loading = false;
    }
  }

  /**
   * Updates the user data in Firestore.
   * @returns {Promise<void>} Resolves after Firestore update.
   */
  private async updateUserInFirestore(): Promise<void> {
      const userDocRef = doc(this.firestore, `users/${this.data.id}`);
      const userToSave = { ...this.user, contacts: this.user.contacts.map(contact => ({ ...contact })) };
      await setDoc(userDocRef, userToSave);
  }
}