using Microsoft.AspNetCore.Mvc;
using DigitalErp.Api.Models;
using DigitalErp.Api.Services;

namespace DigitalErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MachinesController : ControllerBase
{
    private readonly MachineService _service;
    public MachinesController(MachineService service) => _service = service;

    [HttpGet] public async Task<IActionResult> GetAll() => Ok(await _service.GetAll());
    
    [HttpGet("lookup")] 
    public async Task<IActionResult> GetLookup() => Ok(await _service.GetLookup());

    [HttpGet("{id}")] public async Task<IActionResult> Get(int id) { var m = await _service.GetById(id); return m == null ? NotFound() : Ok(m); }
    [HttpPost] public async Task<IActionResult> Create([FromBody] Machine machine) { var id = await _service.Add(machine); machine.Id = id; return CreatedAtAction(nameof(Get), new { id }, machine); }
    [HttpPut("{id}")] public async Task<IActionResult> Update(int id, [FromBody] Machine machine) { machine.Id = id; return await _service.Update(machine) ? NoContent() : NotFound(); }
}
