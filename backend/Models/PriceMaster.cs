using System.ComponentModel.DataAnnotations;

namespace DigitalErp.Api.Models;

public class PriceMaster
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty; // Paper, Printing, Finishing, CTP
    
    [Required]
    [MaxLength(200)]
    public string ItemName { get; set; } = string.Empty; // e.g. "Glossy 300 GSM", "A3 Digital Color"
    
    public decimal Rate { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Unit { get; set; } = "Sheet"; // Sheet, SqFt, Job, Side
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class EstimationRecord
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string JobDescription { get; set; } = string.Empty;
    public decimal EstimatedCost { get; set; }
    public decimal QuotedPrice { get; set; }
    public string SpecsJson { get; set; } = string.Empty; // Store all calc details as JSON
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
