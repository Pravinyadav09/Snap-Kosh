namespace DigitalErp.Api.Models;

public class Quotation
{
    public int Id { get; set; }
    public string QuotationNumber { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string PaperSize { get; set; } = string.Empty;
    public string PaperType { get; set; } = string.Empty;
    public string BookDetails { get; set; } = string.Empty;
    public decimal EstimatedCost { get; set; }
    public decimal QuotedPrice { get; set; }
    public decimal ProfitMargin { get; set; }
    public string Status { get; set; } = "Draft"; // Draft, Sent, Accepted, Rejected
    public DateTime ValidTill { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}
