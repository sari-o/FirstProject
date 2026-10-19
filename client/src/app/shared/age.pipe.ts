import { Pipe, PipeTransform } from '@angular/core';

// Pipe משלנו: {{ student.birthDate | age }} -> 12  (בדומה ל-IValueConverter)
@Pipe({ name: 'age' })
export class AgePipe implements PipeTransform {
  transform(birthDate: string | null | undefined): number | null {
    if (!birthDate) {
      return null;
    }

    const [year, month, day] = birthDate.split('-').map(Number); // "2012-03-14"
    const today = new Date();
    let age = today.getFullYear() - year;

    const birthdayNotYetThisYear =
      today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day);
    if (birthdayNotYetThisYear) {
      age--;
    }
    return age;
  }
}
