namespace DigitalErp.Api.Models;

public class Machine
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Digital, Offset, Flex, Wide-Format
    public string Status { get; set; } = "Active"; // Active, Maintenance, Inactive
    public int CurrentMeterReading { get; set; }
    public DateTime LastServiceDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}
