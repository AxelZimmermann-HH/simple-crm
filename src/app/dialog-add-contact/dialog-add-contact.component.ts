import { Inject, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';
import { MatCard } from '@angular/material/card';
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
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { User } from '../../models/user.class';
import { collection, addDoc, doc, Firestore } from '@angular/fire/firestore';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { Contact } from '../../models/contact.class';
import { FirestoreService } from '../services/firestore.service';

@Component({
  selector: 'app-dialog-add-contact',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatSelectModule, MatDialogContent, MatInputModule, MatNativeDateModule, MatFormFieldModule, MatIconModule, MatDatepickerModule, MatDialogActions, MatButtonModule, FormsModule],
  templateUrl: './dialog-add-contact.component.html',
  styleUrl: './dialog-add-contact.component.scss'
})

export class DialogAddContactComponent {

  userId: string | null = null;
  user: User = new User;
  contact = new Contact();
  contactDate?: Date;
  loading = false;
  selected: string | null = null;

  /**
   * Component constructor.
   * @param {Object} data - Injected dialog data containing user ID.
   * @param {Firestore} firestore - Firestore instance for database operations.
   * @param {FirestoreService} firestoreService - Service to fetch user details.
   * @param {MatDialogRef<DialogAddContactComponent>} dialogRef - Reference to the dialog.
   */
  constructor(@Inject(MAT_DIALOG_DATA) public data: { id: string }, private firestore: Firestore, 
    private firestoreService: FirestoreService, public dialogRef: MatDialogRef<DialogAddContactComponent>) {}

  /**
   * Initializes the component by fetching user details if the user ID exists.
   * @returns {Promise<void>} Resolves when initialization is complete.
   */
  async ngOnInit(): Promise<void> {
    this.userId = this.data.id;
    if (this.userId) {
      try {
        const userData = await this.firestoreService.fetchUserDetails(this.userId);
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
   * Checks whether the form is valid.
   * @returns {boolean} Returns `true` if all required fields are filled, otherwise `false`.
   */
  formValid(): boolean {
    return (
      !!this.contact.contactDate &&
      !!this.contact.channel &&
      !!this.contact.text
    );
  }
  /**
   * Saves the contact to Firestore after performing necessary validations.
  */
  saveContact(): void {
    if (!this.validateUserId()) return;
    this.setContactTimestamp();
    this.setContactCompanyInfo();

    this.loading = true;
    this.addContactToFirestore();
}

  /**
   * Validates if the user ID is set.
   * @returns {boolean} Returns `true` if the user ID exists, otherwise `false`.
   */
  private validateUserId(): boolean {
      if (!this.userId) {
          console.error('User ID is not set.');
          this.loading = false;
          return false;
      }
      return true;
  }

  /**
   * Sets the contact timestamp with the selected date and current time.
   */
  private setContactTimestamp(): void {
      if (!this.contact.contactDate) return;
      
      const selectedDate = new Date(this.contact.contactDate as any);
      const currentTime = new Date();

      selectedDate.setHours(
          currentTime.getHours(), 
          currentTime.getMinutes(), 
          currentTime.getSeconds(), 
          0
      );
      this.contact.contactDate = selectedDate.getTime();
  }

  /**
   * Assigns the company details to the contact.
   */
  private setContactCompanyInfo(): void {
      this.contact.companyId = this.userId;
      this.contact.company = this.user.company;
  }

  /**
   * Adds the contact to Firestore.
   */
  private addContactToFirestore(): void {
      const userDocRef = doc(this.firestore, `users/${this.userId}`);
      const contactsCollection = collection(userDocRef, 'contacts');

      const { id, ...contactData } = this.contact;

      addDoc(contactsCollection, contactData)
          .then((result) => this.handleSuccessfulSave(result))
          .catch((error) => this.handleSaveError(error));
  }

  /**
   * Handles a successful contact save operation.
   * @param {any} result - The result of the Firestore operation.
   */
  private handleSuccessfulSave(result: any): void {
      this.loading = false;
      this.dialogRef.close(true);
  }

  /**
   * Handles an error during contact saving.
   * @param {any} error - The error that occurred.
   */
  private handleSaveError(error: any): void {
      console.error('Error adding contact:', error);
      this.loading = false;
  }
}