using Microsoft.AspNetCore.Mvc;
using DigitalErp.Api.Services;

namespace DigitalErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly ReportService _service;
    public ReportsController(ReportService service) => _service = service;

    [HttpGet("ledger/{customerId}")]
    public async Task<IActionResult> GetLedger(int customerId) => Ok(await _service.GetCustomerLedger(customerId));

    [HttpGet("gst")]
    public async Task<IActionResult> GetGst([FromQuery] DateTime start, [FromQuery] DateTime end) 
        => Ok(await _service.GetGstReport(start, end));

    [HttpGet("gst-summary")]
    public async Task<IActionResult> GetGstSummary([FromQuery] DateTime start, [FromQuery] DateTime end) 
        => Ok(await _service.GetGstSummary(start, end));
}
