import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import localeHe from '@angular/common/locales/he';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { loadingInterceptor } from './shared/loading.interceptor';

// נתוני אזור עבריים: שמות חודשים וימים, כללי ריבוי וכו' (בדומה ל-CultureInfo("he-IL"))
registerLocaleData(localeHe);

// רישום שירותים גלובליים ב-DI (מקביל ל-ConfigureServices / App.xaml.cs)
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // withComponentInputBinding: פרמטרים מה-URL מגיעים לקומפוננטה כ-input()
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([loadingInterceptor])),
    { provide: LOCALE_ID, useValue: 'he' }, // ברירת מחדל ל-DatePipe ושאר ה-pipes
  ],
};
