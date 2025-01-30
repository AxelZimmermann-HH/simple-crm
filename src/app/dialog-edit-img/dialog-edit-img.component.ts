import { Inject, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FirestoreService } from '../services/firestore.service';
import { User } from '../../models/user.class';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions, } from '@angular/material/dialog';
import {MatProgressBarModule} from '@angular/material/progress-bar';




@Component({
  selector: 'app-dialog-edit-img',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatDialogActions],
  templateUrl: './dialog-edit-img.component.html',
  styleUrl: './dialog-edit-img.component.scss'
})
export class DialogEditImgComponent {

  selectedFile: File | null = null;
  profileImageUrl: string = 'assets/profile-placeholder.jpg';
  user: User = new User;
  userId: string | null = null;
  isUploaded: boolean = false;
  loading = false;
  success = false;


  constructor(public dialogRef: MatDialogRef<DialogEditImgComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private firestoreService: FirestoreService) {}


  async ngOnInit(): Promise<void> {
    this.isUploaded = false;
    this.success = false;
    this.userId = this.data?.id || null;
    
  
    if (this.userId) {
      try {
        const userData = await this.firestoreService.fetchUserDetails(this.userId);
        if (userData) {
          this.user = { ...this.user, ...userData };
          this.profileImageUrl = this.user.image || 'assets/profile-placeholder.jpg';
        }
      } catch (error) {
        console.error('Fehler beim Laden des Benutzers:', error);
      }
    } else {
      console.error('Keine User-ID in den Dialogdaten gefunden');
    }
  }


  onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (file.type.startsWith('image/')) {
          this.selectedFile = file;
          this.success = true;
          console.log(this.success);
          
      } else {
        console.error('The selected file is not an image.');
      }
    }
  }


  uploadFile(): void {

    this.loading = true;
    if (!this.selectedFile) {
      console.error('No file selected.');
      return;
    }
  
    const storage = getStorage();
    const storageRef = ref(storage, `profile-images/${this.selectedFile.name}`);
  
    uploadBytes(storageRef, this.selectedFile)
      .then((snapshot) => {
        return getDownloadURL(snapshot.ref);
      })
      .then((url) => {
        this.isUploaded = true;
        this.profileImageUrl = url;
        this.loading = false;
      })
      .catch((error) => {
        console.error('Error uploading file:', error);
      });
  }


  saveImage(): void {
    this.loading = true;
    if (!this.userId || !this.profileImageUrl) {
      console.error('Benutzer-ID oder Bild-URL fehlt.');
      return;
    }
  
    this.firestoreService.updateUserImage(this.userId, this.profileImageUrl)
      .then(() => {
        this.user.image = this.profileImageUrl; // Lokalen User aktualisieren
        this.dialogRef.close(this.user); // Benutzer mit neuem Bild zurückgeben
        this.loading = false;
      })
      .catch((error) => {
        console.error('Fehler beim Speichern des Profilbildes:', error);
      });
  }

}
