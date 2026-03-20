using Microsoft.AspNetCore.Mvc;
using DigitalErp.Api.Models;
using DigitalErp.Api.Services;

namespace DigitalErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly InventoryService _inventoryService;

    public InventoryController(InventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _inventoryService.GetAllInventory());
    }

    [HttpGet("lookup")]
    public async Task<IActionResult> GetLookup()
    {
        return Ok(await _inventoryService.GetLookup());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetItem(int id)
    {
        var item = await _inventoryService.GetItemDetails(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> AddItem([FromBody] InventoryItem item)
    {
        var id = await _inventoryService.AddNewItem(item);
        item.Id = id;
        return CreatedAtAction(nameof(GetItem), new { id = id }, item);
    }

    [HttpPost("{id}/stock")]
    public async Task<IActionResult> RecordStock(int id, [FromQuery] decimal quantity, [FromQuery] string type, [FromQuery] string refType = "Manual", [FromQuery] int? refId = null)
    {
        try
        {
            var success = await _inventoryService.RecordStockMovement(id, quantity, type, refType, refId);
            if (!success) return BadRequest("Failed to record transaction.");
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpGet("{id}/history")]
    public async Task<IActionResult> GetHistory(int id)
    {
        return Ok(await _inventoryService.GetItemHistory(id));
    }
}
