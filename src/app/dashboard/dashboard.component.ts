import { Component } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import { MatCard } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { FirestoreService } from '../services/firestore.service';
import { Contact } from '../../models/contact.class';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { DialogShowContactComponent } from '../dialog-show-contact/dialog-show-contact.component';

/**
 * Dashboard-Komponente für die Anzeige der neuesten Kontakte.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCard, MatCardModule, MatIconModule, MatButtonModule, MatProgressBarModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent {

  userId: string | null = null;
  userCount: number = 0;
  displayedContacts: Contact[] = [];
  allContacts: Contact[] = [];
  currentContactIndex = 0;
  loading = false;

  /**
     * Constructor for Dashboard-Component.
     * @param dialog MatDialog for modal dialogs
     * @param router Router for navigation
     * @param firestoreService FirestoreService for database-operations
  */
  constructor(public dialog: MatDialog, 
    private router: Router, 
    private firestoreService: FirestoreService) { }

  /**
   * Initializes the component and loads data from Firestore.
   */
  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.userCount = await this.firestoreService.getUserCount();
    this.allContacts = await this.firestoreService.getAllContacts();
    this.displayedContacts = this.allContacts.slice(0, 4);  
    this.loading = false;
  }

  /**
   * Returns a greeting based on the current time of day.
   * @returns {string} Greeting text
   */
  getGreeting(): string {
    const hour = new Date().getHours();
  
    if (hour >= 5 && hour < 12) {
      return 'Good Morning!';
    } else if (hour >= 12 && hour < 18) {
      return 'Good Afternoon!';
    } else if (hour >= 18 && hour < 22) {
      return 'Good Evening!';
    } else {
      return 'Good Night!';
    }
  }

  /**
   * Returns the appropriate icon for a communication channel.
   * @param channel (for example 'mail', 'phone', etc.)
   * @returns {string} icon path
   */
  getChannelIcon(channel: string): string {
    switch (channel) {
        case 'mail': return 'assets/icons/mail.svg';
        case 'phone': return 'assets/icons/phone.svg';
        case 'videocall': return 'assets/icons/videocall.svg';
        case 'personal': return 'assets/icons/personal.svg';
        default: return 'assets/icons/default.svg';
    }
  }

  /**
   * Opens the dialog for adding a new client.
   */
  goToAddUser() {
    this.dialog.open(DialogAddUserComponent);
  }

  /**
   * Navigates to the client overview.
   */
  goToClients() {
    this.router.navigate(['/user']);
  }

  /**
   * Opens the ShowContactDialog.
   * @param contact displayed contact.
   */
  openContact(contact: Contact): void {
    const dialogRef = this.dialog.open(DialogShowContactComponent, {
        width: '98%',
        maxWidth: '600px',
        data: { contact, id: contact.companyId },
    });

    dialogRef.afterClosed().subscribe(async (result) => {
        if (!result) return;
        await this.handleDialogResult(result);
    });
  }

  /**
   * Processes the result of the dialog after closing.
   * @param result The returned object from the dialog
   */
  private async handleDialogResult(result: any): Promise<void> {
      if (typeof result === 'string') {
          this.deleteContactLocally(result);
      } else if (typeof result === 'object') {
          await this.updateContactLocally(result);
      }
  }

  /**
   * Removes a deleted contact from the local list.
   * @param contactId ID of the contact to remove
   */
  private deleteContactLocally(contactId: string): void {
      this.allContacts = this.allContacts.filter((c) => c.id !== contactId);
      this.updateDisplayedContacts();
  }

  /**
   * Updates a changed contact in the local list.
   * @param updatedContact updated contact
   */
  private async updateContactLocally(updatedContact: Contact): Promise<void> {
      const index = this.allContacts.findIndex((c) => c.id === updatedContact.id);
      if (index !== -1) this.allContacts[index] = updatedContact;
      await this.reloadContactsFromFirestore();
  }

  /**
   * Updates the currently displayed contacts.
   */
  private updateDisplayedContacts(): void {
      this.displayedContacts = this.allContacts.slice(this.currentContactIndex, this.currentContactIndex + 4);
  }

  /**
   * Reloads all contacts from firestore.
   */
  private async reloadContactsFromFirestore(): Promise<void> {
      this.allContacts = await this.firestoreService.getAllContacts();
      this.updateDisplayedContacts();
  }

  /**
   * Shows the next four contacts.
   */
  showNextContacts(): void {
    if (this.currentContactIndex + 4 < this.allContacts.length) {
        this.currentContactIndex += 4; 
    } else {
        this.currentContactIndex = 0; 
    }
    this.displayedContacts = this.allContacts.slice(this.currentContactIndex, this.currentContactIndex + 4);
  }

  /**
   * Shows the previous four contacts.
   */
  showPreviousContacts(): void {
    if (this.currentContactIndex - 4 >= 0) {
        this.currentContactIndex -= 4; 
    } else {
        this.currentContactIndex = Math.max(0, this.allContacts.length - (this.allContacts.length % 4 || 4)); 
    }
    this.displayedContacts = this.allContacts.slice(this.currentContactIndex, this.currentContactIndex + 4);
  }
}