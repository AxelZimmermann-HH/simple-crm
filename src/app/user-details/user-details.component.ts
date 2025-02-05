import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
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

  /**
 * Constructor for the User Details component.
 * @param route ActivatedRoute for accessing route parameters.
 * @param firestore Firestore service for database interactions.
 * @param firestoreService Custom Firestore service for fetching data.
 * @param dialog MatDialog for opening modals.
 * @param router Router for navigation.
 */
  constructor(private route: ActivatedRoute, private firestore: Firestore, private firestoreService: FirestoreService, public dialog: MatDialog,  private router: Router) {}

  /**
   * Lifecycle hook that is called after component initialization.
   * Retrieves the user ID from the route parameters and loads user details.
   */
  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    console.log(this.userId);
    
    if (this.userId) {
      this.loadUserDetails(this.userId);
    }
  }

  /**
   * Fetches user details from Firestore based on the provided user ID.
   * @param userId The ID of the user to be fetched.
   */
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
  
  /**
 * Opens a dialog component.
 * @param component The component to be opened in the dialog.
 */
  openDialog(component: any) {
    const dialogRef = this.dialog.open(component, {
      width: '98%', 
      maxWidth: '600px', 
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

  /**
 * Opens the dialog to edit the user's name.
 */
  openNameDialog() {
    this.openDialog(DialogEditNameComponent);
  }

  /**
 * Opens the dialog to edit the user's profile image.
 */
  openImgDialog() {
    this.openDialog(DialogEditImgComponent);
  }

  /**
 * Opens the dialog to edit the user's address.
 */
  openAddressDialog() {
    this.openDialog(DialogEditAddressComponent);
  }
  
  /**
 * Opens the dialog to edit the user's contact person information.
 */
  openContactPersonDialog() {
    this.openDialog(DialogEditContactpersonComponent);
  }

  /**
 * Opens the dialog to delete the user.
 */
  openDeleteUserDialog() {
    this.openDialog(DialogDeleteUserComponent);
  }

  /**
 * Opens the dialog to add a new contact for the user.
 */
  openAddContactDialog() {
    this.openDialog(DialogAddContactComponent);
  }

  /**
 * Opens the dialog to display details of a specific contact. Specific function needed because of 
 * further handling in different components.
 * @param contact The contact to be displayed.
 */
  openShowContactDialog(contact: Contact): void {
    const dialogRef = this.dialog.open(DialogShowContactComponent, {
      width: '98%', 
      maxWidth: '600px', 
      data: { contact, id: this.userId }, 
    });
  
    dialogRef.afterClosed().subscribe((result) => {
  
      if (!result) {
        return; 
      }
  
      if (typeof result === 'string') {
        this.user.contacts = this.user.contacts.filter((c) => c.id !== result);
      } else if (result && typeof result === 'object') {
        const index = this.user.contacts.findIndex((c) => c.id === result.id);
        if (index !== -1) {
          this.user.contacts[index] = result; 
        }
      }
    });
  }

  /**
 * Navigates back to the user list page.
 */
  getBack() {
    this.router.navigate(['/user']);
  }

  /**
 * Returns the appropriate icon for a given communication channel.
 * @param channel The communication channel type (e.g., mail, phone).
 * @returns The path to the corresponding icon.
 */
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
        return 'assets/icons/default.svg';
    }
  }
}