namespace DigitalErp.Api.Models;

public class Vendor
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? GstNumber { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string Specialization { get; set; } = string.Empty; // Lamination, Binding, Printing
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}

public class OutsourceJob
{
    public int Id { get; set; }
    public int VendorId { get; set; }
    public int? JobCardId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Cost { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, In-Progress, Completed
    public DateTime DueDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}
