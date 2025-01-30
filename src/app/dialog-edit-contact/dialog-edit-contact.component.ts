import { Inject, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from '@angular/forms';
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
import { MatCard } from '@angular/material/card';


@Component({
  selector: 'app-dialog-edit-contact',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatCard, MatSelectModule, MatDialogContent, MatInputModule, MatNativeDateModule, MatFormFieldModule, MatIconModule, MatDatepickerModule, MatDialogActions, MatButtonModule, FormsModule],
  templateUrl: './dialog-edit-contact.component.html',
  styleUrl: './dialog-edit-contact.component.scss'
})
export class DialogEditContactComponent {
  loading = false;
  contact: Contact;
  userId: string;

  constructor(
    public dialogRef: MatDialogRef<DialogEditContactComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { contact: Contact; id: string },
    private firestoreService: FirestoreService 
  ) {
    console.log('Daten im Dialog empfangen:', data);
    this.contact = { ...data.contact }; // Kontakt kopieren, um Änderungen zu machen
    this.userId = data.id;
    console.log('Kontakt:', this.contact, 'UserId:', this.userId);
    
  }

  async saveContact(): Promise<void> {
    if (!this.userId || !this.contact.id) {
      console.error('Benutzer-ID oder Kontakt-ID fehlt');
      return;
    }

    this.loading = true; // Ladeindikator aktivieren

    try {
      // Kontakt in Firestore aktualisieren
      await this.firestoreService.updateContact(this.userId, this.contact);
      console.log('Kontakt erfolgreich aktualisiert:', this.contact);
      this.dialogRef.close(this.contact); // Geänderten Kontakt zurückgeben
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Kontakts:', error);
    } finally {
      this.loading = false; // Ladeindikator deaktivieren
    }
  }

  cancel(): void {
    this.dialogRef.close(); // Dialog schließen, ohne Änderungen
  }
}
