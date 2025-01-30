import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore, doc, getDoc, collection, getDocs, query } from '@angular/fire/firestore';
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
import { DialogEditImgComponent } from '../dialog-edit-img/dialog-edit-img.component';
import { DialogDeleteUserComponent } from '../dialog-delete-user/dialog-delete-user.component';
import { DialogAddContactComponent } from '../dialog-add-contact/dialog-add-contact.component';
import { DialogShowContactComponent } from '../dialog-show-contact/dialog-show-contact.component';
import { Router } from '@angular/router';
import { FirestoreService } from '../services/firestore.service';
import { Contact } from '../../models/contact.class';


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
  contact = new Contact();

  constructor(private route: ActivatedRoute, private firestore: Firestore, private firestoreService: FirestoreService, public dialog: MatDialog,  private router: Router) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    console.log(this.userId);
    
    if (this.userId) {
      this.loadUserDetails(this.userId);
    }
  }

  async loadUserDetails(userId: string): Promise<void> {
    try {
      const user = await this.firestoreService.fetchUserDetails(userId);
      if (user) {
        this.user = user;
      }
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerdetails:', error);
    }
  }
  
  openDialog(component: any) {
    const dialogRef = this.dialog.open(component, {
      data: { id: this.route.snapshot.paramMap.get('id') },
    });
  
    dialogRef.afterClosed().subscribe(async (result) => {
      const userId = this.route.snapshot.paramMap.get('id');
      
      if (result === true && userId) {
        try {
          this.user.contacts = await this.firestoreService.fetchContacts(userId);
        } catch (error) {
          console.error('Fehler beim Laden der Kontakte:', error);
        }
      } else if (result && typeof result === 'object') {
        const updatedContacts = this.user.contacts;
        this.user = result;
        this.user.contacts = updatedContacts;
      }
    });
  }

  openNameDialog() {
    this.openDialog(DialogEditNameComponent);
  }

  openImgDialog() {
    this.openDialog(DialogEditImgComponent);
  }

  openAddressDialog() {
    this.openDialog(DialogEditAddressComponent);
  }
  
  openContactPersonDialog() {
    this.openDialog(DialogEditContactpersonComponent);
  }

  openDeleteUserDialog() {
    this.openDialog(DialogDeleteUserComponent);
  }

  openAddContactDialog() {
    this.openDialog(DialogAddContactComponent);
  }

  openShowContactDialog(contact: Contact): void {
    const dialogRef = this.dialog.open(DialogShowContactComponent, {
      data: { contact, id: this.userId }, // Kontakt und Benutzer-ID übergeben
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog geschlossen, Ergebnis:', result); // Debugging
  
      if (!result) {
        return; // Wenn der Dialog ohne Aktion geschlossen wird
      }
  
      if (typeof result === 'string') {
        // Kontakt wurde gelöscht, result enthält die ID
        this.user.contacts = this.user.contacts.filter((c) => c.id !== result);
        console.log('Kontakt gelöscht:', result);
      } else if (result && typeof result === 'object') {
        // Kontakt wurde aktualisiert, result enthält den aktualisierten Kontakt
        const index = this.user.contacts.findIndex((c) => c.id === result.id);
        if (index !== -1) {
          this.user.contacts[index] = result; // Aktualisierung in der lokalen Liste
        }
        console.log('Kontakt aktualisiert:', result);
      }
    });
  }

  

  getBack() {
    this.router.navigate(['/user']);
  }

  getChannelIcon(channel: string): string {
    switch (channel) {
      case 'mail':
        return 'assets/icons/mail.svg';
      case 'phone':
        return 'assets/icons/phone.svg';
      case 'videocall':
        return 'assets/icons/videocall.svg';
      case 'personal':
        return 'assets/icons/personal.svg';
      default:
        return 'assets/icons/default.svg'; // Fallback-Icon
    }
  }
}