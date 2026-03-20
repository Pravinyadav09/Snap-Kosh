using Microsoft.AspNetCore.Mvc;
using DigitalErp.Api.Models;
using DigitalErp.Api.Services;

namespace DigitalErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SpecializedInventoryController : ControllerBase
{
    private readonly SpecializedInventoryService _service;
    public SpecializedInventoryController(SpecializedInventoryService service) => _service = service;

    // Paper Stocks
    [HttpGet("paper")]
    public async Task<IActionResult> GetPaperStocks() => Ok(await _service.GetPaperStocks());

    [HttpGet("paper/{id}")]
    public async Task<IActionResult> GetPaperStock(int id)
    {
        var stock = await _service.GetPaperStock(id);
        if (stock == null) return NotFound();
        return Ok(stock);
    }

    [HttpPost("paper")]
    public async Task<IActionResult> AddPaperStock([FromBody] PaperStock stock)
    {
        var id = await _service.AddPaperStock(stock);
        stock.Id = id;
        return CreatedAtAction(nameof(GetPaperStock), new { id = id }, stock);
    }

    [HttpPut("paper/{id}")]
    public async Task<IActionResult> UpdatePaperStock(int id, [FromBody] PaperStock stock)
    {
        stock.Id = id;
        var success = await _service.UpdatePaperStock(stock);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpDelete("paper/{id}")]
    public async Task<IActionResult> DeletePaperStock(int id)
    {
        var success = await _service.DeletePaperStock(id);
        if (!success) return NotFound();
        return NoContent();
    }

    // Media Stocks
    [HttpGet("media")]
    public async Task<IActionResult> GetMediaStocks() => Ok(await _service.GetMediaStocks());

    [HttpGet("media/{id}")]
    public async Task<IActionResult> GetMediaStock(int id)
    {
        var stock = await _service.GetMediaStock(id);
        if (stock == null) return NotFound();
        return Ok(stock);
    }

    [HttpPost("media")]
    public async Task<IActionResult> AddMediaStock([FromBody] MediaStock stock)
    {
        var id = await _service.AddMediaStock(stock);
        stock.Id = id;
        return CreatedAtAction(nameof(GetMediaStock), new { id = id }, stock);
    }

    [HttpPut("media/{id}")]
    public async Task<IActionResult> UpdateMediaStock(int id, [FromBody] MediaStock stock)
    {
        stock.Id = id;
        var success = await _service.UpdateMediaStock(stock);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpDelete("media/{id}")]
    public async Task<IActionResult> DeleteMediaStock(int id)
    {
        var success = await _service.DeleteMediaStock(id);
        if (!success) return NotFound();
        return NoContent();
    }
}
