namespace DigitalErp.Api.Models;

public class InventoryItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // Paper, Media, Ink, etc.
    public string Unit { get; set; } = string.Empty; // Sheets, Rolls, Liters
    public decimal CurrentStock { get; set; }
    public decimal MinStockLevel { get; set; }
    public decimal LastPurchasePrice { get; set; }
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}

public class StockTransaction
{
    public int Id { get; set; }
    public int InventoryItemId { get; set; }
    public decimal Quantity { get; set; }
    public string Type { get; set; } = string.Empty; // Inward, Outward (Usage), Adjustment
    public string ReferenceType { get; set; } = string.Empty; // PurchaseOrder, JobCard, Manual
    public int? ReferenceId { get; set; }
    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
    public string Remarks { get; set; } = string.Empty;
}
