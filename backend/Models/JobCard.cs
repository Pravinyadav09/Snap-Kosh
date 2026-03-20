namespace DigitalErp.Api.Models;

public class JobCard
{
    public int Id { get; set; }
    public string JobNumber { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public string JobDescription { get; set; } = string.Empty;
    public string MachineType { get; set; } = string.Empty; // Offset, Digital, Flex
    public int Quantity { get; set; }
    public int DispatchedQuantity { get; set; } = 0;
    public string DeliveryMode { get; set; } = string.Empty; // Staff, Courier, Self, Direct
    public string TrackingRef { get; set; } = string.Empty;
    public string JobStatus { get; set; } = "Pending"; // Pending, Pre-Press, Printing, Binding, Completed, Delivered
    public int? InventoryItemId { get; set; }
    public decimal? InventoryQuantity { get; set; }
    public decimal Rate { get; set; } 
    public string PaperSize { get; set; } = string.Empty; // A4, 12x18, etc.
    public string PaperType { get; set; } = string.Empty; // White Media, Glossy, etc.
    public string BookDetails { get; set; } = string.Empty; // Pages, Binding, etc.
    public string? DesignFilePath { get; set; } // Path to uploaded CDR/PDF/JPG
    public DateTime DueDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public bool IsActive { get; set; } = true;
}
