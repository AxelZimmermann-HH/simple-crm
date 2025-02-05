import { Inject, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { Contact } from '../../models/contact.class';
import { FirestoreService } from '../services/firestore.service';
import { MatCard } from '@angular/material/card';


@Component({
  selector: 'app-dialog-edit-contact',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatCard, MatSelectModule, MatDialogContent, MatInputModule, MatFormFieldModule, MatIconModule, MatDialogActions, MatButtonModule, FormsModule],
  templateUrl: './dialog-edit-contact.component.html',
  styleUrl: './dialog-edit-contact.component.scss'
})
export class DialogEditContactComponent {
  loading = false;
  contact: Contact;
  userId: string;

  /**
   * Component constructor for editing a contact.
   * Receives the contact data and user ID as dialog data.
   */
  constructor(
    public dialogRef: MatDialogRef<DialogEditContactComponent>, @Inject(MAT_DIALOG_DATA) public data: { contact: Contact; id: string }, private firestoreService: FirestoreService ) {
    this.contact = { ...data.contact };
    this.userId = data.id;
  }

  /**
   * Saves the edited contact to Firestore.
   * Ensures that the user ID and contact ID exist before updating.
   * @returns {Promise<void>} - Resolves after the contact is successfully updated.
   */
  async saveContact(): Promise<void> {
    if (!this.userId || !this.contact.id) {
      console.error('Benutzer-ID oder Kontakt-ID fehlt');
      return;
    }

    this.loading = true; 
    try {
      await this.firestoreService.updateContact(this.userId, this.contact);
      this.dialogRef.close(this.contact); 
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Kontakts:', error);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Closes the dialog without saving any changes.
   */
  cancel(): void {
    this.dialogRef.close();
  }
}