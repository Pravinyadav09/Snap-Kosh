namespace DigitalErp.Api.Models;

public class Expense
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // e.g., Tea & Pantry, Machine Maintenance, Transport
    public decimal Amount { get; set; }
    public DateTime ExpenseDate { get; set; } = DateTime.UtcNow;
    public string PaymentMethod { get; set; } = "Cash"; // Cash, UPI, Bank
    public string? ReferenceNumber { get; set; }
    public bool IsGstBill { get; set; }
    public string? VendorId { get; set; } // Can be mapped to a Vendor table later, string for now
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}
