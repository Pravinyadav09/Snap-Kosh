using Microsoft.AspNetCore.Mvc;
using DigitalErp.Api.Models;
using DigitalErp.Api.Services;

namespace DigitalErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SchedulerController : ControllerBase
{
    private readonly SchedulerService _service;
    public SchedulerController(SchedulerService service) => _service = service;

    [HttpGet] 
    public async Task<IActionResult> Get([FromQuery] DateTime start, [FromQuery] DateTime end) 
        => Ok(await _service.GetSchedule(start, end));

    [HttpPost] 
    public async Task<IActionResult> Create([FromBody] ScheduleEntry entry) 
        => Ok(await _service.AddEntry(entry));

    [HttpPut("{id}")] 
    public async Task<IActionResult> Update(int id, [FromBody] ScheduleEntry entry) 
    { 
        entry.Id = id; 
        return await _service.UpdateEntry(entry) ? NoContent() : NotFound(); 
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id) 
        => await _service.DeleteEntry(id) ? NoContent() : NotFound();
}
