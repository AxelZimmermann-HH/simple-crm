import { Component } from '@angular/core';
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
import { collection, addDoc, Firestore } from '@angular/fire/firestore';
import {MatProgressBarModule} from '@angular/material/progress-bar';



@Component({
  selector: 'app-dialog-add-user',
  standalone: true,
  imports: [MatProgressBarModule, MatDialogContent, MatInputModule, MatNativeDateModule, MatFormFieldModule, MatIconModule, MatDatepickerModule, MatDialogActions, MatDialogClose, MatButtonModule, FormsModule],
  templateUrl: './dialog-add-user.component.html',
  styleUrl: './dialog-add-user.component.scss'
})

export class DialogAddUserComponent {

  user = new User();
  birthDate?: Date;

  loading = false;

  constructor(private firestore: Firestore, public dialogRef: MatDialogRef<DialogAddUserComponent>) {

  }

  onNoClick() {

  }

  saveUser() {
    this.user.birthDate = this.birthDate ? this.birthDate.getTime() : undefined;
    console.log('Current user:', this.user);
    this.loading = true;
  
    // Kopiere nur Felder, die definiert sind
    const userData = { ...this.user };
    if (userData.birthDate === undefined) {
      delete userData.birthDate; // Entferne das Feld, wenn es undefined ist
    }
  
    const usersCollection = collection(this.firestore, 'users'); // Referenz zur Collection
  
    addDoc(usersCollection, userData) // Benutzer hinzufügen
      .then((result) => {
        console.log('Adding user finished', result);
        this.loading = false;
        this.dialogRef.close()
      })
      .catch((error) => {
        console.error('Error adding user:', error);
      });
  }
}