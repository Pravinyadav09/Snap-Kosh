using System.ComponentModel.DataAnnotations;

namespace DigitalErp.Api.Models;

public class PaperStock
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Type { get; set; } = string.Empty; // Glossy, Matte, etc.
    
    public int Gsm { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Size { get; set; } = string.Empty; // 12x18, 13x19, etc.
    
    public decimal Width { get; set; }
    public decimal Height { get; set; }
    
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LowStockAlert { get; set; }
    
    public string CalcMode { get; set; } = "manual"; // manual, weight
    public decimal RimWeight { get; set; }
    public int SheetsPerPacket { get; set; }
    public decimal PricePerKg { get; set; }
    
    [MaxLength(50)]
    public string Color { get; set; } = "White";
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}

public class MediaStock
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Type { get; set; } = string.Empty; // Flex, Vinyl, Canvas, etc.
    
    public decimal RollWidth { get; set; } // Inches
    public decimal RollLength { get; set; } // Meters
    
    public decimal CostPerRoll { get; set; }
    public decimal CostPerSqFt { get; set; }
    
    public decimal QuantitySqFt { get; set; }
    public decimal LowStockAlert { get; set; }
    
    public string Status { get; set; } = "In Stock";
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}
