namespace DigitalErp.Api.Models;

public class ExpenseCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "Indirect"; // Direct, Indirect
    public bool IsActive { get; set; } = true;
}

public class ProcessMaster
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Binding, Finishing, Lamination, Printing
    public string Description { get; set; } = string.Empty;
    public decimal DefaultRate { get; set; }
    public decimal SetupFee { get; set; }
    public decimal MinPrice { get; set; }
    public string Unit { get; set; } = string.Empty; // Per Sheet, Per Impression, Per Sq.Ft, Per Book
    public bool IsActive { get; set; } = true;
}

public class AppUser
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public int RoleId { get; set; }
    public string Department { get; set; } = string.Empty; // Management, Operations, Finance, etc.
    public string Status { get; set; } = "Active"; // Active, Inactive, Suspended
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}

public class Role
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // Owner, Manager, Operator
    public string? Permissions { get; set; } // JSON string of permissions
    public bool IsActive { get; set; } = true;
}

public class AppSetting
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
}
