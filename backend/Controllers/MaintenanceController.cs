using Microsoft.AspNetCore.Mvc;
using DigitalErp.Api.Models;
using DigitalErp.Api.Services;

namespace DigitalErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MaintenanceController : ControllerBase
{
    private readonly MaintenanceService _service;
    public MaintenanceController(MaintenanceService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAll());

    [HttpGet("machine/{machineId}")]
    public async Task<IActionResult> GetByMachine(int machineId) => Ok(await _service.GetByMachine(machineId));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] MachineMaintenance maintenance)
    {
        var id = await _service.LogMaintenance(maintenance);
        maintenance.Id = id;
        return Ok(maintenance);
    }
}
