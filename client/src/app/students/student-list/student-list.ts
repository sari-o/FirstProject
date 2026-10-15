import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { phoneTypeLabels, Student } from '../student.model';
import { StudentService } from '../student.service';

@Component({
  imports: [DatePipe, RouterLink],
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
}
