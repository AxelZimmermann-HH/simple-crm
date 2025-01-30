import { Inject, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';
import { MatCard } from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
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
  imports: [CommonModule, MatCard, MatProgressBarModule, MatSelectModule, MatDialogContent, MatInputModule, MatNativeDateModule, MatFormFieldModule, MatIconModule, MatDatepickerModule, MatDialogActions, MatButtonModule, FormsModule],
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

  constructor(@Inject(MAT_DIALOG_DATA) public data: { id: string }, private firestore: Firestore, private firestoreService: FirestoreService, public dialogRef: MatDialogRef<DialogAddContactComponent>) {}

  async ngOnInit(): Promise<void> {
    this.userId = this.data.id;
    if (this.userId) {
      try {
        const userData = await this.firestoreService.fetchUserDetails(this.userId);
        if (userData) {
          this.user = { ...this.user, ...userData };     
          console.log(this.user);
          
        }
      } catch (error) {
        console.error('Fehler beim Laden des Benutzers:', error);
      }
    } else {
      console.error('Keine User-ID in den Dialogdaten gefunden');
    }
  }

  formValid(): boolean {
    return (
      !!this.contact.contactDate &&
      !!this.contact.channel &&
      !!this.contact.text
    );
  }

  saveContact() {
    if (this.contact.contactDate) {
      this.contact.contactDate = new Date(this.contact.contactDate as any).getTime();
    }

    this.contact.company = this.user.company;
  
    this.loading = true;
  
    if (!this.userId) {
      console.error('Benutzer-ID ist nicht gesetzt.');
      this.loading = false;
      return;
    }
  
    const userDocRef = doc(this.firestore, `users/${this.userId}`);
    const contactsCollection = collection(userDocRef, 'contacts');
  
    const { id, ...contactData } = this.contact;  

    addDoc(contactsCollection, contactData) // Kontakt hinzufügen
      .then((result) => {
        console.log('Adding contact finished:', result);
        this.loading = false;
        this.dialogRef.close(true);
      })
      .catch((error) => {
        console.error('Error adding contact:', error);
        this.loading = false;
      });
  }
}
