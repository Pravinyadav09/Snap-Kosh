using Microsoft.AspNetCore.Mvc;
using DigitalErp.Api.Models;
using DigitalErp.Api.Services;

namespace DigitalErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DailyReadingsController : ControllerBase
{
    private readonly DailyReadingService _service;

    public DailyReadingsController(DailyReadingService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _service.GetAllReadings());
    }

    [HttpGet("last/{machineName}")]
    public async Task<IActionResult> GetLastReading(string machineName)
    {
        var reading = await _service.GetLastReading(machineName);
        if (reading == null) return NotFound();
        return Ok(reading);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] DailyReading reading)
    {
        try
        {
            var id = await _service.LogReading(reading);
            reading.Id = id;
            return CreatedAtAction(nameof(GetAll), new { id = id }, reading);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }
}
