namespace DigitalErp.Api.DTOs;

public class CustomerLedgerDto
{
    public DateTime Date { get; set; }
    public string Type { get; set; } = string.Empty; // Invoice or Payment
    public string Reference { get; set; } = string.Empty;
    public decimal Debit { get; set; }
    public decimal Credit { get; set; }
    public decimal RunningBalance { get; set; }
}

public class GstReportDto
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string GstNumber { get; set; } = string.Empty;
    public decimal TaxableAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
}

public class GstSummaryDto
{
    public decimal OutputTax { get; set; } // From Sales/Invoices
    public decimal ITC { get; set; } // Input Tax Credit from Purchases
    public decimal NetPayable => Math.Max(0, OutputTax - ITC);
    public decimal CarryForward => Math.Max(0, ITC - OutputTax);
    
    public List<GstReportDto> SalesDetails { get; set; } = new();
    public List<GstReportDto> PurchaseDetails { get; set; } = new();
}
