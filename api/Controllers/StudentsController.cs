using Microsoft.AspNetCore.Mvc;

namespace StudentsApi.Controllers;

// זמני לשלב 1: נתונים קבועים בזיכרון. בשלב 2 יוחלף ב-EF Core.
public record StudentSample(int Id, string FirstName, string LastName, DateOnly BirthDate);

[ApiController]
[Route("api/[controller]")] // [controller] = שם המחלקה בלי "Controller" -> api/students
public class StudentsController : ControllerBase
{
    private static readonly List<StudentSample> Students =
    [
        new(1, "נועה", "כהן", new DateOnly(2012, 3, 14)),
        new(2, "איתי", "לוי", new DateOnly(2011, 11, 2)),
        new(3, "מאיה", "מזרחי", new DateOnly(2012, 7, 25)),
    ];

    // GET api/students
    [HttpGet]
    public IEnumerable<StudentSample> GetAll() => Students;

    // GET api/students/2
    [HttpGet("{id:int}")]
    public ActionResult<StudentSample> GetById(int id)
    {
        var student = Students.FirstOrDefault(s => s.Id == id);
        return student is null ? NotFound() : student;
    }
}
