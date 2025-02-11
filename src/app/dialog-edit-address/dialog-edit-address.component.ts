import { CommonModule } from '@angular/common';
import { Inject, Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef
} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../models/user.class';
import { doc, setDoc, Firestore } from '@angular/fire/firestore';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { FirestoreService } from '../services/firestore.service';

@Component({
  selector: 'app-dialog-edit-address',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatDialogContent, MatInputModule, MatFormFieldModule, MatIconModule, MatDialogActions, MatButtonModule, FormsModule],
  templateUrl: './dialog-edit-address.component.html',
  styleUrl: './dialog-edit-address.component.scss'
})
export class DialogEditAddressComponent {
  loading = false;
  user: User = new User;

  /**
 * Component contructor for editing a user's address.
 * Fetches user details based on the provided user ID.
 */
  constructor(@Inject(MAT_DIALOG_DATA) public data: { id: string }, private firestore: Firestore, public dialogRef: MatDialogRef<DialogEditAddressComponent>, private firestoreService: FirestoreService) {}

  /**
 * Initializes the component by fetching user details if a valid user ID is provided.
 * Logs an error if no user ID is found.
 * @returns {Promise<void>} - Resolves once user data is retrieved.
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
   * Saves the updated user data to Firestore.
   * Ensures data integrity before performing the save operation.
   */
  async saveUser(): Promise<void> {
    this.loading = true;

    if (!this.validateUserId()) return;

    try {
        const userToSave = this.prepareUserData();
        await this.saveUserToFirestore(userToSave);
        this.finalizeSaveOperation();
    } catch (error) {
        this.handleSaveError(error);
    }
  }

  /**
  * Validates whether a user ID exists before proceeding with the save operation.
  * @returns {boolean} - Returns true if valid, otherwise stops execution.
  */
  private validateUserId(): boolean {
    if (!this.data.id) {
        console.error('No user ID found to save data.');
        this.loading = false;
        return false;
    }
    return true;
  }

  /**
  * Prepares the user data by copying user details and ensuring contacts are structured properly.
  * @returns {any} - A structured object ready to be saved in Firestore.
  */
  private prepareUserData(): any {
    return {
        ...this.user
    };
  }

  /**
  * Saves the user data to Firestore under the specified user ID.
  * @param {any} userToSave - The structured user data to be stored.
  * @returns {Promise<void>} - Resolves when the save operation is complete.
  */
  private async saveUserToFirestore(userToSave: any): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${this.data.id}`);
    await setDoc(userDocRef, userToSave);
  }

  /**
  * Handles successful save operations by closing the dialog and resetting loading state.
  */
  private finalizeSaveOperation(): void {
    this.dialogRef.close(this.user);
    this.loading = false;
  }

  /**
  * Handles errors that occur during the save operation.
  * @param {any} error - The error that occurred during the save process.
  */
  private handleSaveError(error: any): void {
    console.error('Error saving user data:', error);
    this.loading = false;
  }
}