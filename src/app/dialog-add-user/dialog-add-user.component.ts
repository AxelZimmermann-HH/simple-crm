import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, FormControl, Validators } from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {
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
import { collection, addDoc, Firestore } from '@angular/fire/firestore';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { Router } from '@angular/router';




@Component({
  selector: 'app-dialog-add-user',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatDialogContent, MatInputModule, MatNativeDateModule, MatFormFieldModule, MatIconModule, MatDatepickerModule, MatDialogActions, MatButtonModule, FormsModule],
  templateUrl: './dialog-add-user.component.html',
  styleUrl: './dialog-add-user.component.scss'
})

export class DialogAddUserComponent {

  user = new User();
  birthDate?: Date;
  loading = false;


  /**
   * Component constructor.
   * @param {Firestore} firestore - Firestore instance for database operations.
   * @param {MatDialogRef<DialogAddUserComponent>} dialogRef - Reference to the dialog.
   * @param {Router} router - Router for navigation.
   */
  constructor(private firestore: Firestore, public dialogRef: MatDialogRef<DialogAddUserComponent>, private router: Router) {}

  /**
   * Checks, if the required fields are filled correctly.
   * @returns verification for activationg button
   */
  isFormValid(): boolean {
    return !!this.user.company &&
           !!this.user.firstName &&
           !!this.user.lastName &&
           !!this.user.mail;
  }

  /**
   * Saves the user to Firestore after performing necessary preprocessing.
   */
  saveUser(): void {
    this.prepareUserData();
    this.loading = true;

    this.addUserToFirestore();
    this.navigateToUserPage();
  }

  /**
  * Prepares the user data before saving, such as setting birthDate and default image.
  */
  private prepareUserData(): void {
    this.user.birthDate = this.birthDate ? this.birthDate.getTime() : new Date('2000-01-01').getTime();

    this.user.image = 'assets/profile-placeholder.jpg';

    const userData = { ...this.user };
    if (userData.birthDate === undefined) {
        delete userData.birthDate; 
    }
    this.user = userData;
  }

  /**
  * Adds the user data to Firestore.
  */
  private addUserToFirestore(): void {
    const usersCollection = collection(this.firestore, 'users');

    addDoc(usersCollection, this.user)
        .then((result) => {
            this.loading = false;
            this.dialogRef.close();
        })
        .catch((error) => {
            console.error('Error adding user:', error);
        });
  }

  /**
  * Navigates to the user page if not already there.
  */
  private navigateToUserPage(): void {
    if (!this.router.url.includes('/user')) {
        this.router.navigate(['/user']);
    }
  }
}