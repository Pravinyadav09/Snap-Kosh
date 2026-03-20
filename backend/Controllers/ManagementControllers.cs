using Microsoft.AspNetCore.Mvc;
using DigitalErp.Api.Models;
using DigitalErp.Api.Services;

namespace DigitalErp.Api.Controllers;

// ── Expense Categories ──
[ApiController]
[Route("api/expense-categories")]
public class ExpenseCategoriesController : ControllerBase
{
    private readonly ManagementService _service;
    public ExpenseCategoriesController(ManagementService service) => _service = service;

    [HttpGet] public async Task<IActionResult> GetAll() => Ok(await _service.GetCategories());
    
    [HttpGet("lookup")]
    public async Task<IActionResult> GetLookup() => Ok(await _service.GetCategoryLookup());

    [HttpPost] public async Task<IActionResult> Create([FromBody] ExpenseCategory c) { var id = await _service.AddCategory(c); c.Id = id; return Ok(c); }
    [HttpDelete("{id}")] public async Task<IActionResult> Delete(int id) => await _service.DeleteCategory(id) ? NoContent() : NotFound();
}

// ── Process Masters ──
[ApiController]
[Route("api/processes")]
public class ProcessMastersController : ControllerBase
{
    private readonly ManagementService _service;
    public ProcessMastersController(ManagementService service) => _service = service;

    [HttpGet] public async Task<IActionResult> GetAll() => Ok(await _service.GetProcesses());

    [HttpGet("lookup")] 
    public async Task<IActionResult> GetLookup() => Ok(await _service.GetProcessLookup());

    [HttpPost] public async Task<IActionResult> Create([FromBody] ProcessMaster p) { var id = await _service.AddProcess(p); p.Id = id; return Ok(p); }
    [HttpPut("{id}")] public async Task<IActionResult> Update(int id, [FromBody] ProcessMaster p) { p.Id = id; return await _service.UpdateProcess(p) ? NoContent() : NotFound(); }
    [HttpDelete("{id}")] public async Task<IActionResult> Delete(int id) => await _service.DeleteProcess(id) ? NoContent() : NotFound();
}

// ── Users ──
[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly ManagementService _service;
    public UsersController(ManagementService service) => _service = service;

    [HttpGet] public async Task<IActionResult> GetAll() => Ok(await _service.GetUsers());
    [HttpGet("{id}")] public async Task<IActionResult> Get(int id) { var u = await _service.GetUser(id); return u == null ? NotFound() : Ok(u); }
    [HttpPost] public async Task<IActionResult> Create([FromBody] AppUser u) { var id = await _service.AddUser(u); u.Id = id; return Ok(u); }
    [HttpPut("{id}")] public async Task<IActionResult> Update(int id, [FromBody] AppUser u) { u.Id = id; return await _service.UpdateUser(u) ? NoContent() : NotFound(); }
    [HttpDelete("{id}")] public async Task<IActionResult> Delete(int id) => await _service.DeleteUser(id) ? NoContent() : NotFound();
}

// ── Roles ──
[ApiController]
[Route("api/roles")]
public class RolesController : ControllerBase
{
    private readonly ManagementService _service;
    public RolesController(ManagementService service) => _service = service;

    [HttpGet] public async Task<IActionResult> GetAll() => Ok(await _service.GetRoles());
    [HttpPost] public async Task<IActionResult> Create([FromBody] Role r) { var id = await _service.AddRole(r); r.Id = id; return Ok(r); }
    [HttpPut("{id}")] public async Task<IActionResult> Update(int id, [FromBody] Role r) { r.Id = id; return await _service.UpdateRole(r) ? NoContent() : NotFound(); }
    [HttpDelete("{id}")] public async Task<IActionResult> Delete(int id) => await _service.DeleteRole(id) ? NoContent() : NotFound();
}

// ── Settings ──
[ApiController]
[Route("api/settings")]
public class SettingsController : ControllerBase
{
    private readonly ManagementService _service;
    public SettingsController(ManagementService service) => _service = service;

    [HttpGet] public async Task<IActionResult> GetAll() => Ok(await _service.GetSettings());
    [HttpPost] public async Task<IActionResult> Save([FromBody] AppSetting s) => await _service.SaveSetting(s) ? Ok(s) : BadRequest();
}
