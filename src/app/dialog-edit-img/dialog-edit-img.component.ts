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

  /**
   * Component constructor for editing a user's profile image.
   */
  constructor(public dialogRef: MatDialogRef<DialogEditImgComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private firestoreService: FirestoreService) {}

  /**
   * Initializes the component by fetching user details.
   * If a user ID is provided, it retrieves the user data from Firestore.
   */
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

  /**
   * Handles file selection from input.
   * Ensures that only image files are accepted.
   * @param {Event} event - The file input change event.
   */
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

  /**
   * Uploads the selected file to Firebase Storage and retrieves the download URL.
   * Updates the `profileImageUrl` after successful upload.
   */
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

  /**
   * Saves the uploaded image URL to Firestore under the user's profile.
   * Updates the local user object and closes the dialog with the updated user data.
   */
  saveImage(): void {
    this.loading = true;
    if (!this.userId || !this.profileImageUrl) {
      console.error('Benutzer-ID oder Bild-URL fehlt.');
      return;
    }
    this.firestoreService.updateUserImage(this.userId, this.profileImageUrl)
      .then(() => {
        this.user.image = this.profileImageUrl;
        this.dialogRef.close(this.user); 
        this.loading = false;
      })
      .catch((error) => {
        console.error('Fehler beim Speichern des Profilbildes:', error);
      });
  }
}