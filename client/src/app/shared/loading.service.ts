import { computed, Service, signal } from '@angular/core';

// סופר כמה בקשות HTTP פעילות כרגע (מתעדכן ע"י loadingInterceptor)
@Service()
export class LoadingService {
  private readonly activeRequests = signal(0);

  readonly isLoading = computed(() => this.activeRequests() > 0);

  start(): void {
    this.activeRequests.update((n) => n + 1);
  }

  stop(): void {
    this.activeRequests.update((n) => Math.max(0, n - 1));
  }
}
