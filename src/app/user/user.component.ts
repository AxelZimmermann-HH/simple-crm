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
  groupedUsers: { letter: string, users: any[] }[] = [];
  

  constructor(public dialog: MatDialog, private firestore: Firestore, private router: Router) { }

  ngOnInit(): void {
    this.loadUsers(); // Benutzer laden

  }

  loadUsers(): void {
    const usersCollection = collection(this.firestore, 'users'); // 'users'-Collection referenzieren
    onSnapshot(usersCollection, (snapshot) => {
      const users = snapshot.docs.map(doc => {
        const data = doc.data() as any; // Firestore gibt nicht automatisch den richtigen Typ zurück
        return {
          id: doc.id,
          company: data.company || '', // Falls `company` nicht existiert, setze leeren String
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          city: data.city || ''
        };
      });
  
      // User alphabetisch nach `company` sortieren
      users.sort((a, b) => a.company.localeCompare(b.company));
  
      // Gruppierung nach dem ersten Buchstaben der `company`
      this.groupedUsers = [];
      let currentLetter = '';
  
      users.forEach(user => {
        const firstLetter = user.company.charAt(0).toUpperCase(); // Ersten Buchstaben extrahieren
  
        // Falls neuer Buchstabe, füge eine neue Gruppe hinzu
        if (firstLetter !== currentLetter) {
          currentLetter = firstLetter;
          this.groupedUsers.push({ letter: firstLetter, users: [] });
        }
  
        // Füge den User zur richtigen Gruppe hinzu
        this.groupedUsers[this.groupedUsers.length - 1].users.push(user);
      });
    });
  }
  

  loadUsers2(): void {
    const usersCollection = collection(this.firestore, 'users'); // 'users'-Collection referenzieren
    onSnapshot(usersCollection, (snapshot) => {
      this.allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Inkl. userId (doc.id)
      this.sortUsersByCompany();
    });
  }

  sortUsersByCompany(): void {
    this.allUsers.sort((a, b) => a.company.localeCompare(b.company));
  }

  showUserDetails(user: any): void {
    this.router.navigate(['/user', user.id]);
  }

  openDialog() {
    this.dialog.open(DialogAddUserComponent);
  }
}
