using Microsoft.AspNetCore.Mvc;
using DigitalErp.Api.Models;
using DigitalErp.Api.Services;

namespace DigitalErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobCardsController : ControllerBase
{
    private readonly JobCardService _jobCardService;

    public JobCardsController(JobCardService jobCardService)
    {
        _jobCardService = jobCardService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int size = 10, [FromQuery] string? search = null)
    {
        return Ok(await _jobCardService.GetJobsPaged(page, size, search));
    }

    [HttpGet("lookup")]
    public async Task<IActionResult> GetLookup()
    {
        return Ok(await _jobCardService.GetLookup());
    }

    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetByCustomer(int customerId)
    {
        return Ok(await _jobCardService.GetCustomerJobs(customerId));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var job = await _jobCardService.GetJobDetails(id);
        if (job == null) return NotFound();
        return Ok(job);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] JobCard jobCard)
    {
        var id = await _jobCardService.CreateJobCard(jobCard);
        jobCard.Id = id;
        return CreatedAtAction(nameof(GetById), new { id = id }, jobCard);
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromQuery] string status)
    {
        var success = await _jobCardService.UpdateJobStatus(id, status);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPatch("{id}/design-file")]
    public async Task<IActionResult> UpdateDesignFile(int id, [FromQuery] string filePath)
    {
        var success = await _jobCardService.UpdateDesignFile(id, filePath);
        if (!success) return NotFound();
        return Ok(new { Message = "Design file updated successfully." });
    }

    [HttpPost("{id}/dispatch")]
    public async Task<IActionResult> Dispatch(int id, [FromQuery] int qty, [FromQuery] string mode, [FromQuery] string? trackingRef)
    {
        var success = await _jobCardService.DispatchJob(id, qty, mode, trackingRef ?? string.Empty);
        if (!success) return NotFound();
        return Ok(new { Message = "Dispatch recorded successfully." });
    }
}
