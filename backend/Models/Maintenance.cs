using System.ComponentModel.DataAnnotations;

namespace DigitalErp.Api.Models;

public class MachineMaintenance
{
    public int Id { get; set; }
    
    [Required]
    public int MachineId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty; // Electrical, Mechanical, Cleaning, etc.
    
    [Required]
    [MaxLength(50)]
    public string Priority { get; set; } = "Medium"; // Low, Medium, High, Urgent
    
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Completed"; // Scheduled, In-Progress, Completed
    
    [Required]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    public DateTime MaintenanceDate { get; set; } = DateTime.UtcNow;
    
    public decimal? Cost { get; set; }
    
    public string PerformedBy { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
