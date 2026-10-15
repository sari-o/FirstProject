using System.ComponentModel.DataAnnotations;
using StudentsApi.Models;

namespace StudentsApi.Dtos;

// ===== מה שהשרת מחזיר =====

public record PhoneDto(int Id, string Number, PhoneType Type);

public record StudentDto(
    int Id,
    string FirstName,
    string LastName,
    DateOnly BirthDate,
    List<PhoneDto> Phones);

// ===== מה שהשרת מקבל (POST / PUT) =====

public record PhoneSaveDto(
    int? Id, // null = טלפון חדש; ערך = עדכון טלפון קיים

    [Required(ErrorMessage = "מספר טלפון הוא שדה חובה")]
    [RegularExpression(@"^[0-9+\- ]{7,20}$", ErrorMessage = "מספר טלפון לא תקין")]
    string Number,

    PhoneType Type);

public record StudentSaveDto(
    [Required(ErrorMessage = "שם פרטי הוא שדה חובה")]
    [MaxLength(50, ErrorMessage = "שם פרטי יכול להכיל עד 50 תווים")]
    string FirstName,

    [Required(ErrorMessage = "שם משפחה הוא שדה חובה")]
    [MaxLength(50, ErrorMessage = "שם משפחה יכול להכיל עד 50 תווים")]
    string LastName,

    // Nullable כדי ש-[Required] יזהה ערך חסר (אחרת יתקבל 0001-01-01 בשקט)
    [Required(ErrorMessage = "תאריך לידה הוא שדה חובה")]
    DateOnly? BirthDate,

    List<PhoneSaveDto>? Phones);
