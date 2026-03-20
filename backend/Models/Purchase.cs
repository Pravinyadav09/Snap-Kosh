namespace DigitalErp.Api.Models;

public class Purchase
{
    public int Id { get; set; }
    public string PurchaseNumber { get; set; } = string.Empty;
    public int VendorId { get; set; }
    public int InventoryItemId { get; set; }
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public decimal TaxRate { get; set; } = 18; // Default 18%
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Received, Cancelled
    public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}
