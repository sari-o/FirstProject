using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentsApi.Data;

namespace StudentsApi.Controllers;

[ApiController]
[Route("api/[controller]")] // [controller] = שם המחלקה בלי "Controller" -> api/students
public class StudentsController(AppDbContext db) : ControllerBase // DI מזריק את ה-DbContext בבנאי
{
    // GET api/students
    // זמני לשלב 2: projection לאובייקט אנונימי. בשלב 3 יוחלף ב-DTO מסודר.
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var students = await db.Students
            .OrderBy(s => s.LastName)
            .Select(s => new
            {
                s.Id,
                s.FirstName,
                s.LastName,
                s.BirthDate,
                Phones = s.Phones.Select(p => new { p.Number, Type = p.Type.ToString() })
            })
            .ToListAsync();

        return Ok(students);
    }
}
