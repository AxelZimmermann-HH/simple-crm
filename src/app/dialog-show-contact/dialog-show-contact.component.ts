import { Inject, Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { User } from '../../models/user.class';
import { Contact } from '../../models/contact.class';
import { MatCard } from '@angular/material/card';
import { collection, addDoc, doc, deleteDoc, Firestore } from '@angular/fire/firestore';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { FirestoreService } from '../services/firestore.service';
import {MatMenuModule} from '@angular/material/menu';
import { DialogEditContactComponent } from '../dialog-edit-contact/dialog-edit-contact.component';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-dialog-show-contact',
  standalone: true,
  imports: [DatePipe, MatProgressBarModule, MatCard, MatMenuModule, MatInputModule, MatNativeDateModule, MatFormFieldModule, MatIconModule, MatDatepickerModule, MatButtonModule, FormsModule],
  templateUrl: './dialog-show-contact.component.html',
  styleUrl: './dialog-show-contact.component.scss'
})
export class DialogShowContactComponent {
  userId: string | null = null;
  user: User = new User;
  contact: Contact;
  deleted = false;


  constructor(@Inject(MAT_DIALOG_DATA) public data: { contact: Contact; id: string }, public dialogRef: MatDialogRef<DialogShowContactComponent>, private dialog: MatDialog, private firestore: Firestore,  private firestoreService: FirestoreService) {
    this.contact = data.contact;     
    this.userId = data.id; 
    console.log('Übergebene userId:', this.userId, 'vollständiger:', this.contact);
  }

  ngOnInit(): void {
    this.dialogRef.beforeClosed().pipe(take(1)).subscribe(() => {
        if (this.deleted) {
            console.log('Kontakt wurde gelöscht. Zurückgegeben wird nur die ID:', this.contact.id);
            this.dialogRef.close(this.contact.id); // Nur ID zurückgeben
        } else {
            console.log('Kontakt wurde bearbeitet. Zurückgegeben wird das Objekt:', this.contact);
            this.dialogRef.close(this.contact); // Bearbeiteter Kontakt wird zurückgegeben
        }
    });
}

deleteContact() {
  if (!this.userId || !this.contact.id) {
      console.error('Benutzer-ID oder Kontakt-ID fehlt.');
      return;
  }

  const userDocRef = doc(this.firestore, `users/${this.userId}`);
  const contactDocRef = doc(userDocRef, `contacts/${this.contact.id}`);

  deleteDoc(contactDocRef)
      .then(() => {
          console.log('Kontakt erfolgreich gelöscht:', this.contact.id);
          this.deleted = true; // 🔥 Merken, dass gelöscht wurde
          this.dialogRef.close(this.contact.id); // Manuelles Schließen mit ID
      })
      .catch((error) => {
          console.error('Fehler beim Löschen des Kontakts:', error);
      });
}

  deleteContact2() {
    if (!this.userId || !this.contact.id) {
      console.error('Benutzer-ID oder Kontakt-ID fehlt.');
      return;
    }
  
    const userDocRef = doc(this.firestore, `users/${this.userId}`);
    const contactDocRef = doc(userDocRef, `contacts/${this.contact.id}`);
  
    deleteDoc(contactDocRef)
      .then(() => {
        console.log('Kontakt erfolgreich gelöscht:', this.contact);
        this.dialogRef.close(this.contact.id); // Kontakt-ID an UserDetails zurückgeben
      })
      .catch((error) => {
        console.error('Fehler beim Löschen des Kontakts:', error);
      })
      .finally(() => {
      });
  }

  openEditContact(): void {
    console.log('userId beim Öffnen des Dialogs:', this.userId); // Debugging
    console.log('Kontakt beim Öffnen des Dialogs:', this.contact); // Debugging

    const dialogRef = this.dialog.open(DialogEditContactComponent, {
      width: '98%', // Setzt die Breite auf 100%
      maxWidth: '600px', // Begrenzung der maximalen Breite auf 600px
      data: { contact: this.contact, id: this.userId }, // Kontakt als Dialog-Daten übergeben
    });
    console.log(this.contact);
    
  
    dialogRef.afterClosed().subscribe((updatedContact) => {
      if (updatedContact) {
        this.contact = updatedContact; // Aktualisierten Kontakt in der Ansicht anzeigen
        console.log('Kontakt aktualisiert:', this.contact);
      }
    });
  }

  closeDialog(): void {
    console.log('Dialog geschlossen, Kontakt zurückgegeben:', this.contact); // Debugging

    this.dialogRef.close(this.contact); // Den aktuellen Kontakt beim Schließen übergeben
  }

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
        return 'assets/icons/default.svg'; // Fallback-Icon
    }
  }
}
