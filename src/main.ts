import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { importProvidersFrom } from '@angular/core';


bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers || [], // Falls bereits andere Provider definiert sind
    importProvidersFrom(MatNativeDateModule), // MatNativeDateModule hinzufügen
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
  ],
})
  .catch((err) => console.error(err));
