using Microsoft.AspNetCore.Mvc;
using DigitalErp.Api.Services;

namespace DigitalErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _service;
    public DashboardController(DashboardService service) => _service = service;

    [HttpGet("admin-summary")]
    public async Task<IActionResult> GetAdminSummary()
    {
        return Ok(await _service.GetAdminDashboard());
    }
}
