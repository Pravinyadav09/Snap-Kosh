namespace DigitalErp.Api.Models;

public class Invoice
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public string? CustomerName { get; set; } // Populated via joins
    public DateTime InvoiceDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal TaxRate { get; set; } = 18; // Default 18%
    public decimal TaxAmount { get; set; }
    public decimal GrandTotal { get; set; }
    public string PaymentStatus { get; set; } = "Unpaid";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Navigation Property (Optional for Dapper, but good for DTO mapping)
    public List<InvoiceItem> Items { get; set; } = new();
}

public class InvoiceItem
{
    public int Id { get; set; }
    public int InvoiceId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Rate { get; set; }
    public decimal Amount { get; set; }
}
