import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from './loading.service';

// Interceptor: עוטף כל בקשת HttpClient באפליקציה (בדומה ל-DelegatingHandler ב-.NET)
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  loading.start();

  // finalize רץ בכל סוף: הצלחה, שגיאה, או ביטול (למשל switchMap בחיפוש)
  return next(req).pipe(finalize(() => loading.stop()));
};
