using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentsApi.Data;
using StudentsApi.Dtos;
using StudentsApi.Models;

namespace StudentsApi.Controllers;

[ApiController] // מפעיל ולידציה אוטומטית: מודל לא תקין -> 400 לפני שהקוד שלנו רץ
[Route("api/[controller]")] // [controller] = שם המחלקה בלי "Controller" -> api/students
public class StudentsController(AppDbContext db) : ControllerBase // DI מזריק את ה-DbContext בבנאי
{
    // GET api/students?search=כהן
    [HttpGet]
    public async Task<List<StudentDto>> GetAll(string? search)
    {
        var query = db.Students
            .AsNoTracking() // קריאה בלבד: EF לא צריך לעקוב אחרי שינויים
            .Include(s => s.Phones)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();
            query = query.Where(s =>
                s.FirstName.Contains(search) ||
                s.LastName.Contains(search) ||
                s.Phones.Any(p => p.Number.Contains(search)));
        }

        var students = await query
            .OrderBy(s => s.LastName)
            .ThenBy(s => s.FirstName)
            .ToListAsync();

        return students.Select(s => s.ToDto()).ToList();
    }

    // GET api/students/2
    [HttpGet("{id:int}")]
    public async Task<ActionResult<StudentDto>> GetById(int id)
    {
        var student = await db.Students
            .AsNoTracking()
            .Include(s => s.Phones)
            .FirstOrDefaultAsync(s => s.Id == id);

        return student is null ? NotFound() : student.ToDto();
    }

    // POST api/students
    [HttpPost]
    public async Task<ActionResult<StudentDto>> Create(StudentSaveDto dto)
    {
        var student = new Student
        {
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            BirthDate = dto.BirthDate!.Value,
            Phones = (dto.Phones ?? [])
                .Select(p => new StudentPhone { Number = p.Number.Trim(), Type = p.Type })
                .ToList()
        };

        db.Students.Add(student);
        await db.SaveChangesAsync(); // כאן נוצרים ה-Id-ים

        // 201 Created + כותרת Location עם הכתובת של התלמיד החדש
        return CreatedAtAction(nameof(GetById), new { id = student.Id }, student.ToDto());
    }

    // PUT api/students/2
    [HttpPut("{id:int}")]
    public async Task<ActionResult<StudentDto>> Update(int id, StudentSaveDto dto)
    {
        // בלי AsNoTracking: כאן אנחנו רוצים ש-EF יעקוב אחרי השינויים
        var student = await db.Students
            .Include(s => s.Phones)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (student is null)
            return NotFound();

        var phones = dto.Phones ?? [];

        // בדיקה: כל טלפון עם Id חייב להיות שייך לתלמיד הזה
        var existingIds = student.Phones.Select(p => p.Id).ToHashSet();
        if (phones.Any(p => p.Id is int pid && !existingIds.Contains(pid)))
        {
            ModelState.AddModelError(nameof(dto.Phones), "טלפון לא שייך לתלמיד זה");
            return ValidationProblem();
        }

        student.FirstName = dto.FirstName.Trim();
        student.LastName = dto.LastName.Trim();
        student.BirthDate = dto.BirthDate!.Value;

        // סנכרון אוסף הטלפונים:
        // 1. טלפונים שלא נשלחו - מוסרים מהאוסף (EF ימחק אותם מהטבלה)
        var sentIds = phones.Where(p => p.Id is not null).Select(p => p.Id!.Value).ToHashSet();
        student.Phones.RemoveAll(p => !sentIds.Contains(p.Id));

        foreach (var p in phones)
        {
            if (p.Id is null)
            {
                // 2. טלפון חדש
                student.Phones.Add(new StudentPhone { Number = p.Number.Trim(), Type = p.Type });
            }
            else
            {
                // 3. טלפון קיים - עדכון
                var existing = student.Phones.First(x => x.Id == p.Id);
                existing.Number = p.Number.Trim();
                existing.Type = p.Type;
            }
        }

        await db.SaveChangesAsync(); // EF מחשב לבד אילו INSERT/UPDATE/DELETE לבצע
        return student.ToDto();
    }

    // DELETE api/students/2
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        // מחיקה ישירה ב-SQL בלי לטעון את התלמיד; הטלפונים נמחקים ב-CASCADE של בסיס הנתונים
        var deleted = await db.Students.Where(s => s.Id == id).ExecuteDeleteAsync();
        return deleted == 0 ? NotFound() : NoContent();
    }
}
