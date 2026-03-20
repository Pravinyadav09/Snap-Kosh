using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Services;

public class InvoiceService
{
    private readonly IInvoiceRepository _invoiceRepo;
    private readonly IJobCardRepository _jobRepo;
    private readonly ICustomerRepository _customerRepo;
    private readonly IEmailService _emailService;

    public InvoiceService(IInvoiceRepository invoiceRepo, IJobCardRepository jobRepo, ICustomerRepository customerRepo, IEmailService emailService)
    {
        _invoiceRepo = invoiceRepo;
        _jobRepo = jobRepo;
        _customerRepo = customerRepo;
        _emailService = emailService;
    }

    public async Task<PagedResult<Invoice>> GetInvoicesPaged(int page, int size, string? search)
    {
        return await _invoiceRepo.GetPagedAsync(page, size, search);
    }

    public async Task<Invoice?> GetInvoiceDetails(int id)
    {
        return await _invoiceRepo.GetByIdAsync(id);
    }

    public async Task<int> GenerateInvoice(Invoice invoice)
    {
        // 1. Logic to auto-generate Invoice Number if not provided
        if (string.IsNullOrEmpty(invoice.InvoiceNumber))
        {
            invoice.InvoiceNumber = $"INV-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";
        }

        // 2. Calculate Totals just in case they aren't provided correctly by the UI
        invoice.TotalAmount = invoice.Items.Sum(x => x.Amount);
        invoice.TaxAmount = invoice.TotalAmount * 0.18m; // Hardcoded 18% for example
        invoice.GrandTotal = invoice.TotalAmount + invoice.TaxAmount;

        var id = await _invoiceRepo.CreateAsync(invoice);

        // 3. Send Email Notification
        _ = Task.Run(async () => {
            try {
                var customer = await _customerRepo.GetByIdAsync(invoice.CustomerId);
                if (customer != null && !string.IsNullOrEmpty(customer.Email)) {
                    var subject = $"Invoice Generated: {invoice.InvoiceNumber}";
                    var body = $@"
                        <h3>Hello {customer.Name},</h3>
                        <p>An invoice has been generated for your recent order.</p>
                        <p><b>Invoice Number:</b> {invoice.InvoiceNumber}</p>
                        <p><b>Amount Due:</b> ₹{invoice.GrandTotal}</p>
                        <p>Thank you for your business!</p>
                        <br/>
                        <p>Digital ERP System</p>";
                    await _emailService.SendEmailAsync(customer.Email, subject, body);
                }
            } catch { /* Log error or ignore in fire-and-forget */ }
        });

        return id;
    }

    public async Task<int> CreateFromJobCard(int jobCardId)
    {
        var job = await _jobRepo.GetByIdAsync(jobCardId);
        if (job == null) throw new ArgumentException("Job Card not found.");

        var invoice = new Invoice
        {
            CustomerId = job.CustomerId,
            InvoiceDate = DateTime.UtcNow,
            PaymentStatus = "Unpaid",
            Items = new List<InvoiceItem>
            {
                new InvoiceItem 
                { 
                    Description = job.JobDescription,
                    Quantity = job.Quantity,
                    Rate = job.Rate,
                    Amount = job.Quantity * job.Rate
                }
            }
        };

        return await GenerateInvoice(invoice);
    }

    public async Task<bool> UpdatePaymentStatus(int id, string status)
    {
        return await _invoiceRepo.UpdateStatusAsync(id, status);
    }
}
