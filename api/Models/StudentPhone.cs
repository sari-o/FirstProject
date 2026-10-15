namespace StudentsApi.Models;

public enum PhoneType
{
    Mobile,
    Home,
    Mother,
    Father
}

public class StudentPhone
{
    public int Id { get; set; }
    public string Number { get; set; } = "";
    public PhoneType Type { get; set; }

    // Foreign key + navigation חזרה לתלמיד
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;
}
