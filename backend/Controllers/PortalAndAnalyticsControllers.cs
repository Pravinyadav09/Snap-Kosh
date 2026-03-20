using Microsoft.AspNetCore.Mvc;
using DigitalErp.Api.Models;
using DigitalErp.Api.Services;

namespace DigitalErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly PaymentService _service;
    public PaymentsController(PaymentService service) => _service = service;

    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetByCustomer(int customerId) => Ok(await _service.GetCustomerPayments(customerId));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Payment payment) 
    {
        var id = await _service.RecordPayment(payment);
        payment.Id = id;
        return CreatedAtAction(nameof(GetByCustomer), new { customerId = payment.CustomerId }, payment);
    }
}

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly AnalyticsService _service;
    public AnalyticsController(AnalyticsService service) => _service = service;

    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomerAnalysis() => Ok(await _service.GetCustomerAnalysis());

    [HttpGet("revenue-trend")]
    public async Task<IActionResult> GetTrend() => Ok(await _service.GetRevenueTrend());
}

[ApiController]
[Route("api/[controller]")]
public class PortalController : ControllerBase
{
    private readonly PortalService _service;
    public PortalController(PortalService service) => _service = service;

    [HttpGet("my-jobs/{customerId}")]
    public async Task<IActionResult> GetMyJobs(int customerId) => Ok(await _service.GetMyJobs(customerId));

    [HttpGet("my-invoices/{customerId}")]
    public async Task<IActionResult> GetMyInvoices(int customerId) => Ok(await _service.GetMyInvoices(customerId));
}
