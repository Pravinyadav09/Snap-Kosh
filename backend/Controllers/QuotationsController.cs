using Microsoft.AspNetCore.Mvc;
using DigitalErp.Api.Models;
using DigitalErp.Api.Services;

namespace DigitalErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuotationsController : ControllerBase
{
    private readonly QuotationService _service;
    public QuotationsController(QuotationService service) => _service = service;

    [HttpGet] public async Task<IActionResult> GetAll() => Ok(await _service.GetAll());
    [HttpGet("{id}")] public async Task<IActionResult> Get(int id) { var q = await _service.GetById(id); return q == null ? NotFound() : Ok(q); }
    [HttpPost] public async Task<IActionResult> Create([FromBody] Quotation q) { var id = await _service.Create(q); q.Id = id; return CreatedAtAction(nameof(Get), new { id }, q); }
    [HttpPatch("{id}/status")] public async Task<IActionResult> UpdateStatus(int id, [FromQuery] string status) => await _service.UpdateStatus(id, status) ? NoContent() : NotFound();
}
