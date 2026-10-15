namespace StudentsApi.Models;

public class Student
{
    public int Id { get; set; }
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public DateOnly BirthDate { get; set; }

    // Navigation property: הטלפונים של התלמיד (צד ה"רבים" של הקשר)
    public List<StudentPhone> Phones { get; set; } = [];
}
