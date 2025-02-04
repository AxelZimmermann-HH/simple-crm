import { Inject, Component } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogRef} from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { doc, deleteDoc, Firestore } from '@angular/fire/firestore';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { FirestoreService } from '../services/firestore.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dialog-delete-user',
  standalone: true,
  imports: [MatProgressBarModule, MatDialogActions, MatButtonModule],
  templateUrl: './dialog-delete-user.component.html',
  styleUrl: './dialog-delete-user.component.scss'
})
export class DialogDeleteUserComponent {

  loading = false;
  user: User = new User;

  /**
   * Component constructor for deleting a user.
   * Handles retrieving user details before deletion.
   */
  constructor(@Inject(MAT_DIALOG_DATA) public data: { id: string }, private firestore: Firestore, public dialogRef: MatDialogRef<DialogDeleteUserComponent>, private firestoreService: FirestoreService, private router: Router) {}

  /**
   * Initializes the dialog by fetching user details based on the provided user ID.
   * If no user ID is found, an error is logged.
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
 * Deletes the user from Firestore if a valid user ID is provided.
 */
  deleteUser(): void {
    if (!this.validateUserId()) return;

    this.loading = true;
    this.performUserDeletion();
  }

  /**
  * Validates if a user ID is available before attempting deletion.
  * @returns {boolean} True if the user ID exists, false otherwise.
  */
  private validateUserId(): boolean {
    if (!this.data.id) {
        console.error('No user ID available for deletion.');
        return false;
    }
    return true;
  }

  /**
  * Performs the deletion of the user from Firestore.
  */
  private performUserDeletion(): void {
    const userDocRef = doc(this.firestore, `users/${this.data.id}`);

    deleteDoc(userDocRef)
        .then(() => {
            this.handleSuccessfulDeletion();
        })
        .catch((error) => {
            console.error('Error deleting user:', error);
        })
        .finally(() => {
            this.loading = false;
        });
  }

  /**
  * Handles actions after successful deletion, such as closing the dialog and navigating away.
  */
  private handleSuccessfulDeletion(): void {
    this.dialogRef.close();
    this.router.navigate(['/user/']);
  }
}
