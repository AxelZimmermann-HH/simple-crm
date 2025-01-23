import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), 
    provideFirebaseApp(() => 
      initializeApp({"projectId":"simple-crm-2c97a",
      "appId":"1:211851256543:web:bae1199ce0bd2995a2ff6a",
      "storageBucket":"simple-crm-2c97a.firebasestorage.app",
      "apiKey":"AIzaSyAJb6baGEAGhS21qWHdZ7FFejAn2qby4v0",
      "authDomain":"simple-crm-2c97a.firebaseapp.com",
      "messagingSenderId":"211851256543",
      "databaseURL": "https://simple-crm-2c97a-default-rtdb.europe-west1.firebasedatabase.app"})), 
      provideAuth(() => getAuth()), 
      provideFirestore(() => getFirestore()), 
    
    
    provideAnimationsAsync()]
};
