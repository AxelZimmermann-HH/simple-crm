import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../../models/user.class';
import {MatMenuModule} from '@angular/material/menu';
import {MatDialog} from '@angular/material/dialog';
import {MatDialogModule} from '@angular/material/dialog';
import {DialogEditAddressComponent} from '../dialog-edit-address/dialog-edit-address.component';
import {DialogEditNameComponent} from '../dialog-edit-name/dialog-edit-name.component';
import { DialogEditContactpersonComponent } from '../dialog-edit-contactperson/dialog-edit-contactperson.component';
import { Router } from '@angular/router';



@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatMenuModule, MatDialogModule],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss'
})
export class UserDetailComponent implements OnInit {
  userId: string | null = null;
  user: User = new User;

  constructor(private route: ActivatedRoute, private firestore: Firestore, public dialog: MatDialog,  private router: Router) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.fetchUserDetails(userId);
    }
  }

  async fetchUserDetails(userId: string): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${userId}`); 
    const userDoc = await getDoc(userDocRef); 
    if (userDoc.exists()) {
      const userData = userDoc.data(); 
      this.user = { ...this.user, ...userData } as User; 
    } else {
      console.error('Benutzer nicht gefunden');
    }
  }

  openDialog(component: any) {
    const dialogRef = this.dialog.open(component, {
      data: { id: this.route.snapshot.paramMap.get('id') },
    });
  
    dialogRef.afterClosed().subscribe((updatedUser) => {
      if (updatedUser) {
        this.user = updatedUser; 
        console.log('Benutzerdaten nach dem Speichern aktualisiert:', this.user);
      }
    });
  }

  openNameDialog() {
    this.openDialog(DialogEditNameComponent);
  }

  openAddressDialog() {
    this.openDialog(DialogEditAddressComponent);
  }
  
  openContactPersonDialog() {
    this.openDialog(DialogEditContactpersonComponent);
  }

  getBack() {
    this.router.navigate(['/user']);
  }
}