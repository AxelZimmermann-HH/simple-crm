import { Inject, Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../models/user.class';
import { Contact } from '../../models/contact.class';
import { MatCard } from '@angular/material/card';
import { doc, deleteDoc, Firestore } from '@angular/fire/firestore';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { FirestoreService } from '../services/firestore.service';
import {MatMenuModule} from '@angular/material/menu';
import { DialogEditContactComponent } from '../dialog-edit-contact/dialog-edit-contact.component';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-dialog-show-contact',
  standalone: true,
  imports: [DatePipe, MatProgressBarModule, MatCard, MatMenuModule, MatInputModule, MatFormFieldModule, MatIconModule, MatButtonModule, FormsModule],
  templateUrl: './dialog-show-contact.component.html',
  styleUrl: './dialog-show-contact.component.scss'
})
export class DialogShowContactComponent {
  userId: string | null = null;
  user: User = new User;
  contact: Contact;
  deleted = false;

  /**
   * Component constructor for displaying and managing contact details.
   */
  constructor(@Inject(MAT_DIALOG_DATA) public data: { contact: Contact; id: string }, public dialogRef: MatDialogRef<DialogShowContactComponent>, private dialog: MatDialog, private firestore: Firestore,  private firestoreService: FirestoreService) {
    this.contact = data.contact;     
    this.userId = data.id; 
  }

  /**
   * Initializes the dialog and handles the closing behavior.
   * Ensures that if the contact was deleted, only the contact ID is returned.
   */
  ngOnInit(): void {
    this.dialogRef.beforeClosed().pipe(take(1)).subscribe(() => {
        if (this.deleted) {
            this.dialogRef.close(this.contact.id); 
        } else {
            this.dialogRef.close(this.contact);
        }
    });
  } 

  /**
   * Deletes the contact from Firestore.
   * If the deletion is successful, the contact ID is returned to the parent component.
   */
  deleteContact() {
    if (!this.userId || !this.contact.id) {
        console.error('Benutzer-ID oder Kontakt-ID fehlt.');
        return;
    }
    const userDocRef = doc(this.firestore, `users/${this.userId}`);
    const contactDocRef = doc(userDocRef, `contacts/${this.contact.id}`);

    deleteDoc(contactDocRef)
        .then(() => {
            this.deleted = true; 
            this.dialogRef.close(this.contact.id); 
        })
        .catch((error) => {
            console.error('Fehler beim Löschen des Kontakts:', error);
        });
  }

  /**
   * Opens the dialog to edit the contact details.
   * Once the edit dialog is closed, it updates the displayed contact information.
   */
  openEditContact(): void {
    const dialogRef = this.dialog.open(DialogEditContactComponent, {
      width: '98%', 
      maxWidth: '600px', 
      data: { contact: this.contact, id: this.userId }, 
    });

    dialogRef.afterClosed().subscribe((updatedContact) => {
      if (updatedContact) {
        this.contact = updatedContact; 
      }
    });
  }

  /**
   * Closes the dialog and returns the current contact data.
   */
  closeDialog(): void {
    this.dialogRef.close(this.contact);
  }

  /**
   * Returns the appropriate icon URL based on the communication channel.
   * @param channel The type of communication channel (e.g., 'mail', 'phone').
   * @returns The corresponding icon path as a string.
   */
  getChannelIcon(channel: string): string {
    switch (channel) {
      case 'mail':
        return 'assets/icons/mail-red.svg';
      case 'phone':
        return 'assets/icons/phone-red.svg';
      case 'videocall':
        return 'assets/icons/videocall-red.svg';
      case 'personal':
        return 'assets/icons/personal-red.svg';
      default:
        return 'assets/icons/default.svg'; 
    }
  }
}