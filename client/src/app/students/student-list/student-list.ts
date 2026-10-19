import { DatePipe, I18nPluralPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, debounce, distinctUntilChanged, map, of, switchMap, tap, timer } from 'rxjs';
import { AgePipe } from '../../shared/age.pipe';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { phoneTypeLabels, Student } from '../student.model';
import { StudentService } from '../student.service';

@Component({
  imports: [DatePipe, I18nPluralPipe, AgePipe, RouterLink, ConfirmDialog],
  selector: 'app-student-list',
  styleUrl: './student-list.css',
  templateUrl: './student-list.html',
})
export class StudentList {
  private readonly studentService = inject(StudentService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // ריבוי בעברית: {{ n | i18nPlural: studentCountText }}
  protected readonly studentCountText = {
    '=0': 'אין תלמידים',
    '=1': 'תלמיד אחד',
    '=2': 'שני תלמידים',
    other: '# תלמידים',
  };

  // State של הקומפוננטה - כל signal מעדכן את התצוגה כשהוא משתנה
  protected readonly students = signal<Student[]>([]);
  protected readonly loading = signal(true); // טעינה ראשונה - עדיין אין טבלה
  protected readonly searching = signal(false); // חיפוש - הטבלה הקודמת נשארת מוצגת
  protected readonly error = signal<string | null>(null);

  // מה שהמשתמש הקליד; ו-searchedText = מה שבאמת נשלח לשרת (אחרי debounce)
  // ערך התחלתי מה-URL (/students?q=כהן) - כך רענון הדף או קישור שומרים על החיפוש
  protected readonly searchText = signal(this.route.snapshot.queryParamMap.get('q') ?? '');
  protected readonly searchedText = signal('');

  // מחיקה: התלמיד שממתין לאישור (null = החלון סגור)
  protected readonly studentToDelete = signal<Student | null>(null);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  protected readonly phoneTypeLabels = phoneTypeLabels;

  constructor() {
    // צינור (pipeline) של RxJS: טקסט חיפוש -> בקשה לשרת -> רשימה
    toObservable(this.searchText) // signal -> Observable: פולט ערך בכל שינוי
      .pipe(
        map((text) => text.trim()),
        // ריק (טעינה ראשונה / ניקוי) - מיד; אחרת - מחכים 300ms של שקט בהקלדה
        debounce((text) => (text ? timer(300) : timer(0))),
        distinctUntilChanged(), // "כהן" -> "כהן " -> אותו חיפוש, לא שולחים שוב
        tap(() => this.searching.set(true)),
        // switchMap: בקשה חדשה מבטלת את הקודמת אם עוד לא חזרה
        switchMap((text) =>
          this.studentService.getAll(text).pipe(
            map((students) => ({ text, students })),
            // שגיאה בתוך switchMap - כדי שהצינור הראשי ימשיך לעבוד בחיפוש הבא
            catchError(() => of({ text, students: null })),
          ),
        ),
        takeUntilDestroyed(), // ביטול ה-subscribe כשהקומפוננטה נהרסת
      )
      .subscribe(({ text, students }) => {
        if (students) {
          this.students.set(students);
          this.searchedText.set(text);
          this.error.set(null);
          this.updateUrl(text);
        } else {
          this.error.set('לא ניתן לטעון את רשימת התלמידים. ודאו שהשרת פועל.');
        }
        this.loading.set(false);
        this.searching.set(false);
      });
  }

  protected clearSearch(): void {
    this.searchText.set('');
  }

  // מעדכן את ?q= בכתובת בלי להוסיף רשומה להיסטוריה (replaceUrl) - כפתור "אחורה" לא יעבור חיפוש-חיפוש
  private updateUrl(text: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: text || null }, // null = הסרת הפרמטר
      replaceUrl: true,
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
