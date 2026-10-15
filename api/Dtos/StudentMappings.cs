using StudentsApi.Models;

namespace StudentsApi.Dtos;

// Extension methods להמרה מ-Entity ל-DTO
public static class StudentMappings
{
    public static StudentDto ToDto(this Student s) => new(
        s.Id,
        s.FirstName,
        s.LastName,
        s.BirthDate,
        s.Phones.Select(p => new PhoneDto(p.Id, p.Number, p.Type)).ToList());
}
