import { Routes } from '@angular/router';
import { StudentList } from './students/student-list/student-list';

// טבלת ניתוב: כתובת -> קומפוננטה (בדומה ל-Frame.Navigate(new Page()))
export const routes: Routes = [
  { path: '', redirectTo: 'students', pathMatch: 'full' },
  { path: 'students', component: StudentList },
];
