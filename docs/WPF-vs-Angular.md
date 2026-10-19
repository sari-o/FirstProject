# מ-WPF ל-Web: מילון מושגים

מסמך עזר שמסכם את ההשוואות ל-WPF שעלו בבניית הפרויקט (ניהול תלמידים: ASP.NET Core + Angular 22).
העמודה "שלב" מפנה ל-commit המתאים בהיסטוריה (`git log --oneline`).

---

## טבלת סיכום

### צד לקוח (Angular)

| WPF | Angular | שלב |
|---|---|---|
| UserControl (XAML + code-behind) | Component (`.html` + `.ts` + `.css`) | 4 |
| `App.xaml.cs` / רישום DI | `app.config.ts` / `providers` | 4, 5 |
| `Application.Resources` | `styles.css` (גלובלי) | 4 |
| `UserControl.Resources` | `component.css` (מקומי לקומפוננטה) | 4 |
| `StaticResource` | משתנה CSS: `var(--color-primary)` | 4 |
| `FlowDirection="RightToLeft"` | `<html dir="rtl">` | 4 |
| XAML Hot Reload | `ng serve` (hot reload לכל הקוד) | 4 |
| ViewModel (state של המסך) | הקומפוננטה עם signals | 5 |
| Service / Repository | `@Service()` + `inject()` | 5 |
| `INotifyPropertyChanged` | `signal()` / `computed()` | 5, 6 |
| `{Binding Name}` | `{{ name() }}` | 4, 5 |
| `Prop="{Binding X}"` | `[prop]="x()"` | 5 |
| `Click="OnClick"` | `(click)="onClick()"` | 6 |
| `ItemsControl` + `DataTemplate` | `@for (...; track ...)` | 5 |
| `DataTrigger` על רשימה ריקה | `@empty { }` | 5 |
| `Visibility` + `BooleanToVisibilityConverter` | `@if` (גם יוצר והורס את התוכן) | 5, 7 |
| `IValueConverter` | Pipe: `{{ value \| date }}` | 5, 9 |
| `Task<T>` | `Observable<T>` | 5 |
| `Loaded` | `ngOnInit` / `afterNextRender` | 5, 7 |
| `Frame` / `NavigationService` | Router + `<router-outlet />` | 5, 6 |
| `Hyperlink NavigateUri` | `routerLink` | 6 |
| TwoWay binding | Reactive Forms (`FormGroup`, `FormControl`) | 6 |
| `ValidationRule` / `INotifyDataErrorInfo` | `Validators.required`, `Validators.pattern` | 6 |
| `ErrorTemplate` | מחלקות CSS `ng-invalid` + `ng-touched` | 6 |
| `ObservableCollection` בטופס עריכה | `FormArray` | 6 |
| Dependency Property | `input()` | 6, 7 |
| `event` / RoutedEvent | `output()` + `emit()` | 7 |
| `x:Name` | `#ref` בתבנית / `viewChild()` | 7, 8 |
| `Window.ShowDialog()` | `<dialog>` + `showModal()` | 7 |
| `ObservableCollection.Remove` | `signal.update(list => list.filter(...))` | 7 |
| `UpdateSourceTrigger=PropertyChanged` | `(input)="..."` | 8 |
| `Binding Delay` / `DispatcherTimer` | `debounceTime` | 8 |
| `CancellationTokenSource` | `switchMap` | 8 |
| `event -=` (מניעת דליפת זיכרון) | `takeUntilDestroyed()` | 8 |
| `CultureInfo("he-IL")` | `LOCALE_ID` + `registerLocaleData` | 9 |

### צד שרת (ASP.NET Core)

| WPF / Desktop | ASP.NET Core | שלב |
|---|---|---|
| `App.xaml.cs` (`OnStartup`) | `Program.cs` | 1 |
| `Dispatcher` (מקבל אירועים מבחוץ) | Kestrel (מקבל בקשות HTTP) | 1 |
| Routed Events (מעבר דרך עץ האלמנטים) | Middleware pipeline | 1 |
| `ICommand.Execute` | Controller Action | 1 |
| `CommandParameter` | Model binding (`{id}` מה-URL) | 1 |
| `App.config` | `appsettings.json` | 2 |
| DbContext ארוך-חיים | DbContext Scoped (אחד לכל בקשה) | 2 |
| `IDataErrorInfo` / `INotifyDataErrorInfo` | Data Annotations + `[ApiController]` | 3 |
| `ObservableCollection` שמודיעה על שינויים | EF Change Tracking | 3 |
| `HttpClient` + `DelegatingHandler` | HTTP Interceptor (בצד הלקוח) | 9 |

---

## הסברים לפי נושא

### 1. אפליקציית שרת מול אפליקציית שולחן עבודה (שלב 1)
אפליקציית WPF מציגה חלון ומחכה לאירועים מהמשתמש.
Web API מאזין על פורט ומחכה לבקשות HTTP. אין לו ממשק משתמש: הוא מחזיר JSON.

**הבדל מהותי:** נוצר מופע **חדש** של ה-Controller לכל בקשה. לכן אסור לשמור state בשדות שלו.

### 2. `Program.cs` (שלב 1)
```csharp
builder.Services.AddControllers();     // חלק 1: רישום שירותים (DI)
var app = builder.Build();
app.UseHttpsRedirection();             // חלק 2: middleware pipeline, לפי הסדר
app.MapControllers();
```
כל בקשה עוברת דרך רכיבי ה-middleware לפי הסדר, בדומה ל-Routed Event שעובר בעץ האלמנטים.
**הסדר בקוד הוא הסדר בפועל.**

### 3. DI Lifetimes (שלב 2)
| Lifetime | ב-ASP.NET | המקביל ב-WPF |
|---|---|---|
| Singleton | מופע אחד לכל האפליקציה | שירות גלובלי |
| Scoped | מופע אחד לכל בקשת HTTP | הכי קרוב: מופע לכל חלון |
| Transient | מופע חדש בכל הזרקה | `new` בכל פעם |

### 4. DTO מול Entity (שלב 3)
ב-WPF הרבה פעמים עושים binding ישירות לישות של EF. ב-API זה בעייתי:
- **מעגלים:** `Student → Phones → Student → ...` תוקע את ה-JSON serializer.
- **Over-posting:** הלקוח יכול לשלוח שדות שלא אמורים להשתנות.
- **חוזה יציב:** אפשר לשנות טבלאות בלי לשבור את הלקוח.

### 5. Change Tracking (שלב 3)
```csharp
student.Phones.RemoveAll(...);      // הסרה
student.Phones.Add(new ...);        // הוספה
existing.Number = "...";            // שינוי
await db.SaveChangesAsync();        // ← EF מחשב לבד DELETE / INSERT / UPDATE
```
EF זוכר איך נראו האובייקטים כשנטענו, ומשווה בזמן השמירה.
זה דומה ל-`ObservableCollection` שמודיעה על שינויים, רק שה"מאזין" הוא EF והוא מתרגם את השינויים ל-SQL.

### 6. async בשרת (שלב 3)
- **ב-WPF:** לא לחסום את ה-UI thread.
- **בשרת:** לא לחסום thread מה-thread pool. כך מעט threads מטפלים באלפי בקשות.

### 7. קומפוננטה מול UserControl (שלב 4)
```
student-list.ts    ← code-behind (מחלקה עם @Component)
student-list.html  ← ה-XAML (התבנית)
student-list.css   ← Resources מקומיים (לא "דולפים" לקומפוננטות אחרות)
```
**ההבדל:** בתבנית אין גישה ל-`x:Name` מהקוד כמו ב-code-behind.
המחלקה מחזיקה **state** והתבנית מציגה אותו דרך binding. בפועל, הקומפוננטה היא View ו-ViewModel ביחד.

### 8. שירות מול ViewModel (שלב 5)
| WPF | Angular |
|---|---|
| ViewModel: state של המסך | **הקומפוננטה**: `students`, `loading`, `error` |
| ViewModel / Repository: גישה לנתונים | **השירות**: `StudentService` |

```typescript
@Service()                                      // AddSingleton<StudentService>()
export class StudentService {
  private readonly http = inject(HttpClient);   // הזרקה, במקום פרמטר בבנאי
}
```

### 9. Signals מול `INotifyPropertyChanged` (שלב 5)
```typescript
protected readonly students = signal<Student[]>([]);   // הגדרה
this.students.set(list);                                // עדכון, במקום OnPropertyChanged()
protected readonly isEdit = computed(() => !!this.id()); // property תלוי, מתעדכן לבד
```
```html
{{ students().length }}    <!-- קריאה: עם () -->
```

### 10. Observable מול Task (שלבים 5, 8)
| `Task<T>` | `Observable<T>` |
|---|---|
| מתחיל לרוץ מיד | לא קורה כלום עד `subscribe` |
| ערך אחד | 0, 1 או הרבה ערכים לאורך זמן |
| `await` | `.subscribe({ next, error })` |
| ביטול עם `CancellationToken` | `unsubscribe()` |

RxJS הוא הגרסה ל-JavaScript של Rx.NET (`IObservable<T>`), כלומר "LINQ על אירועים".

| RxJS | LINQ / Rx.NET |
|---|---|
| `map` | `Select` |
| `filter` | `Where` |
| `debounceTime` | `Throttle` (Rx.NET) |
| `switchMap` | אין מקבילה פשוטה: עבור לזרם חדש ובטל את הקודם |

**Signals ל-state** (מה הערך עכשיו). **RxJS לתזמון אירועים** (debounce, ביטול, שילוב מקורות).

### 11. Binding בתבנית (שלבים 5, 6, 8)
| Angular | WPF | כיוון |
|---|---|---|
| `{{ value }}` | `Text="{Binding Value}"` | קוד ← תצוגה |
| `[disabled]="saving()"` | `IsEnabled="{Binding ...}"` | קוד ← תצוגה |
| `(click)="save()"` | `Click="Save"` / `Command` | תצוגה ← קוד |
| `formControlName="firstName"` | `Mode=TwoWay` | דו-כיווני |

### 12. Router מול Frame (שלבים 5, 6)
| WPF | Angular |
|---|---|
| `NavigationService.Navigate(new EditPage(id))` | `router.navigate(['/students', id, 'edit'])` |
| `Hyperlink NavigateUri` | `<a routerLink="/students/new">` |
| `Frame` | `<router-outlet />` |
| פרמטר בבנאי של ה-Page | `:id` בכתובת → `input()` |

**ההבדל הגדול:** ב-web הכתובת היא state. אפשר לרענן, לשמור סימנייה ולשלוח קישור.

### 13. ולידציה (שלבים 3, 6)
| WPF | Angular |
|---|---|
| `ValidationRule` / `INotifyDataErrorInfo` | `Validators.required` |
| `Validation.HasError` | `control.invalid` |
| `Validation.Errors[0].ErrorContent` | `control.errors['required']` |
| `ErrorTemplate` | מחלקות CSS `ng-invalid` + `ng-touched` |

**ולידציה בשני הצדדים:** בלקוח למשוב מיידי, ובשרת כי אסור לסמוך על הלקוח.
לדוגמה, `Validators.required` של Angular מקבל שם שכולו רווחים, אבל `[Required]` של .NET דוחה אותו.

### 14. `input()` / `output()` (שלבים 6, 7)
```typescript
readonly message = input.required<string>();   // Dependency Property (חובה)
readonly busy = input(false);                  // עם ערך ברירת מחדל
readonly confirmed = output<void>();           // event
this.confirmed.emit();                         // הפעלת האירוע
```
```html
<app-confirm-dialog [message]="..." (confirmed)="delete()" />
```
**הכלל:** נתונים זורמים **למטה** (inputs), אירועים עולים **למעלה** (outputs).
הילד לא מכיר את ההורה, ולכן אפשר להשתמש בו בכל מקום.

### 15. `@if` מול `Visibility` (שלב 7)
`Visibility="Collapsed"` רק מסתיר, והאובייקט ממשיך לחיות.
`@if` **יוצר והורס** את הקומפוננטה: כשהתנאי שקרי, היא לא קיימת ב-DOM בכלל.

### 16. עדכון immutable (שלב 7)
```typescript
this.students.update((list) => list.filter((s) => s.id !== id));   // מערך חדש
```
signal משווה הפניות. שינוי של אותו מערך במקום (`splice`) לא יזוהה, והמסך לא יתעדכן.
ההבדל מ-`ObservableCollection.Remove`, שמשנה במקום ומודיעה.

### 17. החיפוש: צינור RxJS (שלב 8)
```typescript
toObservable(this.searchText).pipe(
  map((text) => text.trim()),
  debounceTime(300),             // Binding Delay
  distinctUntilChanged(),        // דילוג על חיפוש זהה
  switchMap((text) => this.service.getAll(text).pipe(
    catchError(() => of(null)),  // try/catch בתוך הלולאה, לא סביבה
  )),
  takeUntilDestroyed(),          // event -=
).subscribe(...);
```
| אופרטור | ערך חדש מגיע בזמן שבקשה רצה |
|---|---|
| `switchMap` | מבטל את הקודמת (חיפוש) |
| `mergeMap` | מריץ במקביל |
| `concatMap` | ממתין שהקודמת תסתיים |
| `exhaustMap` | מתעלם מהחדש (כפתור שמירה, נגד לחיצה כפולה) |

### 18. Change Detection: OnPush + zoneless (שלב 6)
ב-Angular 22 קומפוננטה מתרעננת רק אם:
1. היה אירוע **בתבנית שלה**, או
2. **signal** שהתבנית קוראת השתנה, או
3. `input()` שלה קיבל ערך חדש.

שינוי בשדה רגיל של המחלקה בתוך `subscribe` **לא יופיע על המסך**. לכן state שמשתנה אחרי קריאה לשרת מוחזק ב-signals.
זה דומה ל-WPF, שמרענן רק את מה שקיבל `PropertyChanged`.

### 19. Interceptor מול `DelegatingHandler` (שלב 9)
```typescript
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  loading.start();
  return next(req).pipe(finalize(() => loading.stop()));   // next(req) = base.SendAsync(request)
};
```
שכבה שעוטפת **כל** בקשת HTTP. שימושים: טוקן התחברות, חיווי טעינה, ניסיון חוזר, טיפול ב-401.

### 20. Proxy ו-CORS (שלב 5)
הדפדפן חוסם פנייה לכתובת אחרת מזו שממנה נטען הדף (Same-Origin Policy).
ל-WPF אין מגבלה כזו, כי `HttpClient` פונה לכל כתובת.
```
דפדפן → localhost:4200/api/students → [ng serve proxy] → localhost:5276/api/students
```

---

## TypeScript מול C#

| TypeScript | C# |
|---|---|
| `const x = 5` | `const` / `readonly` מקומי |
| `let name: string` | `string name` |
| `name?: string` / `string \| null` | `string?` |
| `interface Student { ... }` | `record` / `class` (בלי קוד בזמן ריצה) |
| `type PhoneType = 'Mobile' \| 'Home'` | `enum PhoneType` |
| `Record<PhoneType, string>` | `Dictionary<PhoneType, string>` |
| `import { X } from './file'` | `using` (אבל מקובץ, לא מ-namespace) |
| `export class` | `public class` |
| `@Component(...)` | Attribute: `[Something]` |
| `(x) => x * 2` | `x => x * 2` |
| `` `שלום ${name}` `` | `$"שלום {name}"` |
| `list.filter(...).map(...)` | `list.Where(...).Select(...)` |

**חשוב:** הטיפוסים קיימים רק בזמן קומפילציה. בדפדפן רץ JavaScript רגיל.
