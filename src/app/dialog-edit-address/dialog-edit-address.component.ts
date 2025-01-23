import { Inject, Component } from '@angular/core';
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
import { collection, addDoc, doc, setDoc, Firestore } from '@angular/fire/firestore';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { FirestoreService } from '../services/firestore.service';

@Component({
  selector: 'app-dialog-edit-address',
  standalone: true,
  imports: [MatProgressBarModule, MatDialogContent, MatInputModule, MatNativeDateModule, MatFormFieldModule, MatIconModule, MatDatepickerModule, MatDialogActions, MatDialogClose, MatButtonModule, FormsModule],
  templateUrl: './dialog-edit-address.component.html',
  styleUrl: './dialog-edit-address.component.scss'
})
export class DialogEditAddressComponent {
  loading = false;
  user: User = new User;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { id: string }, private firestore: Firestore, public dialogRef: MatDialogRef<DialogEditAddressComponent>, private firestoreService: FirestoreService) {

  }

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

  async saveUser(): Promise<void> {

    this.loading = true;

      if (!this.data.id) {
        console.error('Keine User-ID gefunden, um die Daten zu speichern.');
        return;
      }
    
      try {
        const userDocRef = doc(this.firestore, `users/${this.data.id}`); // Dokumentreferenz basierend auf der ID
        await setDoc(userDocRef, { ...this.user }); // Aktualisiere die Benutzerdaten in Firestore
        console.log('Benutzerdaten erfolgreich gespeichert:', this.user);
        this.dialogRef.close(this.user); // Dialog schließen und die aktualisierten Daten zurückgeben
        this.loading = false;
      } catch (error) {
        console.error('Fehler beim Speichern der Benutzerdaten:', error);
      }
    }

}
