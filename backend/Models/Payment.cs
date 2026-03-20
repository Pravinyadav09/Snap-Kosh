namespace DigitalErp.Api.Models;

public class Payment
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int? InvoiceId { get; set; } // Link to a specific invoice (Optional)
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    public string PaymentMethod { get; set; } = "Cash"; // Cash, UPI, Bank Transfer, Cheque
    public string? ReferenceNumber { get; set; } // Transaction ID or Cheque No
    public string? Remarks { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}
