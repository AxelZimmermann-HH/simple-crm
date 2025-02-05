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
  selector: 'app-dialog-edit-name',
  standalone: true,
  imports: [MatProgressBarModule, MatDialogContent, MatInputModule, MatNativeDateModule, MatFormFieldModule, MatIconModule, MatDatepickerModule, MatDialogActions, MatButtonModule, FormsModule],
  templateUrl: './dialog-edit-name.component.html',
  styleUrl: './dialog-edit-name.component.scss'
})
export class DialogEditNameComponent {

  loading = false;
  user: User = new User;

  /**
   * Component constructor for editing a user's name.
   */
  constructor(@Inject(MAT_DIALOG_DATA) public data: { id: string }, private firestore: Firestore, public dialogRef: MatDialogRef<DialogEditNameComponent>, private firestoreService: FirestoreService) {}

  /**
   * Initializes the component by fetching user details.
   * If a valid user ID is provided, it retrieves the user data from Firestore.
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
   * Ensures the user ID is available before saving.
   */
  async saveUser(): Promise<void> {
    this.loading = true;

    if (!this.data.id) {
      console.error('Keine User-ID gefunden, um die Daten zu speichern.');
      return;
    }
    try {
      const userToSave = {...this.user, contacts: this.user.contacts.map((contact) => ({ ...contact })),};
      const userDocRef = doc(this.firestore, `users/${this.data.id}`); 
      await setDoc(userDocRef, userToSave); 
      this.dialogRef.close(this.user);
      this.loading = false;
    } catch (error) {
      console.error('Fehler beim Speichern der Benutzerdaten:', error);
    }
  }
}