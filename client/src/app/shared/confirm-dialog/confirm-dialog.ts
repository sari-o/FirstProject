import { afterNextRender, Component, ElementRef, input, output, viewChild } from '@angular/core';

// חלון אישור כללי. משתמשים בו כך:
// <app-confirm-dialog message="..." (confirmed)="..." (cancelled)="..." />
@Component({
  selector: 'app-confirm-dialog',
  styleUrl: './confirm-dialog.css',
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  // input = ערכים שנכנסים מההורה (בדומה ל-Dependency Properties)
  readonly title = input('אישור');
  readonly message = input.required<string>();
  readonly confirmText = input('אישור');
  readonly busy = input(false);

  // output = אירועים שיוצאים להורה (בדומה ל-event / RoutedEvent)
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  // viewChild = הפניה לאלמנט בתבנית (בדומה ל-x:Name)
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    // אחרי שהאלמנט נוצר ב-DOM - פותחים אותו כחלון מודאלי (בדומה ל-ShowDialog)
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }

  protected onCancel(event: Event): void {
    event.preventDefault(); // Esc: לא לסגור לבד - ההורה מחליט
    if (!this.busy()) {
      this.cancelled.emit();
    }
  }
}
