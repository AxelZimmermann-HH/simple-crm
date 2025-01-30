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

  constructor(@Inject(MAT_DIALOG_DATA) public data: { id: string }, private firestore: Firestore, public dialogRef: MatDialogRef<DialogDeleteUserComponent>, private firestoreService: FirestoreService, private router: Router) {}

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


  deleteUser(): void {
    if (!this.data.id) {
      console.error('Keine User-ID zum Löschen vorhanden.');
      return;
    }
  
    this.loading = true;
    const userDocRef = doc(this.firestore, `users/${this.data.id}`);
  
    deleteDoc(userDocRef)
      .then(() => {
        this.dialogRef.close(); 
        this.router.navigate(['/user/']); 
      })
      .catch((error) => {
        console.error('Fehler beim Löschen des Benutzers:', error);
      })
      .finally(() => {
        this.loading = false; 
      });
  }
}
