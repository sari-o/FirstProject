using Microsoft.EntityFrameworkCore;
using StudentsApi.Models;

namespace StudentsApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    // כל DbSet הופך לטבלה
    public DbSet<Student> Students => Set<Student>();
    public DbSet<StudentPhone> StudentPhones => Set<StudentPhone>();

    // Fluent API: הגדרות מבנה הטבלאות במקום אחד
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Student>(e =>
        {
            e.Property(s => s.FirstName).HasMaxLength(50).IsRequired();
            e.Property(s => s.LastName).HasMaxLength(50).IsRequired();

            e.HasMany(s => s.Phones)
             .WithOne(p => p.Student)
             .HasForeignKey(p => p.StudentId)
             .OnDelete(DeleteBehavior.Cascade); // מחיקת תלמיד מוחקת את הטלפונים שלו

            e.HasData(
                new Student { Id = 1, FirstName = "נועה", LastName = "כהן", BirthDate = new DateOnly(2012, 3, 14) },
                new Student { Id = 2, FirstName = "איתי", LastName = "לוי", BirthDate = new DateOnly(2011, 11, 2) },
                new Student { Id = 3, FirstName = "מאיה", LastName = "מזרחי", BirthDate = new DateOnly(2012, 7, 25) });
        });

        modelBuilder.Entity<StudentPhone>(e =>
        {
            e.Property(p => p.Number).HasMaxLength(20).IsRequired();
            e.Property(p => p.Type).HasConversion<string>().HasMaxLength(10); // נשמר כ-"Mobile" ולא כ-0

            e.HasData(
                new StudentPhone { Id = 1, StudentId = 1, Number = "050-1234567", Type = PhoneType.Mother },
                new StudentPhone { Id = 2, StudentId = 1, Number = "03-6123456", Type = PhoneType.Home },
                new StudentPhone { Id = 3, StudentId = 2, Number = "052-7654321", Type = PhoneType.Father },
                new StudentPhone { Id = 4, StudentId = 3, Number = "054-1112233", Type = PhoneType.Mobile });
        });
    }
}
