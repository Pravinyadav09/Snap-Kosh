namespace DigitalErp.Api.Models;

public class AuditLog
{
    public int Id { get; set; }
    public string EntityName { get; set; } = string.Empty; // e.g., Invoice, Customer
    public string EntityId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // Create, Update, Delete
    public string Changes { get; set; } = string.Empty; // JSON of changed fields
    public string PerformedBy { get; set; } = string.Empty; // User ID or Name
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
