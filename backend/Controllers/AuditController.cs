using Microsoft.AspNetCore.Mvc;
using DigitalErp.Api.Models;
using DigitalErp.Api.Services;

namespace DigitalErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuditController : ControllerBase
{
    private readonly AuditService _service;
    public AuditController(AuditService service) => _service = service;

    [HttpGet("recent")]
    public async Task<IActionResult> GetRecent([FromQuery] int count = 50) 
        => Ok(await _service.GetRecent(count));

    [HttpPost("log")]
    public async Task<IActionResult> Log([FromBody] AuditLog log)
    {
        var id = await _service.Log(log);
        log.Id = id;
        return Ok(log);
    }
}
