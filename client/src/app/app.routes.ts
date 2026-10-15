import { Routes } from '@angular/router';
import { StudentForm } from './students/student-form/student-form';
import { StudentList } from './students/student-list/student-list';

// טבלת ניתוב: כתובת -> קומפוננטה (בדומה ל-Frame.Navigate(new Page()))
export const routes: Routes = [
  { path: '', redirectTo: 'students', pathMatch: 'full' },
  { path: 'students', component: StudentList },
  { path: 'students/new', component: StudentForm },
  { path: 'students/:id/edit', component: StudentForm }, // :id מועבר ל-input בשם id
  { path: '**', redirectTo: 'students' }, // כל כתובת לא מוכרת
];
