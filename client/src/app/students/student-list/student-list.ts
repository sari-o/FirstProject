import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { phoneTypeLabels, Student } from '../student.model';
import { StudentService } from '../student.service';

@Component({
  imports: [DatePipe, RouterLink, ConfirmDialog],
  selector: 'app-student-list',
  styleUrl: './student-list.css',
  templateUrl: './student-list.html',
})
export class StudentList implements OnInit {
  private readonly studentService = inject(StudentService);

  // State של הקומפוננטה - כל signal מעדכן את התצוגה כשהוא משתנה
  protected readonly students = signal<Student[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  // מחיקה: התלמיד שממתין לאישור (null = החלון סגור)
  protected readonly studentToDelete = signal<Student | null>(null);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  protected readonly phoneTypeLabels = phoneTypeLabels;

  // נקרא פעם אחת אחרי יצירת הקומפוננטה (בדומה ל-Loaded ב-WPF)
  ngOnInit(): void {
    this.studentService.getAll().subscribe({
      next: (students) => {
        this.students.set(students);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('לא ניתן לטעון את רשימת התלמידים. ודאו שהשרת פועל.');
        this.loading.set(false);
      },
    });
  }

  protected askDelete(student: Student): void {
    this.deleteError.set(null);
    this.studentToDelete.set(student); // פותח את חלון האישור
  }

  protected cancelDelete(): void {
    this.studentToDelete.set(null);
  }

  protected confirmDelete(): void {
    const student = this.studentToDelete();
    if (!student) {
      return;
    }

    this.deleting.set(true);
    this.studentService.delete(student.id).subscribe({
      next: () => this.removeFromList(student.id),
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          // מישהו אחר כבר מחק - התוצאה זהה מבחינת המשתמש
          this.removeFromList(student.id);
        } else {
          this.deleteError.set(`מחיקת ${student.firstName} ${student.lastName} נכשלה. נסו שוב.`);
          this.deleting.set(false);
          this.studentToDelete.set(null);
        }
      },
    });
  }

  // עדכון הרשימה בזיכרון, בלי לטעון שוב מהשרת (בדומה ל-ObservableCollection.Remove)
  private removeFromList(id: number): void {
    this.students.update((list) => list.filter((s) => s.id !== id));
    this.deleting.set(false);
    this.studentToDelete.set(null);
  }
}
