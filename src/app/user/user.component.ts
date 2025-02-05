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
import { collection, addDoc, Firestore, onSnapshot, CollectionReference, QuerySnapshot, DocumentData } from '@angular/fire/firestore';
import { Router } from '@angular/router'; // Router importieren


@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule,MatIconModule, MatButtonModule, MatTooltipModule, MatDialogModule, MatCardModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {

  allUsers: any[] = []; 
  user = new User();
  usersCollection = collection(this.firestore, 'users');
  groupedUsers: { letter: string, users: any[] }[] = [];
  

  constructor(public dialog: MatDialog, private firestore: Firestore, private router: Router) { }

  /**
   * Initializes component by fetching and displaying all user data.
   */
  ngOnInit(): void {
    this.loadUsers(); 
  }

  /**
 * Loads and groups users alphabetically by company name.
 */
  loadUsers(): void {
    const usersCollection = collection(this.firestore, 'users'); 

    onSnapshot(usersCollection, (snapshot) => {
        const users = this.processUserSnapshot(snapshot);
        this.groupedUsers = this.groupUsersAlphabetically(users);
    });
  }

  /**
  * Processes the Firestore snapshot and extracts user data.
  * @param snapshot Firestore snapshot containing user documents.
  * @returns An array of users with extracted fields.
  */
  private processUserSnapshot(snapshot: QuerySnapshot<DocumentData>): any[] {
    return snapshot.docs.map(doc => this.mapUserData(doc));
  }

  /**
  * Maps Firestore document data to a user object.
  * @param doc Firestore document snapshot of a user.
  * @returns A mapped user object with extracted properties.
  */
  private mapUserData(doc: any): any {
    const data = doc.data() as any;
    return {
        id: doc.id,
        company: data.company || '', 
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        city: data.city || ''
    };
  }

  /**
  * Groups users alphabetically by their company name.
  * @param users An array of users to be grouped.
  * @returns A structured array of grouped users by their first company letter.
  */
  private groupUsersAlphabetically(users: any[]): any[] {
    users.sort((a, b) => a.company.localeCompare(b.company));
    
    const groupedUsers: { letter: string, users: any[] }[] = [];
    let currentLetter = '';

    users.forEach(user => {
        const firstLetter = user.company.charAt(0).toUpperCase();

        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            groupedUsers.push({ letter: firstLetter, users: [] });
        }

        groupedUsers[groupedUsers.length - 1].users.push(user);
    });

    return groupedUsers;
  }

  /**
 * Sorts the list of all users alphabetically based on their company name.
 */
  sortUsersByCompany(): void {
    this.allUsers.sort((a, b) => a.company.localeCompare(b.company));
  }

  /**
 * Navigates to the detailed view of a selected user.
 * @param user The user object containing the user ID.
 */
  showUserDetails(user: any): void {
    this.router.navigate(['/user', user.id]);
  }

  /**
 * Opens a dialog for adding a new user.
 */
  openDialog() {
    this.dialog.open(DialogAddUserComponent);
  }
}