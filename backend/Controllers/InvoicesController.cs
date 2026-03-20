using Microsoft.AspNetCore.Mvc;
using DigitalErp.Api.Models;
using DigitalErp.Api.Services;

namespace DigitalErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly InvoiceService _invoiceService;

    public InvoicesController(InvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int size = 10, [FromQuery] string? search = null)
    {
        return Ok(await _invoiceService.GetInvoicesPaged(page, size, search));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var invoice = await _invoiceService.GetInvoiceDetails(id);
        if (invoice == null) return NotFound();
        return Ok(invoice);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Invoice invoice)
    {
        var id = await _invoiceService.GenerateInvoice(invoice);
        invoice.Id = id;
        return CreatedAtAction(nameof(GetById), new { id = id }, invoice);
    }

    [HttpPost("from-job/{jobId}")]
    public async Task<IActionResult> CreateFromJob(int jobId)
    {
        var id = await _invoiceService.CreateFromJobCard(jobId);
        return Ok(new { InvoiceId = id });
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromQuery] string status)
    {
        var success = await _invoiceService.UpdatePaymentStatus(id, status);
        if (!success) return NotFound();
        return NoContent();
    }
}
