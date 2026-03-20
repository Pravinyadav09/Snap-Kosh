using Microsoft.AspNetCore.Mvc;
using DigitalErp.Api.Models;
using DigitalErp.Api.Services;

namespace DigitalErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OutsourceController : ControllerBase
{
    private readonly OutsourceService _service;
    public OutsourceController(OutsourceService service) => _service = service;

    [HttpGet("vendors")] public async Task<IActionResult> GetVendors() => Ok(await _service.GetAllVendors());
    
    [HttpGet("vendors/lookup")] 
    public async Task<IActionResult> GetVendorLookup() => Ok(await _service.GetVendorLookup());

    [HttpPost("vendors")] public async Task<IActionResult> AddVendor([FromBody] Vendor v) { var id = await _service.AddVendor(v); v.Id = id; return Ok(v); }
    [HttpGet("jobs")] public async Task<IActionResult> GetJobs() => Ok(await _service.GetAllJobs());
    [HttpPost("jobs")] public async Task<IActionResult> AddJob([FromBody] OutsourceJob j) { var id = await _service.AddJob(j); j.Id = id; return Ok(j); }
    [HttpPatch("jobs/{id}/status")] public async Task<IActionResult> UpdateJobStatus(int id, [FromQuery] string status) => await _service.UpdateJobStatus(id, status) ? NoContent() : NotFound();
}
