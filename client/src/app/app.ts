import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LoadingService } from './shared/loading.service';

@Component({
  imports: [RouterOutlet, RouterLink],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('ניהול תלמידים');
  protected readonly loading = inject(LoadingService);
}
