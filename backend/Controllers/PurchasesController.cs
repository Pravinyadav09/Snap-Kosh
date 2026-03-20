using Microsoft.AspNetCore.Mvc;
using DigitalErp.Api.Models;
using DigitalErp.Api.Services;

namespace DigitalErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PurchasesController : ControllerBase
{
    private readonly PurchaseService _service;
    public PurchasesController(PurchaseService service) => _service = service;

    [HttpGet] public async Task<IActionResult> GetAll() => Ok(await _service.GetAll());
    [HttpGet("{id}")] public async Task<IActionResult> Get(int id) { var p = await _service.GetById(id); return p == null ? NotFound() : Ok(p); }
    [HttpPost] public async Task<IActionResult> Create([FromBody] Purchase p) { var id = await _service.Create(p); p.Id = id; return CreatedAtAction(nameof(Get), new { id }, p); }
    [HttpPatch("{id}/status")] public async Task<IActionResult> UpdateStatus(int id, [FromQuery] string status) => await _service.UpdateStatus(id, status) ? NoContent() : NotFound();
}
