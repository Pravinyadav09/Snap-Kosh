namespace DigitalErp.Api.Models;

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? GstNumber { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal NetBalance { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; } = true;
}
