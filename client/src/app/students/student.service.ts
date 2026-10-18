import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Student, StudentSave } from './student.model';

// @Service: נרשם אוטומטית ב-DI כ-singleton (מקביל ל-AddSingleton ב-.NET)
@Service()
export class StudentService {
  // inject: הזרקת תלות (מקביל להזרקה בבנאי ב-C#)
  private readonly http = inject(HttpClient);

  // כתובת יחסית - ה-proxy של ng serve מעביר אותה לשרת ב-5276
  private readonly baseUrl = '/api/students';

  // מחזיר Observable: הבקשה לא נשלחת עד שמישהו עושה subscribe
  getAll(): Observable<Student[]> {
    return this.http.get<Student[]>(this.baseUrl);
  }

  getById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.baseUrl}/${id}`);
  }

  create(student: StudentSave): Observable<Student> {
    return this.http.post<Student>(this.baseUrl, student);
  }

  update(id: number, student: StudentSave): Observable<Student> {
    return this.http.put<Student>(`${this.baseUrl}/${id}`, student);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
