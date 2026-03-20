using Microsoft.AspNetCore.Mvc;
using DigitalErp.Api.Models;
using DigitalErp.Api.Services;

namespace DigitalErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PricingController : ControllerBase
{
    private readonly PricingService _service;
    public PricingController(PricingService service) => _service = service;

    // Rates
    [HttpGet("rates")]
    public async Task<IActionResult> GetAllRates() => Ok(await _service.GetAllRates());

    [HttpGet("rates/{category}")]
    public async Task<IActionResult> GetRatesByCategory(string category) => Ok(await _service.GetRatesByCategory(category));

    [HttpPost("rates")]
    public async Task<IActionResult> AddRate([FromBody] PriceMaster rate)
    {
        var id = await _service.AddRate(rate);
        rate.Id = id;
        return Ok(rate);
    }

    [HttpPut("rates/{id}")]
    public async Task<IActionResult> UpdateRate(int id, [FromBody] PriceMaster rate)
    {
        rate.Id = id;
        var success = await _service.UpdateRate(rate);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpDelete("rates/{id}")]
    public async Task<IActionResult> DeleteRate(int id)
    {
        var success = await _service.DeleteRate(id);
        if (!success) return NotFound();
        return NoContent();
    }

    // Estimates
    [HttpPost("estimates")]
    public async Task<IActionResult> SaveEstimate([FromBody] EstimationRecord estimate)
    {
        var id = await _service.SaveEstimate(estimate);
        estimate.Id = id;
        return Ok(estimate);
    }

    [HttpGet("estimates/customer/{customerId}")]
    public async Task<IActionResult> GetByCustomer(int customerId) => Ok(await _service.GetByCustomer(customerId));

    [HttpGet("estimates/{id}")]
    public async Task<IActionResult> GetEstimateById(int id)
    {
        var estimate = await _service.GetById(id);
        if (estimate == null) return NotFound();
        return Ok(estimate);
    }
}
