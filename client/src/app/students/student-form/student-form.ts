import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Phone, PhoneType, phoneTypeLabels, phoneTypes, Student } from '../student.model';
import { StudentService } from '../student.service';

// טיפוס של שורת טלפון בטופס
type PhoneFormGroup = FormGroup<{
  id: FormControl<number | null>;
  number: FormControl<string>;
  type: FormControl<PhoneType>;
}>;

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-student-form',
  styleUrl: './student-form.css',
  templateUrl: './student-form.html',
})
export class StudentForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly studentService = inject(StudentService);
  private readonly router = inject(Router);

  // מגיע מה-URL (/students/:id/edit) בזכות withComponentInputBinding ב-app.config.ts
  // בדומה ל-Dependency Property שמקבל ערך מבחוץ
  readonly id = input<string>();

  protected readonly isEdit = computed(() => !!this.id());
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly generalError = signal<string | null>(null);

  protected readonly phoneTypes = phoneTypes;
  protected readonly phoneTypeLabels = phoneTypeLabels;

  // מבנה הטופס: כל שדה עם ערך התחלתי ורשימת ולידטורים
  protected readonly form = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    birthDate: ['', Validators.required],
    phones: this.fb.array<PhoneFormGroup>([]),
  });

  protected get phones() {
    return this.form.controls.phones;
  }

  ngOnInit(): void {
    const id = this.id();
    if (!id) {
      return; // מצב הוספה - טופס ריק
    }

    this.loading.set(true);
    this.studentService.getById(Number(id)).subscribe({
      next: (student) => {
        this.fillForm(student);
        this.loading.set(false);
      },
      error: () => {
        this.generalError.set('התלמיד לא נמצא');
        this.loading.set(false);
      },
    });
  }

  protected addPhone(): void {
    this.phones.push(this.createPhoneGroup());
  }

  protected removePhone(index: number): void {
    this.phones.removeAt(index);
  }

  protected save(): void {
    this.generalError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched(); // מציג את כל השגיאות
      return;
    }

    this.saving.set(true);
    const data = this.form.getRawValue(); // אובייקט רגיל במבנה של StudentSave
    const id = this.id();
    const request = id
      ? this.studentService.update(Number(id), data)
      : this.studentService.create(data);

    request.subscribe({
      next: () => this.router.navigate(['/students']),
      error: (err: HttpErrorResponse) => {
        this.applyServerErrors(err);
        this.saving.set(false);
      },
    });
  }

  // הודעת השגיאה הראשונה של שדה, או null (בדומה ל-Validation.Errors ב-WPF)
  protected errorFor(path: string): string | null {
    const control = this.form.get(path);
    if (!control?.errors || !control.touched) {
      return null;
    }

    const errors = control.errors;
    if (errors['server']) return errors['server'];
    if (errors['required']) return 'שדה חובה';
    if (errors['maxlength']) return `עד ${errors['maxlength'].requiredLength} תווים`;
    if (errors['pattern']) return 'מספר טלפון לא תקין';
    return 'ערך לא תקין';
  }

  private fillForm(student: Student): void {
    this.form.patchValue({
      firstName: student.firstName,
      lastName: student.lastName,
      birthDate: student.birthDate,
    });
    this.phones.clear();
    student.phones.forEach((p) => this.phones.push(this.createPhoneGroup(p)));
  }

  private createPhoneGroup(phone?: Phone): PhoneFormGroup {
    return this.fb.group({
      id: this.fb.control<number | null>(phone?.id ?? null),
      number: [phone?.number ?? '', [Validators.required, Validators.pattern(/^[0-9+\- ]{7,20}$/)]],
      type: this.fb.control<PhoneType>(phone?.type ?? 'Mobile'),
    });
  }

  // מיפוי שגיאות ProblemDetails מהשרת לשדות בטופס
  // "FirstName" -> "firstName", "Phones[0].Number" -> "phones.0.number"
  private applyServerErrors(err: HttpErrorResponse): void {
    const errors: Record<string, string[]> | undefined = err.error?.errors;
    if (err.status !== 400 || !errors) {
      this.generalError.set('השמירה נכשלה. נסו שוב מאוחר יותר.');
      return;
    }

    const unmapped: string[] = [];
    for (const [key, messages] of Object.entries(errors)) {
      const path = key
        .replace(/\[(\d+)\]/g, '.$1')
        .split('.')
        .map((part) => part.charAt(0).toLowerCase() + part.slice(1))
        .join('.');

      const control = this.form.get(path);
      if (control && control !== this.phones) {
        control.setErrors({ server: messages[0] });
        control.markAsTouched();
      } else {
        unmapped.push(...messages);
      }
    }

    if (unmapped.length) {
      this.generalError.set(unmapped.join(' '));
    }
  }
}
