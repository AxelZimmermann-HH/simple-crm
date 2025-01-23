import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialog} from '@angular/material/dialog';
import {MatDialogModule} from '@angular/material/dialog';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { User } from '../../models/user.class';
import {MatCardModule} from '@angular/material/card';
import { collection, addDoc, Firestore, onSnapshot, CollectionReference } from '@angular/fire/firestore';
import { Router } from '@angular/router'; // Router importieren


@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule,MatIconModule, MatButtonModule, MatTooltipModule, MatDialogModule, MatCardModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {

  allUsers: any[] = []; // Array zum Speichern der Benutzer
  user = new User();
  usersCollection = collection(this.firestore, 'users');
  

  constructor(public dialog: MatDialog, private firestore: Firestore, private router: Router) { }

  ngOnInit(): void {
    this.loadUsers(); // Benutzer laden
  }

  loadUsers(): void {
    const usersCollection = collection(this.firestore, 'users'); // 'users'-Collection referenzieren
    onSnapshot(usersCollection, (snapshot) => {
      this.allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Inkl. userId (doc.id)
    });
  }

  showUserDetails(user: any): void {
    this.router.navigate(['/user', user.id]);
  }

  openDialog() {
    this.dialog.open(DialogAddUserComponent);
  }
}
