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





@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCard, MatCardModule, MatIconModule, MatButtonModule, MatProgressBarModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  userCount: number = 0;
  latestContacts: Contact[] = [];
  displayedContacts: Contact[] = []; // Kontakte, die aktuell angezeigt werden
  allContacts: Contact[] = [];
  currentContactIndex = 0;
  loading = false;

  constructor(public dialog: MatDialog, private router: Router, private firestoreService: FirestoreService) { }


  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.userCount = await this.firestoreService.getUserCount();
    this.allContacts = await this.firestoreService.getLatestContacts();
    this.displayedContacts = this.allContacts.slice(0, 4); // Die ersten 4 Kontakte anzeigen
    this.loading = false;
    console.log('Neueste Kontakte:', this.latestContacts);
  }

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

  getChannelIcon(channel: string): string {
    switch (channel) {
        case 'mail': return 'assets/icons/mail.svg';
        case 'phone': return 'assets/icons/phone.svg';
        case 'videocall': return 'assets/icons/videocall.svg';
        case 'personal': return 'assets/icons/personal.svg';
        default: return 'assets/icons/default.svg';
    }
}

  goToAddUser() {
    // this.router.navigate(['/user']);
    this.dialog.open(DialogAddUserComponent);
  }

  goToClients() {
    this.router.navigate(['/user']);
  }

  showNextContacts(): void {
    if (this.currentContactIndex + 4 < this.allContacts.length) {
        this.currentContactIndex += 4; // Index um 4 erhöhen
    } else {
        this.currentContactIndex = 0; // Wenn Ende erreicht, von vorne beginnen
    }

    this.displayedContacts = this.allContacts.slice(this.currentContactIndex, this.currentContactIndex + 4);
  }

  showPreviousContacts(): void {
    if (this.currentContactIndex - 4 >= 0) {
        this.currentContactIndex -= 4; // Index um 4 verringern
    } else {
        this.currentContactIndex = Math.max(0, this.allContacts.length - (this.allContacts.length % 4 || 4)); 
        // Falls wir am Anfang sind, gehe zum letzten vollständigen 4er-Block zurück
    }

    this.displayedContacts = this.allContacts.slice(this.currentContactIndex, this.currentContactIndex + 4);
}

  
}
